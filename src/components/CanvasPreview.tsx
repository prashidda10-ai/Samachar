import React, { forwardRef, useState, useRef } from 'react';
import { NewsProject } from '../types';
import { renderHighlightedText } from '../utils/textParser';
import { Volume2, VolumeX, Move, Edit2, Check } from 'lucide-react';

interface CanvasPreviewProps {
  project: NewsProject;
  scale?: number;
  interactiveVideo?: boolean;
  onUpdateProject?: (updated: NewsProject) => void;
}

export const CanvasPreview = forwardRef<HTMLDivElement, CanvasPreviewProps>(
  ({ project, scale = 1, interactiveVideo = true, onUpdateProject }, ref) => {
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isEditingHandle, setIsEditingHandle] = useState(false);
    const [editingHandleValue, setEditingHandleValue] = useState(project.footerHandle || '');
    const [draggingElement, setDraggingElement] = useState<'media' | 'badge' | 'headline' | 'body' | 'footer' | null>(null);
    const dragStartRef = useRef<{ x: number; y: number; origPosX: number; origPosY: number }>({ x: 0, y: 0, origPosX: 0, origPosY: 0 });
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Calculate aspect ratio CSS
    const getAspectRatioClass = () => {
      switch (project.aspectRatio) {
        case '1:1':
          return 'aspect-square';
        case '4:5':
          return 'aspect-[4/5]';
        case '9:16':
          return 'aspect-[9/16]';
        case '16:9':
          return 'aspect-video';
        default:
          return 'aspect-[4/5]';
      }
    };

    const toggleVideoPlay = () => {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    const toggleVideoMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!videoRef.current) return;
      videoRef.current.muted = !videoRef.current.muted;
      setIsVideoMuted(videoRef.current.muted);
    };

    // Filter style for media + position & zoom
    const mediaFilterStyle: React.CSSProperties = {
      filter: `brightness(${project.mediaBrightness}%) contrast(${project.mediaContrast}%) blur(${project.mediaBlur}px)`,
      objectPosition: `${project.mediaPosX ?? 50}% ${project.mediaPosY ?? 50}%`,
      transform: `scale(${project.mediaScale ?? 1})`,
      transition: draggingElement === 'media' ? 'none' : 'transform 0.15s ease, object-position 0.15s ease'
    };

    // Card theme backgrounds
    const isDarkTheme = project.cardTheme === 'dark';
    const isLightTheme = project.cardTheme === 'light';

    // Interactive Drag Handlers for Media and Text elements
    const handlePointerDown = (
      e: React.PointerEvent,
      element: 'media' | 'badge' | 'headline' | 'body' | 'footer'
    ) => {
      if (!onUpdateProject) return;
      // If clicking directly into an active input or button, don't drag
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
        return;
      }

      e.stopPropagation();
      setDraggingElement(element);

      let initialX = 0;
      let initialY = 0;

      if (element === 'media') {
        initialX = project.mediaPosX ?? 50;
        initialY = project.mediaPosY ?? 50;
      } else if (element === 'badge') {
        initialX = project.badgePosX ?? 0;
        initialY = project.badgePosY ?? 0;
      } else if (element === 'headline') {
        initialX = project.headlinePosX ?? 0;
        initialY = project.headlinePosY ?? 0;
      } else if (element === 'body') {
        initialX = project.bodyPosX ?? 0;
        initialY = project.bodyPosY ?? 0;
      } else if (element === 'footer') {
        initialX = project.footerPosX ?? 0;
        initialY = project.footerPosY ?? 0;
      }

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        origPosX: initialX,
        origPosY: initialY
      };

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!draggingElement || !onUpdateProject) return;

      const deltaPixelX = e.clientX - dragStartRef.current.x;
      const deltaPixelY = e.clientY - dragStartRef.current.y;

      if (draggingElement === 'media') {
        // For media object-position, convert pixel deltas to percentages relative to container dimensions
        const rect = containerRef.current?.getBoundingClientRect();
        const width = rect?.width || 500;
        const height = rect?.height || 625;

        const deltaPercentX = (deltaPixelX / width) * 100;
        const deltaPercentY = (deltaPixelY / height) * 100;

        const newPosX = Math.max(0, Math.min(100, Math.round(dragStartRef.current.origPosX - deltaPercentX)));
        const newPosY = Math.max(0, Math.min(100, Math.round(dragStartRef.current.origPosY - deltaPercentY)));

        onUpdateProject({
          ...project,
          mediaPosX: newPosX,
          mediaPosY: newPosY
        });
      } else {
        // Direct pixel offset translation for text elements
        const newPosX = Math.round(dragStartRef.current.origPosX + deltaPixelX);
        const newPosY = Math.round(dragStartRef.current.origPosY + deltaPixelY);

        if (draggingElement === 'badge') {
          onUpdateProject({ ...project, badgePosX: newPosX, badgePosY: newPosY });
        } else if (draggingElement === 'headline') {
          onUpdateProject({ ...project, headlinePosX: newPosX, headlinePosY: newPosY });
        } else if (draggingElement === 'body') {
          onUpdateProject({ ...project, bodyPosX: newPosX, bodyPosY: newPosY });
        } else if (draggingElement === 'footer') {
          onUpdateProject({ ...project, footerPosX: newPosX, footerPosY: newPosY });
        }
      }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      if (draggingElement) {
        setDraggingElement(null);
        try {
          (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    const saveEditedHandle = () => {
      if (onUpdateProject) {
        onUpdateProject({
          ...project,
          footerHandle: editingHandleValue.trim() || '@yourchannel'
        });
      }
      setIsEditingHandle(false);
    };

    return (
      <div
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }
        }}
        id="samachar-canvas"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative overflow-hidden shadow-2xl select-none mx-auto transition-all ${getAspectRatioClass()} ${
          isLightTheme ? 'bg-slate-100 text-slate-900' : 'bg-black text-white'
        }`}
        style={{
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* BACKGROUND MEDIA LAYER (Movable via Drag) */}
        <div
          className={`absolute inset-0 z-0 overflow-hidden ${
            draggingElement === 'media' ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onPointerDown={(e) => handlePointerDown(e, 'media')}
          title="Drag to reposition background photo / video"
        >
          {project.mediaUrl ? (
            project.mediaType === 'video' ? (
              <div className="relative w-full h-full" onClick={toggleVideoPlay}>
                <video
                  ref={videoRef}
                  src={project.mediaUrl}
                  autoPlay
                  loop
                  muted={isVideoMuted}
                  playsInline
                  style={mediaFilterStyle}
                  className={`w-full h-full pointer-events-none ${
                    project.mediaFit === 'cover'
                      ? 'object-cover'
                      : project.mediaFit === 'contain'
                      ? 'object-contain'
                      : 'object-fill'
                  }`}
                />
                {interactiveVideo && (
                  <button
                    onClick={toggleVideoMute}
                    aria-label="Toggle audio"
                    className="export-ignore absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all z-20"
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ) : project.secondaryMediaUrl && project.templateStyle === 'sharesanskar-split' ? (
              // Split Comparison Layout
              <div className="grid grid-cols-2 w-full h-[65%] border-b-2 border-red-600/30">
                <div className="relative h-full overflow-hidden border-r border-slate-700/50">
                  <img
                    src={project.mediaUrl}
                    alt="Split Media 1"
                    crossOrigin="anonymous"
                    style={mediaFilterStyle}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                <div className="relative h-full overflow-hidden">
                  <img
                    src={project.secondaryMediaUrl}
                    alt="Split Media 2"
                    crossOrigin="anonymous"
                    style={mediaFilterStyle}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              </div>
            ) : (
              // Standard single photo
              <img
                src={project.mediaUrl}
                alt="News Background"
                crossOrigin="anonymous"
                style={mediaFilterStyle}
                className={`w-full h-full pointer-events-none ${
                  project.mediaFit === 'cover'
                    ? 'object-cover'
                    : project.mediaFit === 'contain'
                    ? 'object-contain'
                    : 'object-fill'
                }`}
              />
            )
          ) : (
            // Texture fallback for text-only cards
            <div className={`w-full h-full ${isLightTheme ? 'bg-slate-100' : 'bg-slate-950'}`}>
              <div className="w-full h-full opacity-30 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          )}

          {/* GRADIENT OVERLAYS: Dark from bottom transitioning to light/transparent towards the top */}
          {project.overlayGradient === 'bottom-dark' && (
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none transition-all"
              style={{
                height: `${project.overlayHeight ?? 82}%`,
                background: `linear-gradient(to top, 
                  rgba(0, 0, 0, ${project.overlayOpacity / 100}) 0%, 
                  rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.96}) 25%, 
                  rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.72}) 55%, 
                  rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.28}) 82%, 
                  transparent 100%)`
              }}
            />
          )}

          {project.overlayGradient === 'top-and-bottom' && (
            <>
              {/* Top gradient for channel logo visibility */}
              <div
                className="absolute inset-x-0 top-0 pointer-events-none"
                style={{
                  height: '35%',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)'
                }}
              />
              {/* Bottom gradient for headline readability */}
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none transition-all"
                style={{
                  height: `${project.overlayHeight ?? 80}%`,
                  background: `linear-gradient(to top, 
                    rgba(0, 0, 0, ${project.overlayOpacity / 100}) 0%, 
                    rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.94}) 25%, 
                    rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.65}) 55%, 
                    rgba(0, 0, 0, ${(project.overlayOpacity / 100) * 0.2}) 80%, 
                    transparent 100%)`
                }}
              />
            </>
          )}

          {project.overlayGradient === 'bottom-white' && (
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none transition-all"
              style={{
                height: `${project.overlayHeight ?? 82}%`,
                background: `linear-gradient(to top, 
                  rgba(255, 255, 255, ${project.overlayOpacity / 100}) 0%, 
                  rgba(255, 255, 255, ${(project.overlayOpacity / 100) * 0.95}) 25%, 
                  rgba(255, 255, 255, ${(project.overlayOpacity / 100) * 0.65}) 55%, 
                  rgba(255, 255, 255, ${(project.overlayOpacity / 100) * 0.2}) 82%, 
                  transparent 100%)`
              }}
            />
          )}

          {project.overlayGradient === 'full-vignette' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, transparent 30%, rgba(0,0,0,${project.overlayOpacity / 100}) 100%)`
              }}
            />
          )}
        </div>

        {/* CORNER BRAND LOGO (Customizable) */}
        {project.showLogo && project.logoUrl && (
          <div
            className={`absolute z-20 pointer-events-none transition-transform ${
              project.logoPosition === 'top-right'
                ? 'top-4 right-4'
                : project.logoPosition === 'center'
                ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                : project.logoPosition === 'bottom-right'
                ? 'bottom-16 right-4'
                : project.logoPosition === 'bottom-left'
                ? 'bottom-16 left-4'
                : 'top-4 left-4'
            }`}
            style={{
              transform: `translate(${project.logoPosX || 0}px, ${project.logoPosY || 0}px)`
            }}
          >
            <div
              className="overflow-hidden rounded-full border border-white/30 bg-black/50 shadow-xl backdrop-blur-xs"
              style={{ width: `${project.logoSize}px`, height: `${project.logoSize}px` }}
            >
              <img
                src={project.logoUrl}
                alt="News Logo"
                className="w-full h-full object-cover"
                style={{ opacity: project.logoOpacity / 100 }}
              />
            </div>
          </div>
        )}

        {/* WATERMARK EMBLEM (Center faint watermark) */}
        {project.showWatermarkText && project.watermarkText && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none"
            style={{ opacity: isLightTheme ? 0.08 : 0.12 }}
          >
            <p className="text-3xl md:text-4xl font-black uppercase tracking-widest text-center px-4 font-outfit transform -rotate-12">
              {project.watermarkText}
            </p>
          </div>
        )}

        {/* MAIN EDITABLE CONTENT CONTAINER */}
        <div
          className={`relative z-10 flex flex-col ${
            project.contentVerticalAlign === 'top'
              ? 'justify-start pt-6'
              : project.contentVerticalAlign === 'center'
              ? 'justify-center py-6'
              : 'justify-end pb-5'
          } h-full px-5 pointer-events-none transition-all`}
        >
          {/* CATEGORY / TOPIC BADGE / TAGLINE (Movable via Drag) */}
          {project.showCategoryBadge !== false && project.categoryBadge && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'badge')}
              className={`mb-3 flex group relative cursor-move pointer-events-auto transition-transform ${
                project.headlineAlign === 'center'
                  ? 'justify-center'
                  : project.headlineAlign === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
              style={{
                transform: `translate(${project.badgePosX || 0}px, ${project.badgePosY || 0}px)`
              }}
              title="Drag to move Category Tag"
            >
              <div className="relative inline-flex items-center group-hover:ring-1 group-hover:ring-red-400/50 rounded transition-all">
                {project.categoryBadgeStyle === 'pill' && (
                  <span className="px-4 py-1.5 rounded-xl text-sm md:text-base font-bold tracking-wide uppercase bg-red-600 text-white shadow-lg shadow-red-600/30 font-khand">
                    {project.categoryBadge}
                  </span>
                )}

                {project.categoryBadgeStyle === 'solid-rect' && (
                  <span className="px-4 py-1.5 rounded-sm text-sm md:text-base font-extrabold tracking-wider uppercase bg-red-600 text-white shadow-md font-khand border-b-2 border-red-800">
                    {project.categoryBadge}
                  </span>
                )}

                {project.categoryBadgeStyle === 'underline' && (
                  <div className="inline-flex flex-col items-center">
                    <span className="text-base md:text-lg font-black tracking-wider uppercase text-red-500 font-khand">
                      {project.categoryBadge}
                    </span>
                    <div className="w-full h-1 bg-red-600 mt-1 rounded-full" />
                  </div>
                )}

                {project.categoryBadgeStyle === 'tag' && (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-black tracking-widest uppercase text-red-500 font-khand">
                      {project.categoryBadge}
                    </span>
                  </div>
                )}

                {project.categoryBadgeStyle === 'neon-border' && (
                  <span className="px-3.5 py-1 rounded-md text-xs md:text-sm font-extrabold tracking-widest uppercase border border-red-500 text-red-400 bg-red-500/10 backdrop-blur-xs font-khand">
                    {project.categoryBadge}
                  </span>
                )}

                {/* Subtle move hint */}
                <span className="export-ignore absolute -top-4 right-0 opacity-0 group-hover:opacity-100 text-[10px] bg-black/80 text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-opacity">
                  <Move className="w-2.5 h-2.5" /> Move
                </span>
              </div>
            </div>
          )}

          {/* SUBHEADLINE (Only if explicitly enabled and non-empty) */}
          {project.showSubheadline && project.subheadline && (
            <div
              className={`mb-2.5 flex transition-transform pointer-events-auto ${
                project.headlineAlign === 'center'
                  ? 'justify-center'
                  : project.headlineAlign === 'right'
                  ? 'justify-end'
                  : 'justify-start'
              }`}
              style={{
                transform: `translate(${project.subheadlinePosX || 0}px, ${project.subheadlinePosY || 0}px)`
              }}
            >
              <span className="px-3 py-1 bg-red-700 text-white text-xs md:text-sm font-extrabold tracking-widest uppercase rounded shadow font-khand">
                {project.subheadline}
              </span>
            </div>
          )}

          {/* MAIN HEADLINE (Movable via Drag & Toggleable) */}
          {project.showHeadline !== false && project.headline && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'headline')}
              className="relative group cursor-move pointer-events-auto"
              style={{
                transform: `translate(${project.headlinePosX || 0}px, ${project.headlinePosY || 0}px)`,
                transition: draggingElement === 'headline' ? 'none' : 'transform 0.12s ease'
              }}
              title="Drag to move Headline / समातेर सार्नुहोस्"
            >
              <h2
                className={`font-bold leading-tight mb-2.5 tracking-tight ${project.headlineFont} ${
                  project.headlineAlign === 'center'
                    ? 'text-center'
                    : project.headlineAlign === 'right'
                    ? 'text-right'
                    : 'text-left'
                } ${project.headlineTransform === 'uppercase' ? 'uppercase' : ''} group-hover:outline-dashed group-hover:outline-1 group-hover:outline-red-400/60 rounded px-1`}
                style={{
                  fontSize: `${project.headlineSize}px`,
                  color: project.headlineColor,
                  textShadow: isDarkTheme
                    ? '0 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(0,0,0,0.5)'
                    : '0 1px 2px rgba(255,255,255,0.8)'
                }}
              >
                {renderHighlightedText(
                  project.headline,
                  isDarkTheme ? 'text-white' : 'text-slate-900'
                )}
              </h2>
              {/* Move Badge Indicator */}
              <span className="export-ignore absolute -top-5 left-2 opacity-0 group-hover:opacity-100 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-opacity pointer-events-none shadow">
                <Move className="w-2.5 h-2.5" /> Headline Drag
              </span>
            </div>
          )}

          {/* UNDERLINE ACCENT (for Nepal 360 & 24 Ghanta) */}
          {(project.templateStyle === 'nepal-360' || project.templateStyle === 'ghanta-24') && (
            <div className="w-full h-0.5 bg-slate-400/40 my-2" />
          )}

          {/* BODY / SUMMARY TEXT (Movable via Drag & Toggleable) */}
          {project.showBodyText !== false && project.bodyText && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'body')}
              className="relative group cursor-move pointer-events-auto"
              style={{
                transform: `translate(${project.bodyPosX || 0}px, ${project.bodyPosY || 0}px)`,
                transition: draggingElement === 'body' ? 'none' : 'transform 0.12s ease'
              }}
              title="Drag to move Summary text / समातेर सार्नुहोस्"
            >
              <div
                className={`leading-relaxed tracking-normal font-medium ${project.bodyFont} ${
                  project.bodyAlign === 'center'
                    ? 'text-center'
                    : project.bodyAlign === 'right'
                    ? 'text-right'
                    : 'text-left'
                } group-hover:outline-dashed group-hover:outline-1 group-hover:outline-amber-400/60 rounded px-1`}
                style={{
                  fontSize: `${project.bodySize}px`,
                  color: project.bodyColor,
                  textShadow: isDarkTheme
                    ? '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)'
                    : 'none'
                }}
              >
                {renderHighlightedText(
                  project.bodyText,
                  isDarkTheme ? 'text-slate-100' : 'text-slate-800'
                )}
              </div>
              <span className="export-ignore absolute -top-5 left-2 opacity-0 group-hover:opacity-100 text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded flex items-center gap-1 transition-opacity pointer-events-none shadow">
                <Move className="w-2.5 h-2.5" /> Text Drag
              </span>
            </div>
          )}

          {/* FOOTER BAR: Editable username / handle without like/comment icons (Movable via Drag) */}
          {project.showFooterBar !== false && (
            <div
              onPointerDown={(e) => handlePointerDown(e, 'footer')}
              className={`mt-3.5 pt-2 border-t border-slate-500/25 flex items-center ${
                project.footerAlign === 'center'
                  ? 'justify-center'
                  : project.footerAlign === 'right'
                  ? 'justify-end'
                  : 'justify-between'
              } text-xs group relative cursor-move pointer-events-auto select-none`}
              style={{
                transform: `translate(${project.footerPosX || 0}px, ${project.footerPosY || 0}px)`,
                transition: draggingElement === 'footer' ? 'none' : 'transform 0.12s ease'
              }}
              title="Drag to move username / handle or click to edit"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: project.footerAccentColor || '#ef4444' }}
                />

                {isEditingHandle && onUpdateProject ? (
                  <div className="flex items-center gap-1.5 w-full max-w-[280px]">
                    <input
                      type="text"
                      autoFocus
                      value={editingHandleValue}
                      onChange={(e) => setEditingHandleValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditedHandle();
                        if (e.key === 'Escape') setIsEditingHandle(false);
                      }}
                      className="bg-black/80 text-white border border-red-500 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none w-full"
                    />
                    <button
                      onClick={saveEditedHandle}
                      className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shrink-0"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUpdateProject) {
                        setEditingHandleValue(project.footerHandle || '');
                        setIsEditingHandle(true);
                      }
                    }}
                    className="flex items-center gap-1.5 group/handle cursor-pointer"
                    title="Click to edit handle / username"
                  >
                    <span
                      className={`font-semibold tracking-wide ${
                        isDarkTheme ? 'text-slate-200' : 'text-slate-800'
                      } group-hover/handle:underline`}
                    >
                      {project.footerHandle || '@yourchannel'}
                    </span>
                    <Edit2 className="export-ignore w-3 h-3 opacity-0 group-hover/handle:opacity-100 text-red-400 transition-opacity" />
                  </div>
                )}
              </div>

              {/* Move Handle Indicator Pill */}
              <div className="export-ignore flex items-center gap-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 bg-black/75 px-1.5 py-0.5 rounded backdrop-blur-xs transition-opacity ml-auto">
                <Move className="w-2.5 h-2.5 text-red-400" />
                <span>Move Handle</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CanvasPreview.displayName = 'CanvasPreview';
