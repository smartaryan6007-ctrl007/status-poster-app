import { useCallback, useRef, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { TEMPLATES } from '@/data/templates';
import { generateWish } from '@/services/geminiWish';
import type { Template } from '@/types';
import { usePosterCanvas } from '@/hooks/usePosterCanvas';
import PosterCanvas from '@/components/PosterCanvas';
import TemplateGallery from '@/components/TemplateGallery';
import ControlPanel from '@/components/ControlPanel';
import AdModal from '@/components/AdModal';

function App() {
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [wish, setWish] = useState<string | null>(null);
  const [watermarkRemoved, setWatermarkRemoved] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInspiring, setIsInspiring] = useState(false);
  const inspireReqId = useRef(0);

  const { canvasRef, toBlob, toDataURL, isReady } = usePosterCanvas({
    template,
    photo,
    name,
    wish,
    watermarkRemoved,
  });

  const handleSelectTemplate = useCallback((tpl: Template) => {
    setTemplate(tpl);
    setWish(null);
  }, []);

  const handlePhotoUpload = useCallback((dataUrl: string) => {
    setPhoto(dataUrl);
  }, []);

  const handleInspire = useCallback(async () => {
    const reqId = ++inspireReqId.current;
    setIsInspiring(true);
    try {
      const generated = await generateWish(template.id, template.name);
      // Ignore result if a newer inspire request was fired
      if (reqId !== inspireReqId.current) return;
      setWish(generated);
    } finally {
      if (reqId === inspireReqId.current) setIsInspiring(false);
    }
  }, [template.id, template.name]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;
    setIsProcessing(true);
    try {
      const dataUrl = toDataURL();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `status-maker-${template.id}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsProcessing(false);
    }
  }, [canvasRef, isReady, toDataURL, template.id]);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !isReady) return;
    setIsProcessing(true);
    try {
      const blob = await toBlob();
      if (!blob) return;
      const file = new File([blob], `status-${template.id}.png`, { type: 'image/png' });

      // Try Web Share API with file (works on mobile browsers + WhatsApp)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: `Happy ${template.name}! Made with StatusMaker`,
        });
        return;
      }

      // Fallback: download the image (user can manually post to status)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `status-maker-${template.id}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // user cancelled share — silently ignore
      if (err instanceof Error && err.name !== 'AbortError') {
        // fallback to download
        handleDownload();
      }
    } finally {
      setIsProcessing(false);
    }
  }, [canvasRef, isReady, toBlob, template, handleDownload]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/8 blur-3xl" />
      </div>

      {/* Mobile container */}
      <div className="relative mx-auto max-w-md px-4 pb-8 pt-6">
        {/* Header */}
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 shadow-lg shadow-sky-500/20">
              <Sparkles className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-tight tracking-tight">
                Status<span className="text-sky-400">Maker</span>
              </h1>
              <p className="text-[11px] font-medium text-slate-400">WhatsApp Status Posters</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1.5 text-rose-300">
            <Heart className="h-3.5 w-3.5 fill-rose-400" />
            <span className="text-[11px] font-bold">Free</span>
          </div>
        </header>

        {/* Poster Canvas — 9:16 preview */}
        <div className="mb-4 flex justify-center">
          <div className="w-full max-w-[300px]">
            <PosterCanvas canvasRef={canvasRef} />
          </div>
        </div>

        {/* Template Gallery */}
        <section className="mb-5">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200">Templates</h2>
            <span className="text-[11px] font-medium text-slate-500">
              {TEMPLATES.length} designs
            </span>
          </div>
          <TemplateGallery selectedId={template.id} onSelect={handleSelectTemplate} />
        </section>

        {/* Controls */}
        <section className="mb-4">
          <h2 className="mb-3 text-sm font-bold text-slate-200">Customize</h2>
          <ControlPanel
            name={name}
            onNameChange={setName}
            onPhotoUpload={handlePhotoUpload}
            onInspire={handleInspire}
            onShare={handleShare}
            onDownload={handleDownload}
            onWatchAd={() => setShowAd(true)}
            watermarkRemoved={watermarkRemoved}
            isProcessing={isProcessing}
            isInspiring={isInspiring}
            hasPhoto={!!photo}
          />
        </section>

        {/* Footer hint */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          Pick a template, add your photo & name, then share to your WhatsApp Status.
        </p>
      </div>

      {/* Ad Modal */}
      <AdModal
        open={showAd}
        onClose={() => setShowAd(false)}
        onComplete={() => setWatermarkRemoved(true)}
      />
    </div>
  );
}

export default App;
