import { useRef } from 'react';
import {
  Upload,
  Sparkles,
  Share2,
  Download,
  Gift,
  Type as TypeIcon,
  ImageIcon,
} from 'lucide-react';

interface ControlPanelProps {
  name: string;
  onNameChange: (name: string) => void;
  onPhotoUpload: (dataUrl: string) => void;
  onInspire: () => void;
  onShare: () => void;
  onDownload: () => void;
  onWatchAd: () => void;
  watermarkRemoved: boolean;
  isProcessing: boolean;
  isInspiring: boolean;
  hasPhoto: boolean;
}

export default function ControlPanel({
  name,
  onNameChange,
  onPhotoUpload,
  onInspire,
  onShare,
  onDownload,
  onWatchAd,
  watermarkRemoved,
  isProcessing,
  isInspiring,
  hasPhoto,
}: ControlPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') onPhotoUpload(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3.5">
      {/* Photo Upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-slate-800/80 py-3.5 font-semibold text-white transition hover:border-sky-400/60 hover:bg-slate-700/80 active:scale-[0.98]"
      >
        {hasPhoto ? <ImageIcon className="h-5 w-5 text-sky-400" /> : <Upload className="h-5 w-5 text-sky-400" />}
        {hasPhoto ? 'Change Photo' : 'Upload Your Photo'}
      </button>

      {/* Name Input */}
      <div className="relative">
        <TypeIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Type your name here..."
          maxLength={30}
          className="w-full rounded-xl border border-white/15 bg-slate-800/80 py-3.5 pl-11 pr-4 font-medium text-white placeholder:text-slate-500 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
        />
      </div>

      {/* Inspire Wish */}
      <button
        onClick={onInspire}
        disabled={isProcessing || isInspiring}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 py-3.5 font-bold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-cyan-400 active:scale-[0.98] disabled:opacity-50"
      >
        {isInspiring ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Inspire Wish
          </>
        )}
      </button>

      {/* Share + Download row */}
      <div className="flex gap-3">
        <button
          onClick={onShare}
          disabled={isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-50"
        >
          <Share2 className="h-4.5 w-4.5" />
          <span className="text-sm">WhatsApp Status</span>
        </button>
        <button
          onClick={onDownload}
          disabled={isProcessing}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-500 py-3.5 font-bold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 active:scale-[0.98] disabled:opacity-50"
        >
          <Download className="h-4.5 w-4.5" />
          <span className="text-sm">Download PNG</span>
        </button>
      </div>

      {/* Remove Watermark */}
      {!watermarkRemoved && (
        <button
          onClick={onWatchAd}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-3 font-semibold text-amber-300 transition hover:bg-amber-500/20 active:scale-[0.98]"
        >
          <Gift className="h-5 w-5" />
          Watch Ad to Remove Watermark
        </button>
      )}
    </div>
  );
}
