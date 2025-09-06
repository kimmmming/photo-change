import React, { useRef, useEffect, useState } from 'react';
import { SpinnerIcon } from './Icons';

interface ImageEditorProps {
  imageUrl: string;
  imageBase64: string;
  onSave: (originalImageBase64: string, maskBase64: string) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, imageBase64, onSave, onClose, isSaving }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null); // Hidden canvas for the mask
  const isDrawing = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const [brushSize, setBrushSize] = useState(40);

  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const maskCtx = maskCanvas?.getContext('2d');
    if (!canvas || !ctx || !maskCanvas || !maskCtx) return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      // Fit image within a max dimension for editor performance
      const MAX_DIM = 1024;
      let { width, height } = image;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = (height / width) * MAX_DIM;
          width = MAX_DIM;
        } else {
          width = (width / height) * MAX_DIM;
          height = MAX_DIM;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;

      // Draw original image on visible canvas
      ctx.drawImage(image, 0, 0, width, height);
      
      // Initialize mask canvas with a white background (indicating no mask)
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, width, height);
    };
  }, [imageUrl]);

  const getCoordinates = (e: React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    // Scale mouse coordinates to match canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const maskCtx = maskCanvas?.getContext('2d');
    const coords = getCoordinates(e);

    if (!ctx || !maskCtx || !coords) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';

    const drawOnCanvas = (context: CanvasRenderingContext2D, color: string) => {
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.beginPath();
        if(lastPosition.current){
             context.moveTo(lastPosition.current.x, lastPosition.current.y);
        } else {
             context.moveTo(coords.x, coords.y);
        }
        context.lineTo(coords.x, coords.y);
        context.stroke();
    }
    
    // Draw semi-transparent black on visible canvas for user feedback
    drawOnCanvas(ctx, 'rgba(0, 0, 0, 0.5)');
    // Draw solid black on hidden mask canvas
    drawOnCanvas(maskCtx, 'black');

    lastPosition.current = coords;
  };

  const startDrawing = (e: React.MouseEvent) => {
    isDrawing.current = true;
    lastPosition.current = getCoordinates(e);
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPosition.current = null;
  };
  
  const handleSave = () => {
    if(!maskCanvasRef.current) return;
    const maskBase64 = maskCanvasRef.current.toDataURL('image/png').split(',')[1];
    onSave(imageBase64, maskBase64);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl flex flex-col max-h-[95vh]">
        <div className="flex-shrink-0 mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Edit Image</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        
        <div className="flex-grow flex items-center justify-center overflow-auto my-4">
             <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair max-w-full max-h-full object-contain rounded-lg"
            />
            {/* Hidden canvas for the mask */}
            <canvas ref={maskCanvasRef} style={{ display: 'none' }}/>
        </div>

        <div className="flex-shrink-0 mt-4 space-y-4">
            <div className="flex items-center gap-4">
                <label htmlFor="brush-size" className="text-sm font-medium text-slate-700">Brush Size:</label>
                <input
                    id="brush-size"
                    type="range"
                    min="5"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                 <span className="text-sm w-8 text-center font-mono">{brushSize}</span>
            </div>
            <div className="flex justify-end items-center gap-4">
                <button 
                    onClick={onClose} 
                    disabled={isSaving}
                    className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
                >
                   {isSaving ? <><SpinnerIcon className="w-4 h-4" /> Applying...</> : 'Save Changes'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};