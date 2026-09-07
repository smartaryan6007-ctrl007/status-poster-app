import { useCallback, useEffect, useRef, useState } from 'react';
import type { PosterState } from '@/types';

const CANVAS_W = 1080;
const CANVAS_H = 1920;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Parse a CSS linear-gradient overlay into a fillStyle we can draw on canvas. */
function gradientFromOverlay(overlay: string): string | CanvasGradient {
  const match = overlay.match(/linear-gradient\(\s*(\d+)deg\s*,(.+)\)/);
  if (!match) return 'rgba(0,0,0,0.5)';
  const angle = parseInt(match[1], 10);
  const stopsRaw = match[2];

  // Convert deg to canvas gradient endpoints
  const rad = ((angle - 90) * Math.PI) / 180;
  const x0 = CANVAS_W / 2 - (Math.cos(rad) * CANVAS_W) / 2;
  const y0 = CANVAS_H / 2 - (Math.sin(rad) * CANVAS_H) / 2;
  const x1 = CANVAS_W / 2 + (Math.cos(rad) * CANVAS_W) / 2;
  const y1 = CANVAS_H / 2 + (Math.sin(rad) * CANVAS_H) / 2;

  const grad = ctxGradient(x0, y0, x1, y1);

  // Parse stops like "rgba(26,10,3,0.15) 0%, rgba(26,10,3,0.55) 55%"
  const stopRegex = /rgba?\([^)]+\)\s+(\d+(?:\.\d+)?)%/g;
  let m: RegExpExecArray | null;
  while ((m = stopRegex.exec(stopsRaw)) !== null) {
    const colorMatch = m[0].match(/rgba?\([^)]+\)/);
    if (colorMatch) {
      grad.addColorStop(parseFloat(m[1]) / 100, colorMatch[0]);
    }
  }
  return grad;
}

// Workaround: CanvasGradient needs a 2d context to be created.
// We create a lazy one.
let _ctxForGrad: CanvasRenderingContext2D | null = null;
function ctxGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
  if (!_ctxForGrad) {
    const c = document.createElement('canvas');
    _ctxForGrad = c.getContext('2d');
  }
  return _ctxForGrad!.createLinearGradient(x0, y0, x1, y1);
}

/** Crop-and-cover draw: draws image to fill a target rect preserving aspect (object-fit: cover). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const imgRatio = img.width / img.height;
  const targetRatio = dw / dh;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    // image wider — crop sides
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    // image taller — crop top/bottom
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** Draw image into a circular clip. */
function drawCircleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number, cy: number, diameter: number,
) {
  const r = diameter / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  drawCover(ctx, img, cx - r, cy - r, diameter, diameter);
  ctx.restore();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  ctx.font = font;
  const lines: string[] = [];
  // respect explicit newlines first
  const paragraphs = text.split('\n');
  for (const para of paragraphs) {
    const words = para.split(' ');
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerY: number,
  font: string,
  color: string,
  lineHeight: number,
  maxWidth: number,
  shadow: boolean,
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;
  }
  const totalH = lines.length * lineHeight;
  const startY = centerY - totalH / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    // truncate if too wide
    let text = line;
    while (ctx.measureText(text).width > maxWidth && text.length > 1) {
      text = text.slice(0, -1);
    }
    ctx.fillText(text, CANVAS_W / 2, startY + i * lineHeight);
  });
  ctx.restore();
}

export interface UsePosterCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  render: () => Promise<void>;
  toBlob: () => Promise<Blob | null>;
  toDataURL: () => string | null;
  isReady: boolean;
}

export function usePosterCanvas(state: PosterState): UsePosterCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const drawPoster = useCallback(async (ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const tpl = s.template;

    // Clear
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // 1) Background image
    try {
      const bgImg = await loadImage(tpl.bgUrl);
      drawCover(ctx, bgImg, 0, 0, CANVAS_W, CANVAS_H);
    } catch {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // 2) Overlay gradient for readability
    const gradFill = gradientFromOverlay(tpl.overlay);
    ctx.fillStyle = gradFill;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 3) Photo frame
    const frame = tpl.photoFrame;
    const frameW = (frame.w / 100) * CANVAS_W;
    const frameH = (frame.h / 100) * CANVAS_H;
    const frameCx = (frame.cx / 100) * CANVAS_W;
    const frameCy = (frame.cy / 100) * CANVAS_H;

    // Frame background circle (decorative ring)
    const frameDiameter = Math.min(frameW, frameH);
    const ringR = frameDiameter / 2 + 12;
    ctx.save();
    ctx.beginPath();
    ctx.arc(frameCx, frameCy, ringR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = tpl.accent;
    ctx.stroke();
    ctx.restore();

    // User photo (if any)
    if (s.photo) {
      try {
        const photoImg = await loadImage(s.photo);
        drawCircleImage(ctx, photoImg, frameCx, frameCy, frameDiameter);
      } catch {
        // draw placeholder
        ctx.save();
        ctx.beginPath();
        ctx.arc(frameCx, frameCy, frameDiameter / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
        ctx.restore();
      }
    } else {
      // empty frame hint
      ctx.save();
      ctx.beginPath();
      ctx.arc(frameCx, frameCy, frameDiameter / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.fill();
      ctx.restore();
    }

    // 4) Title (greeting)
    const titleFont = `bold ${Math.round(CANVAS_H * 0.045)}px Georgia, serif`;
    drawCenteredLines(
      ctx,
      [tpl.title],
      (tpl.titlePosition.y / 100) * CANVAS_H,
      titleFont,
      '#FFFFFF',
      Math.round(CANVAS_H * 0.06),
      CANVAS_W * 0.85,
      true,
    );

    // 5) Decorative accent line under title
    const lineY = (tpl.titlePosition.y / 100) * CANVAS_H + CANVAS_H * 0.035;
    ctx.save();
    ctx.fillStyle = tpl.accent;
    ctx.fillRect(CANVAS_W / 2 - 80, lineY, 160, 5);
    ctx.restore();

    // 6) Wish text
    if (s.wish) {
      const wishFont = `italic ${Math.round(CANVAS_H * 0.028)}px Georgia, serif`;
      const wishLines = wrapText(ctx, s.wish, CANVAS_W * 0.80, wishFont);
      drawCenteredLines(
        ctx,
        wishLines,
        (tpl.wishPosition.y / 100) * CANVAS_H,
        wishFont,
        'rgba(255,255,255,0.92)',
        Math.round(CANVAS_H * 0.04),
        CANVAS_W * 0.80,
        true,
      );
    }

    // 7) Name at bottom
    if (s.name.trim()) {
      const nameText = `— ${s.name.trim()}`;
      const nameFont = `bold ${Math.round(CANVAS_H * 0.025)}px Arial, sans-serif`;
      drawCenteredLines(
        ctx,
        [nameText],
        (tpl.namePosition.y / 100) * CANVAS_H,
        nameFont,
        tpl.accent,
        Math.round(CANVAS_H * 0.035),
        CANVAS_W * 0.80,
        false,
      );
    }

    // 8) Watermark (if not removed)
    if (!s.watermarkRemoved) {
      ctx.save();
      ctx.font = `${Math.round(CANVAS_H * 0.018)}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Created with StatusMaker', CANVAS_W - 30, CANVAS_H - 30);
      ctx.restore();
    }
  }, []);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await drawPoster(ctx);
    setIsReady(true);
  }, [drawPoster]);

  // Auto-re-render whenever state changes
  useEffect(() => {
    render();
  }, [render, state]);

  const toBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }, []);

  const toDataURL = useCallback((): string | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  }, []);

  return { canvasRef, render, toBlob, toDataURL, isReady };
}

export { CANVAS_W, CANVAS_H };
