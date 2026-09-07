import { forwardRef } from 'react';
import { CANVAS_W, CANVAS_H } from '@/hooks/usePosterCanvas';

interface PosterCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  className?: string;
}

/**
 * Displays the 1080x1920 canvas scaled to fit the container width while
 * preserving the 9:16 aspect ratio.
 */
const PosterCanvas = forwardRef<HTMLCanvasElement, PosterCanvasProps>(
  ({ canvasRef, className = '' }, _ref) => {
    return (
      <div
        className={`relative w-full ${className}`}
        style={{ aspectRatio: '9 / 16' }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="h-full w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/10"
        />
      </div>
    );
  },
);

PosterCanvas.displayName = 'PosterCanvas';
export default PosterCanvas;
