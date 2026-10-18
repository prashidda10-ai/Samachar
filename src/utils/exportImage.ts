import { domToPng, domToJpeg, domToBlob } from 'modern-screenshot';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';
import { embedActiveFontsIntoElement } from './fontEmbedder';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality: number; // 0.8 to 1.0
  pixelRatio: number; // 2 to 3 for Ultra HD
  fileName?: string;
}

/**
 * Locks exact root container dimensions prior to DOM cloning without forcing nowrap
 * on multi-line headlines, ensuring 100% of the headline and tagline underline remain visible.
 */
export function lockTextLinesForExport(element: HTMLElement): () => void {
  const restoreFns: (() => void)[] = [];

  const origWidth = element.style.width;
  const origHeight = element.style.height;
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    element.style.width = `${Math.round(rect.width)}px`;
    element.style.height = `${Math.round(rect.height)}px`;
    restoreFns.push(() => {
      element.style.width = origWidth;
      element.style.height = origHeight;
    });
  }

  return () => {
    restoreFns.forEach((fn) => fn());
  };
}

/**
 * Temporarily freezes active video frames into image elements
 * so SVG foreignObject / canvas engines capture the background video cleanly
 */
function freezeVideoFramesForCapture(element: HTMLElement): () => void {
  const cleanupFns: (() => void)[] = [];
  const videos = element.querySelectorAll('video');

  videos.forEach((video) => {
    try {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const offscreen = document.createElement('canvas');
        offscreen.width = video.videoWidth;
        offscreen.height = video.videoHeight;
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
          const frameData = offscreen.toDataURL('image/png', 1.0);

          const tempImg = document.createElement('img');
          tempImg.src = frameData;
          tempImg.className = video.className;
          tempImg.style.cssText = video.style.cssText;
          tempImg.setAttribute('data-temp-freeze', 'true');

          const origDisplay = video.style.display;
          video.style.display = 'none';
          video.parentElement?.insertBefore(tempImg, video);

          cleanupFns.push(() => {
            tempImg.remove();
            video.style.display = origDisplay;
          });
        }
      }
    } catch (e) {
      console.warn('Video frame freeze warning:', e);
    }
  });

  return () => {
    cleanupFns.forEach((fn) => fn());
  };
}

export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportOptions = { format: 'png', quality: 1.0, pixelRatio: 2.5 }
): Promise<string> {
  const pixelRatio = options.pixelRatio || 2.5;

  // 1. Ensure all custom fonts are loaded in document memory
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // 2. Embed active Google Fonts as base64 @font-face inside element so SVG foreignObject
  // renders the exact font glyphs, full tagline underline, and complete headline without clipping
  const removeEmbeddedFonts = await embedActiveFontsIntoElement(element);
  const unlockText = lockTextLinesForExport(element);
  const unfreeze = freezeVideoFramesForCapture(element);

  const cleanupAll = () => {
    unfreeze();
    unlockText();
    removeEmbeddedFonts();
  };

  try {
    // 3. Primary Engine: modern-screenshot with inline base64 fonts already injected inside element
    const config = {
      scale: pixelRatio,
      quality: options.quality || 1.0,
      font: false as const,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList?.contains('export-ignore')) {
          return false;
        }
        return true;
      }
    };

    if (options.format === 'jpeg') {
      const result = await domToJpeg(element, config);
      if (result && result.length > 500) {
        cleanupAll();
        triggerConfetti();
        return result;
      }
    } else {
      const result = await domToPng(element, config);
      if (result && result.length > 500) {
        cleanupAll();
        triggerConfetti();
        return result;
      }
    }
  } catch (modernErr) {
    console.warn('modern-screenshot export encountered issue, falling back to html2canvas:', modernErr);
  }

  // 4. Secondary Fallback Engine: html2canvas
  try {
    const canvas = await html2canvas(element, {
      scale: pixelRatio,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      ignoreElements: (el) => el.classList.contains('export-ignore')
    });

    cleanupAll();
    const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, options.quality || 1.0);
    if (dataUrl && dataUrl.length > 500) {
      triggerConfetti();
      return dataUrl;
    }
  } catch (h2cErr) {
    cleanupAll();
    console.warn('html2canvas fallback failed:', h2cErr);
  }

  cleanupAll();
  throw new Error('Could not generate high-resolution image export');
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 55,
      spread: 65,
      origin: { y: 0.8 }
    });
  } catch {
    // ignore
  }
}

export function downloadDataUrl(dataUrl: string, fileName: string = 'samachar-maker-post.png') {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getElementAsBlob(
  element: HTMLElement,
  options: { pixelRatio?: number } = { pixelRatio: 2.5 }
): Promise<Blob | null> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const removeEmbeddedFonts = await embedActiveFontsIntoElement(element);
  const unlockText = lockTextLinesForExport(element);
  const unfreeze = freezeVideoFramesForCapture(element);
  const cleanupAll = () => {
    unfreeze();
    unlockText();
    removeEmbeddedFonts();
  };

  try {
    const blob = await domToBlob(element, {
      scale: options.pixelRatio || 2.5,
      font: false as const,
      filter: (node: Node) => {
        if (node instanceof HTMLElement && node.classList?.contains('export-ignore')) {
          return false;
        }
        return true;
      }
    });
    cleanupAll();
    if (blob) return blob;
  } catch {
    cleanupAll();
  }

  try {
    const dataUrl = await exportElementAsImage(element, {
      format: 'png',
      quality: 1.0,
      pixelRatio: options.pixelRatio || 2.5
    });
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch {
    return null;
  }
}
