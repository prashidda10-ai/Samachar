import { toCanvas } from 'html-to-image';
import confetti from 'canvas-confetti';

export interface VideoExportOptions {
  durationSeconds?: number; // 3 to 15 seconds, default 5
  fps?: number; // default 25
  onProgress?: (progress: number) => void;
  fileName?: string;
}

/**
 * Checks supported MIME types for video export, preferring MP4 when available
 */
export function getSupportedVideoMimeType(): { mimeType: string; extension: string } {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: 'video/webm', extension: 'mp4' };
  }

  const types = [
    { mimeType: 'video/mp4;codecs=avc1', extension: 'mp4' },
    { mimeType: 'video/mp4', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=h264', extension: 'mp4' },
    { mimeType: 'video/webm;codecs=vp9', extension: 'webm' },
    { mimeType: 'video/webm', extension: 'mp4' }
  ];

  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t.mimeType)) {
      return t;
    }
  }

  return { mimeType: 'video/webm', extension: 'mp4' };
}

/**
 * Records the news card canvas into an MP4 / video clip for Instagram Reels, Stories & TikTok
 */
export async function exportElementAsVideo(
  element: HTMLElement,
  options: VideoExportOptions = {}
): Promise<string> {
  const duration = options.durationSeconds || 5;
  const fps = options.fps || 25;
  const totalFrames = duration * fps;

  // 1. Initial snapshot of the canvas layout using html-to-image
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // Create base snapshot canvas
  const snapshotCanvas = await toCanvas(element, {
    pixelRatio: 1.5,
    skipFonts: true,
    cacheBust: false,
    filter: (node: HTMLElement) => !node.classList?.contains('export-ignore')
  });

  const width = snapshotCanvas.width;
  const height = snapshotCanvas.height;

  // Output recording canvas
  const recordCanvas = document.createElement('canvas');
  recordCanvas.width = width;
  recordCanvas.height = height;
  const ctx = recordCanvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const { mimeType, extension } = getSupportedVideoMimeType();

  // Create stream from recordCanvas
  const stream = recordCanvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
    videoBitsPerSecond: 6000000 // 6 Mbps high quality
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<string>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      try {
        const finalBlob = new Blob(chunks, { type: mimeType });
        const videoUrl = URL.createObjectURL(finalBlob);

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.75 }
          });
        } catch {
          // ignore
        }

        resolve(videoUrl);
      } catch (err) {
        reject(err);
      }
    };

    mediaRecorder.onerror = (e) => {
      reject(e);
    };

    // Check if there is an active HTML5 video inside the element
    const sourceVideo = element.querySelector('video') as HTMLVideoElement | null;
    if (sourceVideo && !sourceVideo.paused) {
      sourceVideo.currentTime = 0;
      sourceVideo.play().catch(() => {});
    }

    mediaRecorder.start(100); // 100ms timeslices

    let currentFrame = 0;
    const intervalMs = 1000 / fps;

    const renderLoop = setInterval(async () => {
      currentFrame++;
      const progress = Math.min(100, Math.round((currentFrame / totalFrames) * 100));
      options.onProgress?.(progress);

      // Render frame onto recordCanvas
      ctx.clearRect(0, 0, width, height);

      // Draw base card snapshot
      // For rich video reel feel, apply subtle dynamic zoom or live frame
      const scale = 1 + (currentFrame / totalFrames) * 0.025; // Subtle 2.5% cinematic zoom
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(scale, scale);
      ctx.drawImage(snapshotCanvas, -width / 2, -height / 2, width, height);
      ctx.restore();

      // If active video is playing, overlay current video frame directly
      if (sourceVideo && sourceVideo.readyState >= 2) {
        try {
          // The background video renders with same aspect ratio
          // snapshotCanvas already contains the static frame, but updating video gives live playback
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.drawImage(sourceVideo, 0, 0, width, height);
          ctx.restore();
        } catch {
          // ignore video draw error
        }
      }

      if (currentFrame >= totalFrames) {
        clearInterval(renderLoop);
        mediaRecorder.stop();
      }
    }, intervalMs);
  });
}

/**
 * Trigger download of generated video
 */
export function downloadVideoBlob(videoUrl: string, fileName: string = 'samachar-reel.mp4') {
  const link = document.createElement('a');
  link.href = videoUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
