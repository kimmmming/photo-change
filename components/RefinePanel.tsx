import React from 'react';
import { SparklesIcon, SpinnerIcon } from './Icons';

interface RefinePanelProps {
  characterScale: string;
  onCharacterScaleChange: (value: string) => void;
  sceneComposition: string;
  onSceneCompositionChange: (value: string) => void;
  characterAction: string;
  onCharacterActionChange: (value: string) => void;
  artStyle: string;
  onArtStyleChange: (value: string) => void;
  timeOfDay: string;
  onTimeOfDayChange: (value: string) => void;
  atmosphere: string;
  onAtmosphereChange: (value: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (value: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (value: string) => void;
  removeWatermark: boolean;
  onRemoveWatermarkChange: (value: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canGenerate: boolean;
}

const scaleOptions = ['Small', 'Medium', 'Large'];
const compositionOptions = ['Close-up', 'Medium Shot', 'Wide Shot'];
const artStyleOptions = ['Photorealistic', 'Cinematic', 'Anime', 'Oil Painting', 'Watercolor', 'Vintage Photo'];
const timeOfDayOptions = ['As in Scene', 'Daylight', 'Golden Hour', 'Twilight', 'Night', 'Overcast'];
const aspectRatioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export const RefinePanel: React.FC<RefinePanelProps> = ({
  characterScale, onCharacterScaleChange,
  sceneComposition, onSceneCompositionChange,
  characterAction, onCharacterActionChange,
  artStyle, onArtStyleChange,
  timeOfDay, onTimeOfDayChange,
  atmosphere, onAtmosphereChange,
  negativePrompt, onNegativePromptChange,
  aspectRatio, onAspectRatioChange,
  removeWatermark, onRemoveWatermarkChange,
  onGenerate,
  isLoading,
  canGenerate,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h3 className="text-xl font-bold text-slate-800">Step 3: Refine & Generate</h3>
        <p className="text-slate-500">Describe the desired outcome.</p>
      </div>

      <div className="space-y-4 flex-grow">
        {/* Composition Group */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-2">
                {aspectRatioOptions.map(opt => (
                    <button 
                        key={opt}
                        onClick={() => onAspectRatioChange(opt)}
                        className={`px-2 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                            aspectRatio === opt 
                            ? 'bg-blue-600 text-white shadow' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="character-scale" className="block text-sm font-medium text-slate-700 mb-1">Character Scale</label>
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    {scaleOptions.map(opt => <span key={opt}>{opt}</span>)}
                </div>
                <input id="character-scale" type="range" min="0" max="2" step="1" value={scaleOptions.indexOf(characterScale)} onChange={(e) => onCharacterScaleChange(scaleOptions[parseInt(e.target.value)])} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
            <div>
                <label htmlFor="scene-composition" className="block text-sm font-medium text-slate-700 mb-1">Scene Composition</label>
                <div className="flex justify-between text-xs text-slate-500 px-1">
                    {compositionOptions.map(opt => <span key={opt}>{opt}</span>)}
                </div>
                <input id="scene-composition" type="range" min="0" max="2" step="1" value={compositionOptions.indexOf(sceneComposition)} onChange={(e) => onSceneCompositionChange(compositionOptions[parseInt(e.target.value)])} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
            </div>
        </div>

        <hr className="!my-5 border-slate-200" />

        {/* Style Group */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="art-style" className="block text-sm font-medium text-slate-700 mb-1">Art Style</label>
                <select id="art-style" value={artStyle} onChange={e => onArtStyleChange(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                    {artStyleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="time-of-day" className="block text-sm font-medium text-slate-700 mb-1">Time of Day</label>
                <select id="time-of-day" value={timeOfDay} onChange={e => onTimeOfDayChange(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm">
                    {timeOfDayOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        </div>
        <div>
          <label htmlFor="atmosphere" className="block text-sm font-medium text-slate-700 mb-1">Atmosphere</label>
          <textarea id="atmosphere" rows={1} value={atmosphere} onChange={(e) => onAtmosphereChange(e.target.value)} placeholder="e.g., dreamy and serene..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" />
        </div>

        <hr className="!my-5 border-slate-200" />

        {/* Content Group */}
        <div>
          <label htmlFor="character-action" className="block text-sm font-medium text-slate-700 mb-1">Character Action</label>
          <textarea id="character-action" rows={1} value={characterAction} onChange={(e) => onCharacterActionChange(e.target.value)} placeholder="e.g., looking at the sky..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" />
        </div>
        <div>
          <label htmlFor="negative-prompt" className="block text-sm font-medium text-slate-700 mb-1">Negative Prompt <span className="text-slate-400">(Optional)</span></label>
          <textarea id="negative-prompt" rows={1} value={negativePrompt} onChange={(e) => onNegativePromptChange(e.target.value)} placeholder="e.g., text, watermarks, ugly..." className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm" />
        </div>
      </div>
      
      <div className="mt-auto pt-6">
        <div className="flex items-center justify-center mb-4">
            <input 
                id="remove-watermark" 
                type="checkbox" 
                checked={removeWatermark} 
                onChange={e => onRemoveWatermarkChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remove-watermark" className="ml-2 text-sm font-medium text-slate-700">
                Attempt to remove watermarks
            </label>
        </div>

        <button
          onClick={onGenerate}
          disabled={!canGenerate || isLoading}
          className="flex items-center justify-center gap-3 w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl shadow-lg transition-all duration-300 ease-in-out enabled:hover:bg-blue-700 enabled:hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-md"
        >
          {isLoading ? ( <> <SpinnerIcon /> Generating... </> ) : ( <> <SparklesIcon /> Fuse Images </> )}
        </button>
      </div>
    </div>
  );
};