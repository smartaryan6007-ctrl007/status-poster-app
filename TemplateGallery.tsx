import { TEMPLATES } from '@/data/templates';
import type { Template } from '@/types';

interface TemplateGalleryProps {
  selectedId: string;
  onSelect: (tpl: Template) => void;
}

export default function TemplateGallery({ selectedId, onSelect }: TemplateGalleryProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin">
      {TEMPLATES.map((tpl) => {
        const active = tpl.id === selectedId;
        return (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl)}
            className={`group relative flex-shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
              active
                ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105'
                : 'ring-1 ring-white/10 hover:ring-sky-400/50 hover:scale-105'
            }`}
            style={{ width: 72, height: 128 }}
            aria-label={tpl.name}
          >
            <img
              src={tpl.bgUrl}
              alt={tpl.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent pb-1.5"
            >
              <span className="text-[9px] font-semibold leading-tight text-white text-center px-1 line-clamp-2">
                {tpl.name}
              </span>
            </div>
            {active && (
              <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-sky-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-slate-900" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
