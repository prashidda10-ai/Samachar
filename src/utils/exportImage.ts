import { toPng, toJpeg, toBlob } from 'html-to-image';
import confetti from 'canvas-confetti';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  quality: number; // 0.8 to 1.0
  pixelRatio: number; // 2 or 3 for Ultra HD
  fileName?: string;
}

export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportOptions = { format: 'png', quality: 0.95, pixelRatio: 2 }
): Promise<string> {
  const pixelRatio = options.pixelRatio || 2;

  // Wait for web fonts to be completely ready in browser memory before capturing
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font loading wait error
    }
  }

  const config = {
    pixelRatio,
    quality: options.quality || 0.95,
    cacheBust: false,
    skipFonts: true, // Crucial: Prevents SecurityError on cross-origin Google Fonts stylesheets
    filter: (node: HTMLElement) => {
      // Exclude interactive guides, drag hints, audio controls or tooltips
      if (node.classList?.contains('export-ignore')) {
        return false;
      }
      return true;
    }
  };

  let dataUrl = '';
  try {
    if (options.format === 'jpeg') {
      dataUrl = await toJpeg(element, config);
    } else {
      dataUrl = await toPng(element, config);
    }
  } catch (err) {
    console.warn('Initial export with high-res options failed, retrying with fallback config:', err);
    // Robust fallback without custom scaling
    const fallbackConfig = {
      pixelRatio: 1.5,
      skipFonts: true,
      cacheBust: false,
      filter: (node: HTMLElement) => !node.classList?.contains('export-ignore')
    };
    if (options.format === 'jpeg') {
      dataUrl = await toJpeg(element, fallbackConfig);
    } else {
      dataUrl = await toPng(element, fallbackConfig);
    }
  }

  // Trigger celebration confetti
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  } catch {
    // ignore
  }

  return dataUrl;
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
  options: { pixelRatio?: number } = { pixelRatio: 2 }
): Promise<Blob | null> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }
  return await toBlob(element, {
    pixelRatio: options.pixelRatio || 2,
    cacheBust: false,
    skipFonts: true
  });
}
