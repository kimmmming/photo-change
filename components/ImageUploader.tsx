import React, { useRef } from 'react';
import { UploadIcon, ReplaceIcon } from './Icons';

interface ImageUploaderProps {
  id: string;
  title: string;
  description: string;
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, title, description, onFileSelect, previewUrl }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex-shrink-0">
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="text-slate-500">{description}</p>
      </div>
      <div className="flex-grow mt-4">
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        {!previewUrl ? (
          <div 
            onClick={handleContainerClick}
            className="h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300 hover:bg-slate-50 hover:border-blue-500"
          >
            <UploadIcon className="w-10 h-10 text-slate-400 mb-2"/>
            <p className="font-semibold text-slate-700">Click to upload</p>
            <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
          </div>
        ) : (
          <div className="relative w-full h-full group">
            <img 
              src={previewUrl} 
              alt="Image preview" 
              className="w-full h-full object-contain rounded-xl"
            />
            <div 
              onClick={handleContainerClick}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center rounded-xl cursor-pointer"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 text-slate-800 font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ReplaceIcon />
                Change Image
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};