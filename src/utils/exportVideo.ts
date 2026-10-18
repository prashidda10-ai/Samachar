import { domToCanvas } from 'modern-screenshot';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { lockTextLinesForExport } from './exportImage';
import { embedActiveFontsIntoElement } from './fontEmbedder';

export interface VideoExportOptions {
  /**
   * 0 = Full duration of uploaded video (or 6s if image card)
   * > 0 = Specific duration in seconds (e.g., 5, 10, 15, 30, 60)
   */
  durationSeconds?: number;
  fps?: number; // default 30
  includeAudio?: boolean; // default true
  onProgress?: (progress: number) => void;
  fileName?: string;
}

/**
 * Returns the duration (in seconds) of the uploaded video inside the canvas if present
 */
export function getUploadedVideoDuration(element: HTMLElement | null): number | null {
  if (!element) return null;
  const video = element.querySelector('video');
  if (video && video.duration && isFinite(video.duration) && video.duration > 0) {
    return Math.round(video.duration * 10) / 10;
  }
  return null;
}

/**
 * Checks supported MIME types for video export, preferring MP4 (H.264/AAC) when available
 */
export function getSupportedVideoMimeType(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'mp4' };
  }

  const candidates = [
    { mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', extension: 'mp4' },
    { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=h264,opus', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=h264', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9,opus', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp8,opus', extension: 'mp4' },
    { mimeType: 'video/webm', extension: 'mp4' }
  ];

  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c.mimeType)) {
        return c;
      }
    } catch {
      // continue
    }
  }

  return { mimeType: '', extension: 'mp4' };
}

/**
 * Helper to draw an image or video element onto a 2D canvas with object-fit (cover/contain/fill),
 * custom object-position (posX%, posY%), scale, and CSS filters.
 */
function drawMediaWithFit(
  ctx: CanvasRenderingContext2D,
  media: HTMLVideoElement | HTMLImageElement,
  mediaNaturalW: number,
  mediaNaturalH: number,
  destX: number,
  destY: number,
  destW: number,
  destH: number,
  fit: 'cover' | 'contain' | 'fill',
  posXPercent: number,
  posYPercent: number,
  scaleFactor: number,
  filterStr: string
) {
  if (mediaNaturalW <= 0 || mediaNaturalH <= 0 || destW <= 0 || destH <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(destX, destY, destW, destH);
  ctx.clip();

  if (filterStr && filterStr !== 'none') {
    ctx.filter = filterStr;
  }

  const centerX = destX + destW / 2;
  const centerY = destY + destH / 2;
  ctx.translate(centerX, centerY);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.translate(-centerX, -centerY);

  if (fit === 'fill') {
    ctx.drawImage(media, destX, destY, destW, destH);
  } else if (fit === 'contain') {
    const ratio = Math.min(destW / mediaNaturalW, destH / mediaNaturalH);
    const drawW = mediaNaturalW * ratio;
    const drawH = mediaNaturalH * ratio;
    const offsetX = destX + (destW - drawW) * (posXPercent / 100);
    const offsetY = destY + (destH - drawH) * (posYPercent / 100);
    ctx.drawImage(media, offsetX, offsetY, drawW, drawH);
  } else {
    // cover
    const ratio = Math.max(destW / mediaNaturalW, destH / mediaNaturalH);
    const drawW = mediaNaturalW * ratio;
    const drawH = mediaNaturalH * ratio;
    const offsetX = destX + (destW - drawW) * (posXPercent / 100);
    const offsetY = destY + (destH - drawH) * (posYPercent / 100);
    ctx.drawImage(media, offsetX, offsetY, drawW, drawH);
  }

  ctx.restore();
}

/**
 * Captures ONLY the transparent foreground overlay (gradients, badges, headline, body, logo, footer)
 * by temporarily hiding the background media and solid background color.
 */
async function captureTransparentOverlayCanvas(
  element: HTMLElement,
  scale: number
): Promise<HTMLCanvasElement> {
  const removeEmbeddedFonts = await embedActiveFontsIntoElement(element);
  const unlockText = lockTextLinesForExport(element);
  const restoreFns: (() => void)[] = [];

  // Make root background transparent so overlay has true alpha channel
  const origBg = element.style.backgroundColor;
  const origBoxShadow = element.style.boxShadow;
  element.style.backgroundColor = 'transparent';
  element.style.boxShadow = 'none';
  restoreFns.push(() => {
    element.style.backgroundColor = origBg;
    element.style.boxShadow = origBoxShadow;
  });

  // Hide background media elements (video / background photo) while keeping gradient overlays & text visible
  const mediaContainers = element.querySelectorAll<HTMLElement>('[data-media-element="true"], video');
  mediaContainers.forEach((m) => {
    const prevOpacity = m.style.opacity;
    m.style.opacity = '0';
    restoreFns.push(() => {
      m.style.opacity = prevOpacity;
    });
  });

  const cleanup = () => {
    restoreFns.forEach((fn) => fn());
    unlockText();
    removeEmbeddedFonts();
  };

  try {
    const canvas = await domToCanvas(element, {
      scale,
      backgroundColor: null as any,
      font: false as const,
      filter: (node) => !(node instanceof HTMLElement && node.classList?.contains('export-ignore'))
    });
    cleanup();
    return canvas;
  } catch {
    try {
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        ignoreElements: (el) => el.classList.contains('export-ignore')
      });
      cleanup();
      return canvas;
    } catch (err) {
      cleanup();
      throw err;
    }
  }
}

/**
 * Records the news card canvas into a full-length MP4 video clip with live background video/photo and crisp overlays
 */
export async function exportElementAsVideo(
  element: HTMLElement,
  options: VideoExportOptions = {}
): Promise<string> {
  const fps = options.fps || 30;
  const scale = 2;

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const sourceVideo = element.querySelector('video') as HTMLVideoElement | null;
  const bgImages = Array.from(
    element.querySelectorAll<HTMLImageElement>('[data-media-element="true"] img, img[data-media-element="true"]')
  );

  // Determine target duration:
  // If durationSeconds === 0 (or undefined when video is present), use the full uploaded video duration!
  let durationSeconds = options.durationSeconds ?? 0;
  if (sourceVideo && sourceVideo.duration && isFinite(sourceVideo.duration) && sourceVideo.duration > 0) {
    if (durationSeconds <= 0) {
      durationSeconds = sourceVideo.duration;
    }
  } else if (durationSeconds <= 0) {
    durationSeconds = 6; // Default 6s cinematic reel for static photos
  }

  // Clamp duration between 1s and 300s (5 minutes max safety)
  durationSeconds = Math.max(1, Math.min(300, durationSeconds));

  // Read base background color before making transparent
  const computedRoot = window.getComputedStyle(element);
  const baseBgColor =
    computedRoot.backgroundColor && computedRoot.backgroundColor !== 'rgba(0, 0, 0, 0)'
      ? computedRoot.backgroundColor
      : '#09090b';

  // Read media styling (fit, objectPosition, transform scale, filter)
  const activeMediaEl = sourceVideo || bgImages[0] || null;
  let mediaFit: 'cover' | 'contain' | 'fill' = 'cover';
  let posXPercent = 50;
  let posYPercent = 50;
  let baseMediaScale = 1;
  let mediaFilter = 'none';

  if (activeMediaEl) {
    const cs = window.getComputedStyle(activeMediaEl);
    if (cs.objectFit === 'contain' || cs.objectFit === 'fill') {
      mediaFit = cs.objectFit;
    }
    if (cs.objectPosition) {
      const parts = cs.objectPosition.split(/\s+/);
      if (parts[0]?.endsWith('%')) posXPercent = parseFloat(parts[0]) || 50;
      if (parts[1]?.endsWith('%')) posYPercent = parseFloat(parts[1]) || 50;
    }
    if (cs.filter && cs.filter !== 'none') {
      mediaFilter = cs.filter;
    }
    const inlineTransform = activeMediaEl.style.transform || '';
    const scaleMatch = inlineTransform.match(/scale\(([^)]+)\)/);
    if (scaleMatch && scaleMatch[1]) {
      baseMediaScale = parseFloat(scaleMatch[1]) || 1;
    }
  }

  // 1. Capture transparent foreground overlay canvas (badges, headline, gradients, logo, footer)
  const overlayCanvas = await captureTransparentOverlayCanvas(element, scale);

  // Enforce EVEN width and height for H.264 / MP4 encoder compatibility
  const width = Math.max(2, Math.floor(overlayCanvas.width / 2) * 2);
  const height = Math.max(2, Math.floor(overlayCanvas.height / 2) * 2);

  const recordCanvas = document.createElement('canvas');
  recordCanvas.width = width;
  recordCanvas.height = height;
  const ctx = recordCanvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context not available');

  const { mimeType } = getSupportedVideoMimeType();

  // 2. Build MediaStream (Canvas Video Stream + Optional Audio Track from Source Video)
  const canvasStream = recordCanvas.captureStream(fps);
  const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

  // Save original video state so we can restore after export
  const origMuted = sourceVideo ? sourceVideo.muted : true;
  const origLoop = sourceVideo ? sourceVideo.loop : true;
  const origCurrentTime = sourceVideo ? sourceVideo.currentTime : 0;

  if (sourceVideo && options.includeAudio !== false) {
    try {
      // Unmute briefly or capture stream track if available
      const vidAny = sourceVideo as any;
      const vidStream: MediaStream | undefined =
        typeof vidAny.captureStream === 'function'
          ? vidAny.captureStream()
          : typeof vidAny.mozCaptureStream === 'function'
          ? vidAny.mozCaptureStream()
          : undefined;

      if (vidStream && vidStream.getAudioTracks().length > 0) {
        combinedTracks.push(vidStream.getAudioTracks()[0]);
      }
    } catch {
      // Browser security or muted video: proceed with video-only track cleanly
    }
  }

  const finalStream = new MediaStream(combinedTracks);

  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = mimeType
      ? new MediaRecorder(finalStream, {
          mimeType,
          videoBitsPerSecond: 8000000
        })
      : new MediaRecorder(finalStream, {
          videoBitsPerSecond: 8000000
        });
  } catch {
    // Fallback with default browser options if custom mimeType + audio combination was rejected
    mediaRecorder = new MediaRecorder(canvasStream);
  }

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<string>((resolve, reject) => {
    let animationFrameId: number | null = null;
    let isFinished = false;

    const finishRecording = () => {
      if (isFinished) return;
      isFinished = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
    };

    mediaRecorder.onstop = () => {
      // Restore source video state
      if (sourceVideo) {
        sourceVideo.muted = origMuted;
        sourceVideo.loop = origLoop;
        sourceVideo.currentTime = origCurrentTime;
        sourceVideo.play().catch(() => {});
      }

      try {
        const outMime = mediaRecorder.mimeType || mimeType || 'video/mp4';
        const finalBlob = new Blob(chunks, { type: outMime });
        const videoUrl = URL.createObjectURL(finalBlob);

        try {
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.75 }
          });
        } catch {
          // ignore
        }

        options.onProgress?.(100);
        resolve(videoUrl);
      } catch (err) {
        reject(err);
      }
    };

    mediaRecorder.onerror = (e) => {
      if (sourceVideo) {
        sourceVideo.muted = origMuted;
        sourceVideo.loop = origLoop;
      }
      reject(e);
    };

    const startRecordingLoop = () => {
      const startTime = performance.now();
      const totalMs = durationSeconds * 1000;

      try {
        mediaRecorder.start(100);
      } catch (err) {
        reject(err);
        return;
      }

      const renderFrame = (now: number) => {
        if (isFinished) return;

        const elapsedMs = now - startTime;
        const progressRatio = Math.min(1, elapsedMs / totalMs);
        const progressPercent = Math.min(99, Math.round(progressRatio * 100));
        options.onProgress?.(progressPercent);

        // 1. Fill base card background
        ctx.fillStyle = baseBgColor;
        ctx.fillRect(0, 0, width, height);

        // 2. Draw live video or animated photo background
        if (sourceVideo && sourceVideo.readyState >= 2) {
          drawMediaWithFit(
            ctx,
            sourceVideo,
            sourceVideo.videoWidth || width,
            sourceVideo.videoHeight || height,
            0,
            0,
            width,
            height,
            mediaFit,
            posXPercent,
            posYPercent,
            baseMediaScale,
            mediaFilter
          );
        } else if (bgImages.length === 2) {
          // Split comparison layout (2 photos side by side in top 65%)
          const splitH = height * 0.65;
          const halfW = width / 2;
          const kenBurns = baseMediaScale * (1 + progressRatio * 0.035);
          if (bgImages[0]?.complete) {
            drawMediaWithFit(
              ctx,
              bgImages[0],
              bgImages[0].naturalWidth || halfW,
              bgImages[0].naturalHeight || splitH,
              0,
              0,
              halfW,
              splitH,
              'cover',
              posXPercent,
              posYPercent,
              kenBurns,
              mediaFilter
            );
          }
          if (bgImages[1]?.complete) {
            drawMediaWithFit(
              ctx,
              bgImages[1],
              bgImages[1].naturalWidth || halfW,
              bgImages[1].naturalHeight || splitH,
              halfW,
              0,
              halfW,
              splitH,
              'cover',
              posXPercent,
              posYPercent,
              kenBurns,
              mediaFilter
            );
          }
        } else if (bgImages.length === 1 && bgImages[0]?.complete) {
          // Single photo with subtle cinematic Ken Burns zoom
          const kenBurns = baseMediaScale * (1 + progressRatio * 0.04);
          drawMediaWithFit(
            ctx,
            bgImages[0],
            bgImages[0].naturalWidth || width,
            bgImages[0].naturalHeight || height,
            0,
            0,
            width,
            height,
            mediaFit,
            posXPercent,
            posYPercent,
            kenBurns,
            mediaFilter
          );
        }

        // 3. Composite crisp transparent card overlay (gradients, badge, headline, body, logo, handle) on top
        ctx.drawImage(overlayCanvas, 0, 0, width, height);

        // Check completion condition
        if (elapsedMs >= totalMs || (sourceVideo && !sourceVideo.loop && sourceVideo.ended)) {
          finishRecording();
          return;
        }

        animationFrameId = requestAnimationFrame(renderFrame);
      };

      animationFrameId = requestAnimationFrame(renderFrame);
    };

    // If we have a video, seek to 0:00 and start playing before launching the recording loop
    if (sourceVideo) {
      const shouldLoop = Boolean(
        options.durationSeconds &&
          options.durationSeconds > 0 &&
          sourceVideo.duration &&
          options.durationSeconds > sourceVideo.duration
      );
      sourceVideo.loop = shouldLoop;

      const onSeekedAndReady = () => {
        sourceVideo.removeEventListener('seeked', onSeekedAndReady);
        sourceVideo
          .play()
          .then(() => {
            startRecordingLoop();
          })
          .catch(() => {
            // If unmuted play was blocked, mute and play
            sourceVideo.muted = true;
            sourceVideo.play().finally(() => startRecordingLoop());
          });
      };

      try {
        sourceVideo.pause();
        if (Math.abs(sourceVideo.currentTime) > 0.05) {
          sourceVideo.addEventListener('seeked', onSeekedAndReady, { once: true });
          sourceVideo.currentTime = 0;
          // Safety timeout in case seeked event doesn't fire
          setTimeout(() => {
            sourceVideo.removeEventListener('seeked', onSeekedAndReady);
            if (!isFinished && mediaRecorder.state === 'inactive') {
              onSeekedAndReady();
            }
          }, 400);
        } else {
          onSeekedAndReady();
        }
      } catch {
        startRecordingLoop();
      }
    } else {
      startRecordingLoop();
    }
  });
}

export function downloadVideoBlob(blobUrl: string, fileName: string = 'samachar-reel.mp4') {
  const link = document.createElement('a');
  link.download = fileName.endsWith('.mp4') ? fileName : `${fileName}.mp4`;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
