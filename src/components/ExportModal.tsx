import React, { useState, useEffect } from 'react';
import { X, Download, Sparkles, Check, Image as ImageIcon, Film, Loader2, PlayCircle, Volume2 } from 'lucide-react';
import { downloadDataUrl } from '../utils/exportImage';
import { downloadVideoBlob, getUploadedVideoDuration } from '../utils/exportVideo';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  onRegenerate: (pixelRatio: number, format: 'png' | 'jpeg') => Promise<string>;
  onExportVideo?: (durationSeconds: number, onProgress: (percent: number) => void) => Promise<string>;
  projectTitle: string;
  mediaType?: 'image' | 'video';
  canvasElement?: HTMLElement | null;
  language?: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  onRegenerate,
  onExportVideo,
  projectTitle,
  mediaType = 'image',
  canvasElement = null
}) => {
  const [activeExportType, setActiveExportType] = useState<'photo' | 'video'>(
    mediaType === 'video' ? 'video' : 'photo'
  );
  const [qualityLevel, setQualityLevel] = useState<2 | 3>(3);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  // 0 = Full Video Duration (Auto-detect from uploaded video, or 6s for static photo)
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [detectedVideoDuration, setDetectedVideoDuration] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);
  const t = TRANSLATIONS.en;

  useEffect(() => {
    if (isOpen) {
      setExportError(null);
      if (mediaType === 'video') {
        setActiveExportType('video');
        setVideoDuration(0); // Default to Full Video!
      }
      const el = canvasElement || document.getElementById('samachar-canvas');
      const dur = getUploadedVideoDuration(el);
      setDetectedVideoDuration(dur);
    }
  }, [isOpen, mediaType, canvasElement]);

  if (!isOpen) return null;

  const handleDownloadPhoto = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const url = await onRegenerate(qualityLevel, format);
      const fileName = `${(projectTitle || 'samachar').replace(/\s+/g, '_')}_${qualityLevel === 3 ? 'UltraHD' : 'HD'}.${format}`;
      downloadDataUrl(url, fileName);
    } catch (e) {
      console.error('Export error:', e);
      setExportError('Could not generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!onExportVideo) return;
    setIsExporting(true);
    setExportError(null);
    setVideoProgress(0);
    try {
      const videoBlobUrl = await onExportVideo(videoDuration, (progress) => {
        setVideoProgress(progress);
      });
      const suffix = videoDuration === 0 ? 'full_video' : `${videoDuration}s_reel`;
      const fileName = `${(projectTitle || 'samachar').replace(/\s+/g, '_')}_${suffix}.mp4`;
      downloadVideoBlob(videoBlobUrl, fileName);
    } catch (e) {
      console.error('Video export error:', e);
      setExportError('Failed to export MP4 video. Please ensure the video is loaded and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const durationOptions = [
    {
      value: 0,
      label: detectedVideoDuration
        ? `🎬 Full Video (${detectedVideoDuration}s)`
        : mediaType === 'video'
        ? '🎬 Full Video (Complete Clip)'
        : '🎬 Auto Reel (6s)',
      desc:
        mediaType === 'video'
          ? 'Exports the entire uploaded video from start to finish'
          : 'Smooth 6-second cinematic zoom reel'
    },
    {
      value: 5,
      label: '⚡ 5 Seconds',
      desc: 'Quick breaking news alert clip'
    },
    {
      value: 10,
      label: '🔥 10 Seconds',
      desc: 'Standard Instagram Story / Reel'
    },
    {
      value: 15,
      label: '📱 15 Seconds',
      desc: 'Full Story & TikTok news segment'
    },
    {
      value: 30,
      label: '🎥 30 Seconds',
      desc: 'Extended news broadcast clip'
    },
    {
      value: 60,
      label: '🌟 60 Seconds',
      desc: 'Full 1-minute video report'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-red-950/40 via-slate-950 to-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/30 animate-float">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">{t.exportModalTitle}</h2>
              <p className="text-xs text-slate-400">Ultra-Sharp Photo & Full MP4 Video Download</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Format Segmented Switcher (Photo vs MP4 Video) */}
        <div className="p-4 pb-0 bg-slate-950/30">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveExportType('photo')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeExportType === 'photo'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>HD Photo (PNG / JPG)</span>
            </button>

            <button
              onClick={() => setActiveExportType('video')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeExportType === 'video'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Full MP4 Video</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {exportError && (
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-xs text-red-300 font-semibold">
              {exportError}
            </div>
          )}

          {/* PHOTO EXPORT CONTROLS */}
          {activeExportType === 'photo' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  {t.resolutionQuality}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setQualityLevel(2)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      qualityLevel === 2
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md ring-1 ring-red-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>HD 1080p (2x)</span>
                      {qualityLevel === 2 && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t.hdDesc}</div>
                  </button>

                  <button
                    onClick={() => setQualityLevel(3)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      qualityLevel === 3
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md ring-1 ring-red-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>Ultra HD 4K (3x)</span>
                      {qualityLevel === 3 && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t.ultraHdDesc}</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  {t.fileFormat}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('png')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === 'png'
                        ? 'bg-slate-800 border-red-500 text-white ring-1 ring-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    PNG (Lossless & Sharpest Text)
                  </button>
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      format === 'jpeg'
                        ? 'bg-slate-800 border-red-500 text-white ring-1 ring-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    JPEG (Compressed & Fast)
                  </button>
                </div>
              </div>

              <button
                disabled={isExporting}
                onClick={handleDownloadPhoto}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.generatingImage}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>{t.downloadNow}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* MP4 VIDEO EXPORT CONTROLS */}
          {activeExportType === 'video' && (
            <div className="space-y-4">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-200 flex items-start gap-2.5">
                <PlayCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Full Video MP4 Export Ready:</span> Exports your live video or animated photo with all headlines, taglines, gradients, and logos burned in at HD quality.
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Select Video Length
                  </label>
                  {detectedVideoDuration && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Source Video: {detectedVideoDuration}s
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setVideoDuration(opt.value)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        videoDuration === opt.value
                          ? 'bg-red-600/15 border-red-500 text-white shadow-md ring-1 ring-red-500'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      } ${opt.value === 0 ? 'col-span-2' : ''}`}
                    >
                      <div className="text-xs sm:text-sm font-bold flex items-center justify-between">
                        <span>{opt.label}</span>
                        {videoDuration === opt.value && <Check className="w-4 h-4 text-red-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Recording Progress Bar */}
              {isExporting && (
                <div className="space-y-2 p-3.5 bg-slate-950 rounded-2xl border border-red-500/40 shadow-inner">
                  <div className="flex justify-between text-xs font-semibold text-slate-200">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                      <span>Recording Full HD MP4 Video...</span>
                    </span>
                    <span className="font-mono text-red-400 font-bold">{videoProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-150"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Please keep this tab open while the video plays and renders frame-by-frame.
                  </p>
                </div>
              )}

              <button
                disabled={isExporting}
                onClick={handleDownloadVideo}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Rendering MP4 Video ({videoProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    <span>
                      {videoDuration === 0
                        ? detectedVideoDuration
                          ? `Download Full MP4 Video (${detectedVideoDuration}s)`
                          : 'Download Full MP4 Video'
                        : `Download ${videoDuration}s MP4 Video`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Quality Assurance Note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Single-Line & Font Lock Active
            </span>
            <span className="text-emerald-400 font-semibold">100% Original Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
};
