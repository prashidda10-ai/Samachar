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
import { getCurrentUser, logoutUser, UserProfile } from './utils/auth';
import { AIGeneratedNews } from './utils/aiNewsService';
import { SplashScreen } from './components/SplashScreen';
import { Header } from './components/Header';
import { CanvasPreview } from './components/CanvasPreview';
import { EditorSidebar } from './components/EditorSidebar';
import { ProjectsModal } from './components/ProjectsModal';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { AINewsModal } from './components/AINewsModal';
import { AIFloatingBubble } from './components/AIFloatingBubble';
import { InstallModal } from './components/InstallModal';
import { TRANSLATIONS } from './utils/translations';
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
  Download,
  Sparkles,
  DownloadCloud
} from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('preview');
  const [project, setProject] = useState<NewsProject>(INITIAL_PROJECT);
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>([]);
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Authentication State
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<'save' | 'view' | 'general'>('general');

  // Modals
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [currentExportDataUrl, setCurrentExportDataUrl] = useState<string | null>(null);

  // PWA Install state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(true);

  // Quick Move Target for canvas dock
  const [quickMoveTarget, setQuickMoveTarget] = useState<'headline' | 'footer' | 'badge' | 'body' | 'media'>('headline');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS.en;

  // Load initial draft and saved projects
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (draft) {
      setProject(draft);
    }
    setSavedProjects(getSavedProjects());

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPwa(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

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

  // PWA Installation Trigger
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setCanInstallPwa(false);
          showToast('Thank you for installing Samachar Maker!');
        }
        setDeferredPrompt(null);
      } catch {
        setIsInstallModalOpen(true);
      }
    } else {
      setIsInstallModalOpen(true);
    }
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

    showToast('Template applied successfully');
  };

  // Handle manual project save (ACCOUNT REQUIRED)
  const handleSaveCurrentProject = async () => {
    if (!user) {
      setAuthReason('save');
      setIsAuthOpen(true);
      return;
    }

    try {
      // Capture crystal-clear high-res snapshot for exact WYSIWYG save fidelity
      let previewUrl: string | undefined = undefined;
      if (canvasRef.current) {
        try {
          previewUrl = await exportElementAsImage(canvasRef.current, {
            format: 'png',
            quality: 0.98,
            pixelRatio: 2.5
          });
        } catch {
          // fallback
        }
      }

      const saved = saveProjectToStorage(project, previewUrl);
      setSavedProjects(saved);
      showToast('Project saved successfully to your Google account!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save project');
    }
  };

  // Handle open projects library (ACCOUNT REQUIRED)
  const handleOpenProjects = () => {
    if (!user) {
      setAuthReason('view');
      setIsAuthOpen(true);
      return;
    }
    setIsProjectsOpen(true);
  };

  // Handle successful Google authentication
  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    showToast(`Welcome back, ${authenticatedUser.name}!`);

    if (authReason === 'save') {
      setTimeout(() => handleSaveCurrentProject(), 350);
    } else if (authReason === 'view') {
      setTimeout(() => setIsProjectsOpen(true), 350);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    showToast('Signed out of your Google account');
  };

  // Handle delete project from library
  const handleDeleteProject = (id: string) => {
    const updated = deleteProjectFromStorage(id);
    setSavedProjects(updated);
    showToast('Project deleted');
  };

  // Handle new blank project
  const handleNewProject = () => {
    const blank: NewsProject = {
      ...INITIAL_PROJECT,
      id: `proj-${Date.now()}`,
      title: 'New News Card',
      updatedAt: Date.now()
    };
    setProject(blank);
    setIsProjectsOpen(false);
    showToast('Created new news card');
  };

  // Prepare high-res image export with WYSIWYG auto-save
  const prepareExportImage = async (
    pixelRatio: number = 2.5,
    format: 'png' | 'jpeg' = 'png'
  ): Promise<string> => {
    if (!canvasRef.current) throw new Error('Canvas element not found');
    const dataUrl = await exportElementAsImage(canvasRef.current, {
      format,
      quality: 1.0,
      pixelRatio
    });
    setCurrentExportDataUrl(dataUrl);

    // Auto-save the exact high quality snapshot so the project is saved identically as downloaded
    try {
      const updated = saveProjectToStorage(project, dataUrl);
      setSavedProjects(updated);
    } catch (e) {
      console.warn('Auto-save on export note:', e);
    }

    return dataUrl;
  };

  // Video Reel MP4 export with high-res preview capture
  const handleExportVideo = async (durationSeconds: number, onProgress: (p: number) => void): Promise<string> => {
    if (!canvasRef.current) throw new Error('Canvas not found');

    // Capture high quality thumbnail for project library
    try {
      const snap = await exportElementAsImage(canvasRef.current, { format: 'png', quality: 1.0, pixelRatio: 2 });
      const updated = saveProjectToStorage(project, snap);
      setSavedProjects(updated);
    } catch {
      // ignore
    }

    return await exportElementAsVideo(canvasRef.current, {
      durationSeconds,
      fps: 30,
      onProgress
    });
  };

  const handleOpenExport = async () => {
    setIsExportOpen(true);
    try {
      await prepareExportImage(2.5, 'png');
    } catch (e) {
      console.warn('Preview snapshot note:', e);
    }
  };

  const handleOpenShare = async () => {
    try {
      await prepareExportImage(2.5, 'png');
      setIsShareOpen(true);
    } catch (e) {
      console.error(e);
      alert('Could not prepare image for sharing.');
    }
  };

  // Apply AI Generated News to Card
  const handleApplyAINews = (news: AIGeneratedNews) => {
    setProject((prev) => ({
      ...prev,
      headline: news.headline,
      bodyText: news.bodyText,
      categoryBadge: news.categoryBadge,
      subheadline: news.subheadline || prev.subheadline,
      showSubheadline: Boolean(news.subheadline),
      updatedAt: Date.now()
    }));
    showToast('AI News content applied to card!');
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

      {/* Top Bar Header with English UI, AI Tools, PWA install & Google Account */}
      <Header
        appTheme={appTheme}
        onToggleTheme={() => setAppTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenProjects={handleOpenProjects}
        onSaveCurrent={handleSaveCurrentProject}
        onOpenShare={handleOpenShare}
        onOpenExport={handleOpenExport}
        onReplaySplash={() => setShowSplash(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAuth={() => {
          setAuthReason('general');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        user={user}
        savedCount={savedProjects.length}
        canInstallPwa={canInstallPwa}
        onInstallPwa={handleInstallPwa}
        mobileTab={mobileTab}
        onToggleMobileTab={setMobileTab}
      />

      {/* Main Workspace: Desktop shows side-by-side, Mobile toggles between Editor & Preview */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Control Sidebar */}
        <div className={`w-full md:w-[420px] lg:w-[460px] h-full shrink-0 z-10 shadow-xl overflow-hidden ${
          mobileTab === 'editor' ? 'block' : 'hidden md:block'
        }`}>
          <EditorSidebar
            project={project}
            onChange={setProject}
            onApplyTemplate={handleApplyTemplate}
            language="en"
            onOpenAI={() => setIsAIOpen(true)}
          />
        </div>

        {/* Center Canvas Viewport */}
        <div className={`flex-1 flex-col h-full bg-slate-900/60 overflow-hidden relative ${
          mobileTab === 'preview' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Viewport Top Toolbar */}
          <div className="h-10 border-b border-slate-800/80 bg-slate-950/40 px-4 flex items-center justify-between text-xs text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">Live Editor Canvas</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                HD Preview
              </span>
            </div>

            {/* Canvas Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1 hover:text-white transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:text-white transition-colors ml-1 cursor-pointer"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-3 md:p-6">
            {/* FLOATING QUICK ACTIONS BAR */}
            <div className="flex items-center justify-center gap-2 mb-3 z-20 flex-wrap">
              {/* Quick Media Upload */}
              <label className="cursor-pointer px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-white border border-slate-700/80 shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all hover-lift active:scale-95">
                <Upload className="w-3.5 h-3.5 text-red-400" />
                <span>Change Media</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const isVideo = file.type.startsWith('video/');
                      if (isVideo) {
                        const objectUrl = URL.createObjectURL(file);
                        setProject((prev) => ({
                          ...prev,
                          mediaUrl: objectUrl,
                          mediaType: 'video',
                          updatedAt: Date.now()
                        }));
                        showToast('Full video loaded at 100% original quality!');
                      } else {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setProject((prev) => ({
                            ...prev,
                            mediaUrl: reader.result as string,
                            mediaType: 'image',
                            updatedAt: Date.now()
                          }));
                          showToast('Photo loaded with original high quality');
                        };
                        reader.readAsDataURL(file);
                      }
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
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      project.aspectRatio === ratio
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              {/* Quick 1-Line Lock Toggle for Headline & Tagline */}
              <button
                onClick={() => {
                  const nextState = !project.headlineSingleLine;
                  setProject((prev) => ({
                    ...prev,
                    headlineSingleLine: nextState,
                    badgeSingleLine: true
                  }));
                  showToast(nextState ? 'Headline & Tagline locked to 1 Single Line!' : 'Multi-line Headline enabled');
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg flex items-center gap-1.5 backdrop-blur-md transition-all hover-lift active:scale-95 cursor-pointer ${
                  project.headlineSingleLine
                    ? 'bg-emerald-600/25 text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                }`}
                title="Keep Headline and Tagline on 1 single line without wrapping"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{project.headlineSingleLine ? '✓ 1-Line Locked' : '1-Line Lock'}</span>
              </button>

              {/* Quick Content Vertical Placement */}
              <div className="flex items-center p-0.5 bg-slate-900/90 rounded-full border border-slate-700/80 shadow-lg backdrop-blur-md">
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'top', headlinePosY: 0, badgePosY: 0 }))}
                  title="Move text to Top"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    project.contentVerticalAlign === 'top'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUp className="w-3.5 h-3.5" /> Top
                </button>
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'center', headlinePosY: 0, badgePosY: 0 }))}
                  title="Center text"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    project.contentVerticalAlign === 'center'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Center
                </button>
                <button
                  onClick={() => setProject((prev) => ({ ...prev, contentVerticalAlign: 'bottom', headlinePosY: 0, badgePosY: 0 }))}
                  title="Move text to Bottom"
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    !project.contentVerticalAlign || project.contentVerticalAlign === 'bottom'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDown className="w-3.5 h-3.5" /> Bottom
                </button>
              </div>

              {/* Quick HD & Full MP4 Export */}
              <button
                onClick={handleOpenExport}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all hover-lift active:scale-95 cursor-pointer animate-glow"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Export HD / MP4</span>
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
                  <span>Move & Nudge Controls:</span>
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
                  { id: 'headline', label: '📢 Headline' },
                  { id: 'footer', label: '👤 Handle' },
                  { id: 'badge', label: '🏷️ Tag' },
                  { id: 'body', label: '📝 Story' },
                  { id: 'media', label: '🖼️ Photo' }
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
                  <ArrowLeft className="w-3.5 h-3.5 text-red-400" /> Left
                </button>

                <button
                  onClick={() => handleQuickNudge(0, -5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Up 5px"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-red-400" /> Up
                </button>

                <button
                  onClick={() => handleQuickNudge(0, 5)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Down 5px"
                >
                  <ArrowDown className="w-3.5 h-3.5 text-red-400" /> Down
                </button>

                <button
                  onClick={() => handleQuickNudge(5, 0)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer transition-all"
                  title="Move Right 5px"
                >
                  Right <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                </button>

                <button
                  onClick={handleQuickReset}
                  className="py-1 px-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-750"
                  title="Reset Position"
                >
                  <RotateCcw className="w-3 h-3 text-red-400" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Quick Helper Tip Bar */}
          <div className="py-1.5 px-4 text-center text-[11px] text-slate-400 border-t border-slate-800/60 bg-slate-950/60 hidden md:block">
            <span>💡 Tip: Highlight words using <code className="text-red-400">{'{red}word{/red}'}</code>, <code className="text-yellow-400">{'{yellow}word{/yellow}'}</code> or drag elements directly on the canvas.</span>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Google Authentication Gate Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        reason={authReason}
      />

      {/* 2. AI News Journalist Modal */}
      <AINewsModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onApplyNews={handleApplyAINews}
      />

      {/* 3. Saved Projects Library Modal */}
      <ProjectsModal
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        projects={savedProjects}
        onSelectProject={(p) => setProject(p)}
        onDeleteProject={handleDeleteProject}
        onNewProject={handleNewProject}
        onImportProject={(p) => setProject(p)}
        language="en"
      />

      {/* 4. Social Media Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        project={project}
        imageDataUrl={currentExportDataUrl}
        language="en"
      />

      {/* 5. HD & MP4 Reel Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        imageDataUrl={currentExportDataUrl}
        onRegenerate={prepareExportImage}
        onExportVideo={handleExportVideo}
        projectTitle={project.title}
        mediaType={project.mediaType}
        canvasElement={canvasRef.current}
        language="en"
      />

      {/* 6. PWA Web Install Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        hasNativePrompt={Boolean(deferredPrompt)}
        onNativeInstall={handleInstallPwa}
      />

      {/* 7. DRAGGABLE & ANIMATED AI FLOATING BUBBLE */}
      <AIFloatingBubble
        project={project}
        onUpdateProject={setProject}
        onApplyAINews={handleApplyAINews}
        onOpenFullAIModal={() => setIsAIOpen(true)}
        onShowToast={showToast}
      />

      {/* Mobile Floating Mode Toggle */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center shadow-2xl">
        {mobileTab === 'editor' ? (
          <button
            onClick={() => setMobileTab('preview')}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold text-xs shadow-2xl shadow-red-600/40 flex items-center gap-2 border border-white/25 active:scale-95 cursor-pointer transition-transform animate-glow"
          >
            <span>👁️ View Live News Card Preview</span>
          </button>
        ) : (
          <button
            onClick={() => setMobileTab('editor')}
            className="px-5 py-3 rounded-full bg-slate-900/95 text-white font-extrabold text-xs shadow-2xl shadow-black/80 flex items-center gap-2 border border-red-500/50 active:scale-95 backdrop-blur-md cursor-pointer transition-transform"
          >
            <span>✏️ Open Editor Controls</span>
          </button>
        )}
      </div>

      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-24 right-5 z-50 bg-slate-900 border border-red-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-pop">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
