import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { DownloadIcon, SparklesIcon, SpinnerIcon, PencilIcon } from './components/Icons';
import { RefinePanel } from './components/RefinePanel';
import { swapCharactersInImage, inpaintImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { ImageEditor } from './components/ImageEditor';

const App: React.FC = () => {
  const [sceneImage, setSceneImage] = useState<File | null>(null);
  const [characterImage, setCharacterImage] = useState<File | null>(null);

  const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultImageBase64, setResultImageBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  // State for refinement controls
  const [characterScale, setCharacterScale] = useState('Medium');
  const [sceneComposition, setSceneComposition] = useState('Medium Shot');
  const [characterAction, setCharacterAction] = useState('');
  const [artStyle, setArtStyle] = useState('Photorealistic');
  const [timeOfDay, setTimeOfDay] = useState('As in Scene');
  const [atmosphere, setAtmosphere] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [removeWatermark, setRemoveWatermark] = useState(false);


  const loadingMessages = [
    "Analyzing scene composition...",
    "Isolating character elements...",
    "Harmonizing light and shadow...",
    "Blending textures seamlessly...",
    "Applying final artistic touches...",
    "Almost there, polishing the details..."
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let i = 0;
      setLoadingMessage(loadingMessages[i]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleSceneImageUpload = (file: File) => {
    setSceneImage(file);
    setSceneImageUrl(URL.createObjectURL(file));
  };

  const handleCharacterImageUpload = (file: File) => {
    setCharacterImage(file);
    setCharacterImageUrl(URL.createObjectURL(file));
  };

  const handleGenerate = useCallback(async () => {
    if (!sceneImage || !characterImage) {
      setError("Please upload both a scene and a character image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImage(null);
    setResultImageBase64(null);

    try {
      const [sceneImageResult, characterImageResult] = await Promise.all([
        fileToBase64(sceneImage),
        fileToBase64(characterImage)
      ]);

      const result = await swapCharactersInImage({
        sceneImageBase64: sceneImageResult.base64,
        sceneMimeType: sceneImageResult.mimeType,
        characterImageBase64: characterImageResult.base64,
        characterMimeType: characterImageResult.mimeType,
        characterScale,
        sceneComposition,
        characterAction,
        artStyle,
        timeOfDay,
        atmosphere,
        negativePrompt,
        aspectRatio,
        removeWatermark,
      });
      
      setResultImageBase64(result);
      setResultImage(`data:image/png;base64,${result}`);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [sceneImage, characterImage, characterScale, sceneComposition, characterAction, artStyle, timeOfDay, atmosphere, negativePrompt, aspectRatio, removeWatermark]);
  
  const handleInpaint = useCallback(async (imageBase64: string, maskBase64: string) => {
    setIsLoading(true);
    setError(null);
    setIsEditing(false);
    setLoadingMessage("Applying your edits with AI...");

    try {
        const result = await inpaintImage({
            imageBase64: imageBase64,
            imageMimeType: 'image/png', // The generated image is always PNG
            maskBase64: maskBase64,
            maskMimeType: 'image/png' // Our editor mask is always PNG
        });
        setResultImageBase64(result);
        setResultImage(`data:image/png;base64,${result}`);
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? `Editing failed: ${err.message}` : "An unknown error occurred during editing.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  return (
    <>
      {isEditing && resultImage && resultImageBase64 && (
        <ImageEditor
            imageUrl={resultImage}
            imageBase64={resultImageBase64}
            onSave={handleInpaint}
            onClose={() => setIsEditing(false)}
            isSaving={isLoading}
        />
      )}
      <div className="min-h-screen w-full flex flex-col items-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
        <main className="w-full max-w-7xl mx-auto space-y-8">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              AI Scene Fusion
            </h1>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
              Swap characters between images. Upload a scene, add a character, refine the details, and let our AI create a seamless new reality.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ImageUploader 
              id="scene-uploader"
              title="Step 1: Upload Scene"
              description="The background and environment."
              onFileSelect={handleSceneImageUpload}
              previewUrl={sceneImageUrl}
            />
            <ImageUploader
              id="character-uploader"
              title="Step 2: Upload Character"
              description="The person or object to add."
              onFileSelect={handleCharacterImageUpload}
              previewUrl={characterImageUrl}
            />
            <RefinePanel
              characterScale={characterScale}
              onCharacterScaleChange={setCharacterScale}
              sceneComposition={sceneComposition}
              onSceneCompositionChange={setSceneComposition}
              characterAction={characterAction}
              onCharacterActionChange={setCharacterAction}
              artStyle={artStyle}
              onArtStyleChange={setArtStyle}
              timeOfDay={timeOfDay}
              onTimeOfDayChange={setTimeOfDay}
              atmosphere={atmosphere}
              onAtmosphereChange={setAtmosphere}
              negativePrompt={negativePrompt}
              onNegativePromptChange={setNegativePrompt}
              aspectRatio={aspectRatio}
              onAspectRatioChange={setAspectRatio}
              removeWatermark={removeWatermark}
              onRemoveWatermarkChange={setRemoveWatermark}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              canGenerate={!!sceneImage && !!characterImage}
            />
            
            <div className="lg:col-span-3 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[30rem] flex flex-col items-center justify-center">
              {isLoading && !isEditing && (
                <div className="text-center">
                  <SpinnerIcon className="w-12 h-12 mx-auto text-blue-600" />
                  <p className="mt-4 text-lg font-medium text-slate-700">{loadingMessage}</p>
                  <p className="text-slate-500 mt-1">This may take a moment...</p>
                </div>
              )}
              {error && !isLoading && (
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                  <p className="font-semibold">Generation Failed</p>
                  <p>{error}</p>
                </div>
              )}
              {!isLoading && resultImage && (
                <div className="w-full flex flex-col items-center gap-6">
                    <h3 className="text-2xl font-bold text-slate-800">Your Fused Image</h3>
                    <img src={resultImage} alt="Generated scene" className="rounded-lg shadow-lg max-w-full max-h-[70vh] object-contain" />
                    <div className="flex items-center justify-center gap-4 mt-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-purple-600 rounded-xl shadow-md transition-all duration-300 hover:bg-purple-700 hover:scale-105"
                      >
                        <PencilIcon />
                        Edit Image
                      </button>
                      <a
                        href={resultImage}
                        download="ai-scene-fusion.png"
                        className="flex items-center justify-center gap-2 px-5 py-3 font-semibold text-white bg-green-600 rounded-xl shadow-md transition-all duration-300 hover:bg-green-700 hover:scale-105"
                      >
                        <DownloadIcon />
                        Download Image
                      </a>
                    </div>
                </div>
              )}
              {!isLoading && !resultImage && !error && (
                <div className="text-center text-slate-500">
                  <SparklesIcon className="w-12 h-12 mx-auto text-slate-400"/>
                  <p className="mt-4 text-lg font-medium">Your new image will appear here</p>
                  <p>Complete the steps above and click "Fuse Images" to begin.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
