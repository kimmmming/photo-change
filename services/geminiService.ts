import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash-image-preview';

interface SwapParams {
  sceneImageBase64: string;
  sceneMimeType: string;
  characterImageBase64: string;
  characterMimeType: string;
  characterScale: string;
  sceneComposition: string;
  characterAction: string;
  artStyle: string;
  timeOfDay: string;
  atmosphere: string;
  negativePrompt: string;
  aspectRatio: string;
  removeWatermark: boolean;
}

interface InpaintParams {
    imageBase64: string;
    imageMimeType: string;
    maskBase64: string;
    maskMimeType: string;
}

/**
 * Swaps a character from one image into the scene of another with detailed refinements.
 * @param params An object containing image data and refinement options.
 * @returns A promise that resolves to the base64 encoded string of the resulting image.
 */
export async function swapCharactersInImage(params: SwapParams): Promise<string> {
  const {
    sceneImageBase64,
    sceneMimeType,
    characterImageBase64,
    characterMimeType,
    characterScale,
    sceneComposition,
    characterAction,
    artStyle,
    timeOfDay,
    atmosphere,
    negativePrompt,
    aspectRatio,
    removeWatermark,
  } = params;

  let styleInstruction = `**Art Style:** The final image should have a ${artStyle} style.`;
  if (artStyle.toLowerCase() === 'photorealistic') {
      styleInstruction += " Pay extreme attention to matching lighting, shadows, perspective, and color grading between the character and the scene to ensure a completely natural and elegant composition with no visual artifacts.";
  }

  const timeInstruction = timeOfDay !== 'As in Scene' ? `**Time of Day:** The lighting should reflect ${timeOfDay}.` : '';
  const atmosphereInstruction = atmosphere ? `**Atmosphere:** The overall mood should be ${atmosphere}.` : '';
  const negativeInstruction = negativePrompt ? `**Exclusions:** Do not include the following elements in the image: ${negativePrompt}.` : '';
  const aspectRatioInstruction = `**Aspect Ratio:** The final image must have an aspect ratio of ${aspectRatio}.`;
  const watermarkInstruction = removeWatermark ? `**Watermark Removal:** Identify and completely remove any watermarks, logos, or signatures from the source images. The final output must be clean.` : '';
    
  const prompt = `
    This is a highly detailed image editing task. You are provided with two images.
    1. The first image is the background scene.
    2. The second image contains a character.

    Your task is to create a new, cohesive image with the following requirements:
    - Use the first image as the primary background. Remove any existing people or main subjects from it.
    - Extract only the primary character from the second image.
    - Seamlessly integrate the character into the background scene.
    ${watermarkInstruction}

    **Creative Direction:**
    ${styleInstruction}
    ${timeInstruction}
    ${atmosphereInstruction}

    **Composition Details:**
    ${aspectRatioInstruction}
    - **Scene Composition:** The final image should be a ${sceneComposition}.
    - **Character Scale:** The character should appear ${characterScale} relative to the scene.
    - **Character Action:** The character should be depicted ${characterAction || 'naturally placed in the environment'}.

    ${negativeInstruction}

    The final output must be a single, high-quality image that perfectly merges the character into the scene according to all the specifications above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: sceneImageBase64, mimeType: sceneMimeType } },
          { inlineData: { data: characterImageBase64, mimeType: characterMimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
    }

    throw new Error("The AI did not return an image. It might have refused the request due to safety policies or an inability to process the images.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling the Gemini API.");
  }
}

/**
 * Fills in a masked area of an image using AI inpainting.
 * @param params An object containing the original image and the mask image.
 * @returns A promise that resolves to the base64 encoded string of the inpainted image.
 */
export async function inpaintImage(params: InpaintParams): Promise<string> {
    const { imageBase64, imageMimeType, maskBase64, maskMimeType } = params;

    const prompt = `
      You are an expert in photo restoration and editing.
      The user has provided an image and a corresponding mask image.
      Your task is to perform an inpainting operation.
      The area of the image corresponding to the black area in the mask needs to be removed.
      You must then seamlessly and realistically fill in the removed area with new content that matches the surrounding context, lighting, textures, and overall style of the original image.
      Do not alter any parts of the image that are not covered by the mask.
      The final output must be a single, high-quality, edited image.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType: imageMimeType } },
                    { inlineData: { data: maskBase64, mimeType: maskMimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }

        throw new Error("The AI did not return an edited image. It may have refused the request.");

    } catch (error) {
        console.error("Error calling Gemini API for inpainting:", error);
        if (error instanceof Error) {
            throw new Error(`Inpainting failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during the inpainting API call.");
    }
}
