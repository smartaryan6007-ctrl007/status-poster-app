import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface AdModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AD_DURATION = 5; // seconds

export default function AdModal({ open, onClose, onComplete }: AdModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    setSecondsLeft(AD_DURATION);
    setFinished(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-800 ring-1 ring-white/15 shadow-2xl overflow-hidden">
        {/* Fake ad banner */}
        <div className="relative h-48 bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 flex flex-col items-center justify-center">
          <div className="absolute top-3 left-3 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Ad
          </div>
          {!finished && (
            <div className="absolute top-3 right-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-semibold text-white">
              {secondsLeft}s
            </div>
          )}
          <div className="text-4xl font-black text-white drop-shadow-lg">Your Ad Here</div>
          <p className="mt-2 text-sm text-white/90">Sponsored content</p>
        </div>

        <div className="p-5">
          {finished ? (
            <>
              <h3 className="text-lg font-bold text-white">Ad complete!</h3>
              <p className="mt-1 text-sm text-slate-300">
                The watermark has been removed from your poster.
              </p>
              <button
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-400 active:scale-95"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">Remove Watermark</h3>
              <p className="mt-1 text-sm text-slate-300">
                Watch this short ad to remove the "Created with StatusMaker" watermark from your poster.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-1000 ease-linear"
                    style={{ width: `${((AD_DURATION - secondsLeft) / AD_DURATION) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-400 tabular-nums">
                  {secondsLeft}s
                </span>
              </div>
              <button
                onClick={onClose}
                className="absolute top-2.5 right-2.5 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
