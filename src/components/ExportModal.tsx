import React, { useState } from 'react';
import { X, Download, Sparkles, Check, Image as ImageIcon, Video, Film, Loader2 } from 'lucide-react';
import { downloadDataUrl } from '../utils/exportImage';
import { downloadVideoBlob } from '../utils/exportVideo';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageDataUrl: string | null;
  onRegenerate: (pixelRatio: number, format: 'png' | 'jpeg') => Promise<string>;
  onExportVideo?: (durationSeconds: number, onProgress: (percent: number) => void) => Promise<string>;
  projectTitle: string;
  language?: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  imageDataUrl,
  onRegenerate,
  onExportVideo,
  projectTitle,
  language = 'ne'
}) => {
  const [activeExportType, setActiveExportType] = useState<'photo' | 'video'>('photo');
  const [qualityLevel, setQualityLevel] = useState<2 | 3>(2);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [videoDuration, setVideoDuration] = useState<5 | 10>(5);
  const [isExporting, setIsExporting] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(imageDataUrl);
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const handleDownloadPhoto = async () => {
    setIsExporting(true);
    try {
      const url = await onRegenerate(qualityLevel, format);
      setCurrentUrl(url);
      const fileName = `${(projectTitle || 'samachar').replace(/\s+/g, '_')}_${qualityLevel === 3 ? 'UltraHD' : 'HD'}.${format}`;
      downloadDataUrl(url, fileName);
    } catch (e) {
      console.error('Export error:', e);
      alert('डाउनलोड गर्न समस्या भयो। कृपया पुन: प्रयास गर्नुहोस्।');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadVideo = async () => {
    if (!onExportVideo) return;
    setIsExporting(true);
    setVideoProgress(0);
    try {
      const videoBlobUrl = await onExportVideo(videoDuration, (progress) => {
        setVideoProgress(progress);
      });
      const fileName = `${(projectTitle || 'samachar').replace(/\s+/g, '_')}_reel.mp4`;
      downloadVideoBlob(videoBlobUrl, fileName);
    } catch (e) {
      console.error('Video export error:', e);
      alert('भिडियो एक्सपोर्ट गर्न समस्या भयो। कृपया पुन: प्रयास गर्नुहोस्।');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-base font-bold text-white">{t.exportModalTitle}</h2>
              <p className="text-xs text-slate-400">High Quality Photo & MP4 Video Reel Export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Format Segmented Switcher (Photo vs MP4 Video) */}
        <div className="p-4 pb-0 bg-slate-950/30">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveExportType('photo')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeExportType === 'photo'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{t.exportPhotoTab}</span>
            </button>

            <button
              onClick={() => setActiveExportType('video')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeExportType === 'video'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>{t.exportVideoTab}</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
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
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
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
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
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
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      format === 'png'
                        ? 'bg-slate-800 border-red-500 text-white ring-1 ring-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    PNG (Lossless & Sharpest Text)
                  </button>
                  <button
                    onClick={() => setFormat('jpeg')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
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
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300">
                🎬 इन्स्टाग्राम रिल्स (Instagram Reels), टिकटक (TikTok) र युट्युब सर्ट्सका लागि उच्च गुणस्तरीय MP4 भिडियो।
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  {t.videoDuration}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setVideoDuration(5)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      videoDuration === 5
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md ring-1 ring-red-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>५ सेकेन्ड (5s)</span>
                      {videoDuration === 5 && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t.sec5}</div>
                  </button>

                  <button
                    onClick={() => setVideoDuration(10)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      videoDuration === 10
                        ? 'bg-red-600/15 border-red-500 text-white shadow-md ring-1 ring-red-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      <span>१० सेकेन्ड (10s)</span>
                      {videoDuration === 10 && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{t.sec10}</div>
                  </button>
                </div>
              </div>

              {/* Video Recording Progress Bar */}
              {isExporting && (
                <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      {t.recordingVideo}
                    </span>
                    <span className="font-mono text-red-400">{videoProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-150 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                disabled={isExporting}
                onClick={handleDownloadVideo}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>रेकर्ड गर्दैछ ({videoProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    <span>{t.downloadMp4}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
