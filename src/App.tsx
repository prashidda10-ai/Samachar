import React, { useState, useEffect, useRef } from 'react';
import { NewsProject, SavedProjectItem } from './types';
import { INITIAL_PROJECT, TEMPLATES } from './data/defaultTemplates';
import {
  getSavedProjects,
  saveProjectToStorage,
  deleteProjectFromStorage,
  saveDraftToStorage,
  loadDraftFromStorage
} from './utils/storage';
import { exportElementAsImage } from './utils/exportImage';
import { exportElementAsVideo } from './utils/exportVideo';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { CanvasPreview } from './components/CanvasPreview';
import { EditorSidebar } from './components/EditorSidebar';
import { ProjectsModal } from './components/ProjectsModal';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import { Language, TRANSLATIONS } from './utils/translations';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Move,
  RotateCcw,
  Film,
  Download
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [project, setProject] = useState<NewsProject>(INITIAL_PROJECT);
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>([]);
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [language, setLanguage] = useState<Language>('ne');

  // Modals
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [currentExportDataUrl, setCurrentExportDataUrl] = useState<string | null>(null);

  // Quick Move Target for canvas dock
  const [quickMoveTarget, setQuickMoveTarget] = useState<'headline' | 'footer' | 'badge' | 'body' | 'media'>('headline');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Load initial draft, saved projects, and language
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft) {
      setProject(draft);
    }
    setSavedProjects(getSavedProjects());
    const storedLang = localStorage.getItem('samachar_maker_lang') as Language;
    if (storedLang === 'ne' || storedLang === 'en') {
      setLanguage(storedLang);
    }
  }, []);

  const handleToggleLanguage = () => {
    const nextLang: Language = language === 'ne' ? 'en' : 'ne';
    setLanguage(nextLang);
    localStorage.setItem('samachar_maker_lang', nextLang);
    showToast(nextLang === 'ne' ? 'भाषा परिवर्तन भयो: नेपाली' : 'Language switched to: English');
  };

  // Autosave draft when project changes
  useEffect(() => {
    saveDraftToStorage(project);
  }, [project]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Handle template selection
  const handleApplyTemplate = (styleKey: string) => {
    const templateData = TEMPLATES[styleKey];
    if (!templateData) return;

    setProject((prev) => ({
      ...prev,
      ...templateData,
      id: prev.id,
      updatedAt: Date.now()
    }));

    showToast(t.templateAppliedToast);
  };

  // Handle manual project save
  const handleSaveCurrentProject = () => {
    const saved = saveProjectToStorage(project);
    setSavedProjects(saved);
    showToast(t.projectSavedToast);
  };

  // Handle delete project from library
  const handleDeleteProject = (id: string) => {
    const updated = deleteProjectFromStorage(id);
    setSavedProjects(updated);
    showToast(t.projectDeletedToast);
  };

  // Create clean new canvas
  const handleNewProject = () => {
    setProject({
      ...INITIAL_PROJECT,
      id: `draft-${Date.now()}`,
      title: language === 'ne' ? 'नयाँ समाचार कार्ड' : 'New News Card',
      updatedAt: Date.now()
    });
    showToast(t.newCanvasToast);
  };

  // Prepare image data url for share or export
  const prepareExportImage = async (pixelRatio: number = 2, format: 'png' | 'jpeg' = 'png'): Promise<string> => {
    if (!canvasRef.current) throw new Error('Canvas not found');
    const dataUrl = await exportElementAsImage(canvasRef.current, {
      format,
      quality: 0.98,
      pixelRatio
    });
    setCurrentExportDataUrl(dataUrl);
    return dataUrl;
  };

  // Video Reel MP4 export
  const handleExportVideo = async (durationSeconds: number, onProgress: (p: number) => void): Promise<string> => {
    if (!canvasRef.current) throw new Error('Canvas not found');
    return await exportElementAsVideo(canvasRef.current, {
      durationSeconds,
      fps: 25,
      onProgress
    });
  };

  const handleOpenExport = async () => {
    try {
      await prepareExportImage(2, 'png');
      setIsExportOpen(true);
    } catch (e) {
      console.error(e);
      alert('तस्बिर प्रोसेसिङ गर्न सकिएन');
    }
  };

  const handleOpenShare = async () => {
    try {
      await prepareExportImage(2, 'png');
      setIsShareOpen(true);
    } catch (e) {
      console.error(e);
      alert('सेयरको लागि तस्बिर तयार गर्न सकिएन');
    }
  };

  // Quick nudge helper for canvas dock
  const handleQuickNudge = (dx: number, dy: number) => {
    setProject((prev) => {
      if (quickMoveTarget === 'headline') {
        return { ...prev, headlinePosX: (prev.headlinePosX || 0) + dx, headlinePosY: (prev.headlinePosY || 0) + dy };
      }
      if (quickMoveTarget === 'footer') {
        return { ...prev, footerPosX: (prev.footerPosX || 0) + dx, footerPosY: (prev.footerPosY || 0) + dy };
      }
      if (quickMoveTarget === 'badge') {
        return { ...prev, badgePosX: (prev.badgePosX || 0) + dx, badgePosY: (prev.badgePosY || 0) + dy };
      }
      if (quickMoveTarget === 'body') {
        return { ...prev, bodyPosX: (prev.bodyPosX || 0) + dx, bodyPosY: (prev.bodyPosY || 0) + dy };
      }
      if (quickMoveTarget === 'media') {
        return {
          ...prev,
          mediaPosX: Math.max(0, Math.min(100, (prev.mediaPosX ?? 50) + dx)),
          mediaPosY: Math.max(0, Math.min(100, (prev.mediaPosY ?? 50) + dy))
        };
      }
      return prev;
    });
  };

  const handleQuickReset = () => {
    setProject((prev) => {
      if (quickMoveTarget === 'headline') return { ...prev, headlinePosX: 0, headlinePosY: 0 };
      if (quickMoveTarget === 'footer') return { ...prev, footerPosX: 0, footerPosY: 0 };
      if (quickMoveTarget === 'badge') return { ...prev, badgePosX: 0, badgePosY: 0 };
      if (quickMoveTarget === 'body') return { ...prev, bodyPosX: 0, bodyPosY: 0 };
      if (quickMoveTarget === 'media') return { ...prev, mediaPosX: 50, mediaPosY: 50 };
      return prev;
    });
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-outfit ${appTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Cinematic Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Top Bar Header */}
      <Header
        appTheme={appTheme}
        onToggleTheme={() => setAppTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onSaveCurrent={handleSaveCurrentProject}
        onOpenShare={handleOpenShare}
        onOpenExport={handleOpenExport}
        onReplaySplash={() => setShowSplash(true)}
        savedCount={savedProjects.length}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xl shadow-emerald-600/20 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Studio Body: Editor Sidebar + Canvas Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Editor Sidebar (Streamlined 4-Tab Layout) */}
        <div className="w-full lg:w-[420px] xl:w-[460px] h-[48vh] lg:h-full shrink-0 order-2 lg:order-1 border-t lg:border-t-0 lg:border-r border-slate-800">
          <EditorSidebar
            project={project}
            onChange={setProject}
            onApplyTemplate={handleApplyTemplate}
            language={language}
          />
        </div>

        {/* Right: Live Canvas Workspace */}
        <div className={`flex-1 flex flex-col order-1 lg:order-2 overflow-hidden relative ${appTheme === 'dark' ? 'bg-slate-950/80' : 'bg-slate-200/60'}`}>
          {/* Workspace Toolbar */}
          <div className="h-10 px-4 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 select-none">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-200">
                {TEMPLATES[project.templateStyle]?.name || 'Custom Card'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {project.aspectRatio === '4:5'
                  ? '1080 × 1350 px (Feed)'
                  : project.aspectRatio === '1:1'
                  ? '1080 × 1080 px (Square)'
                  : project.aspectRatio === '9:16'
                  ? '1080 × 1920 px (Story/Reel)'
                  : '1920 × 1080 px (Wide)'}
              </span>
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-white transition-colors ml-1"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-3 md:p-6">
            {/* FLOATING QUICK ACTIONS BAR (Fast, responsive & premium) */}
            <div className="flex items-center justify-center gap-2 mb-3 z-20 flex-wrap">
              {/* Quick Media Upload */}
              <label className="cursor-pointer px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700/80 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5 text-red-400" />
                <span>फोटो फेर्नुहोस्</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isVideo = file.type.startsWith('video/');
                      const reader = new FileReader();
                      reader.onload = () => {
                        setProject((prev) => ({
                          ...prev,
                          mediaUrl: reader.result as string,
                          mediaType: isVideo ? 'video' : 'image'
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {/* Quick Aspect Ratio */}
              <div className="flex items-center p-0.5 bg-slate-900/90 rounded-full border border-slate-700/80 shadow-lg backdrop-blur-md">
                {(['4:5', '1:1', '9:16'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setProject((prev) => ({ ...prev, aspectRatio: ratio }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      project.aspectRatio === ratio
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Quick Content Vertical Placement (Top / Center / Bottom) */}
              <div className="flex items-center p-0.5 bg-slate-900/90 rounded-full border border-slate-700/80 shadow-lg backdrop-blur-md">
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'top', headlinePosY: 0, badgePosY: 0 }))}
                  title="Move text to Top (माथि सार्नुहोस्)"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    project.contentVerticalAlign === 'top'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" /> माथि
                </button>
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'center', headlinePosY: 0, badgePosY: 0 }))}
                  title="Center text (बिचमा राख्नुहोस्)"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    project.contentVerticalAlign === 'center'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  बिच
                </button>
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'bottom', headlinePosY: 0, badgePosY: 0 }))}
                  title="Move text to Bottom (तल सार्नुहोस्)"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    !project.contentVerticalAlign || project.contentVerticalAlign === 'bottom'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" /> तल
                </button>
              </div>

              {/* Quick MP4 & HD Export */}
              <button
                onClick={handleOpenExport}
                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>MP4 / HD</span>
              </button>
            </div>

            {/* Canvas Preview Container */}
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.15s ease'
              }}
              className="w-full max-w-[460px] md:max-w-[480px]"
            >
              <CanvasPreview
                ref={canvasRef}
                project={project}
                onUpdateProject={setProject}
              />
            </div>

            {/* FLOATING QUICK MOVE & NUDGE CONTROLLER */}
            <div className="mt-4 z-20 flex flex-col items-center gap-1.5 p-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl max-w-[460px] md:max-w-[480px] w-full">
              <div className="flex items-center justify-between w-full px-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Move className="w-3.5 h-3.5 text-red-400" />
                  <span>स्थान सार्ने पट्टी (Nudge & Move Tool):</span>
                </div>
                <div className="text-red-400 font-mono text-[10px] font-bold">
                  {quickMoveTarget === 'headline' && `X: ${project.headlinePosX || 0}px · Y: ${project.headlinePosY || 0}px`}
                  {quickMoveTarget === 'footer' && `X: ${project.footerPosX || 0}px · Y: ${project.footerPosY || 0}px`}
                  {quickMoveTarget === 'badge' && `X: ${project.badgePosX || 0}px · Y: ${project.badgePosY || 0}px`}
                  {quickMoveTarget === 'body' && `X: ${project.bodyPosX || 0}px · Y: ${project.bodyPosY || 0}px`}
                  {quickMoveTarget === 'media' && `X: ${project.mediaPosX ?? 50}% · Y: ${project.mediaPosY ?? 50}%`}
                </div>
              </div>

              {/* Target Selector */}
              <div className="grid grid-cols-5 gap-1 w-full text-[11px] font-semibold">
                {[
                  { id: 'headline', label: '📢 हेडलाइन' },
                  { id: 'footer', label: '👤 युजरनेम' },
                  { id: 'badge', label: '🏷️ ट्याग' },
                  { id: 'body', label: '📝 विवरण' },
                  { id: 'media', label: '🖼️ फोटो' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuickMoveTarget(item.id as any)}
                    className={`py-1 px-1 rounded-lg text-center truncate transition-all cursor-pointer ${
                      quickMoveTarget === item.id
                        ? 'bg-red-600 text-white shadow-sm font-bold ring-1 ring-red-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Nudge Arrows & Reset */}
              <div className="flex items-center justify-center gap-2 pt-0.5 w-full flex-wrap">
                <button
                  onClick={() => handleQuickNudge(-5, 0)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Left 5px"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-red-400" /> बायाँ
                </button>

                <button
                  onClick={() => handleQuickNudge(0, -5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Up 5px"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-red-400" /> माथि
                </button>

                <button
                  onClick={() => handleQuickNudge(0, 5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Down 5px"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-red-400" /> तल
                </button>

                <button
                  onClick={() => handleQuickNudge(5, 0)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Right 5px"
                >
                  दायाँ <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                </button>

                <button
                  onClick={handleQuickReset}
                  className="py-1 px-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-750"
                  title="Reset Position"
                >
                  <RotateCcw className="w-3 h-3 text-red-400" /> रिसेट
                </button>
              </div>
            </div>
          </div>

          {/* Quick Helper Tip Bar */}
          <div className="py-1 px-4 text-center text-[11px] text-slate-500 border-t border-slate-800/40 bg-slate-950/40 hidden md:block">
            <span>{t.quickTip}</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={savedProjects}
        onSelectProject={(p) => setProject(p)}
        onDeleteProject={handleDeleteProject}
        onNewProject={handleNewProject}
        onImportProject={(p) => setProject(p)}
        language={language}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        project={project}
        imageDataUrl={currentExportDataUrl}
        language={language}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        imageDataUrl={currentExportDataUrl}
        onRegenerate={prepareExportImage}
        onExportVideo={handleExportVideo}
        projectTitle={project.title}
        language={language}
      />
    </div>
  );
}
