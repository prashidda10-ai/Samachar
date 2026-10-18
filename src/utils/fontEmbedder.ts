/**
 * Fetches Google Fonts CSS and embeds the .woff2 binaries as base64 data URLs
 * directly into a <style> tag inside the target canvas element so SVG foreignObject
 * (modern-screenshot) renders 100% identical font metrics, underlines, and line wraps.
 */

const FONT_CLASS_TO_GOOGLE_FAMILY: Record<string, string> = {
  'font-khand': 'Khand:wght@400;500;600;700',
  'font-mukta': 'Mukta:wght@400;500;600;700;800',
  'font-noto': 'Noto+Sans+Devanagari:wght@400;500;600;700;800',
  'font-rozha': 'Rozha+One',
  'font-yatra': 'Yatra+One',
  'font-outfit': 'Outfit:wght@400;500;600;700;800;900',
  'font-rajdhani': 'Rajdhani:wght@600;700',
  'font-modak': 'Modak',
  'font-kalam': 'Kalam:wght@400;700',
  'font-biryani': 'Biryani:wght@400;600;700;800;900',
  'font-notoserif': 'Noto+Serif+Devanagari:wght@400;600;700;800',
  'font-gotu': 'Gotu',
  'font-sarala': 'Sarala:wght@400;700',
  'font-bebas': 'Bebas+Neue',
  'font-anton': 'Anton',
  'font-montserrat': 'Montserrat:wght@400;600;700;800;900',
  'font-teko': 'Teko:wght@500;600;700',
  'font-poppins': 'Poppins:wght@400;500;600;700;800;900',
  'font-saira': 'Saira+Semi+Condensed:wght@600;700;800;900',
  'font-changa': 'Changa+One',
  'font-hind': 'Hind:wght@400;600;700',
  'font-martel': 'Martel:wght@400;700;900'
};

export const FONT_CLASS_TO_CSS_NAME: Record<string, string> = {
  'font-khand': 'Khand',
  'font-mukta': 'Mukta',
  'font-noto': 'Noto Sans Devanagari',
  'font-rozha': 'Rozha One',
  'font-yatra': 'Yatra One',
  'font-outfit': 'Outfit',
  'font-rajdhani': 'Rajdhani',
  'font-modak': 'Modak',
  'font-kalam': 'Kalam',
  'font-biryani': 'Biryani',
  'font-notoserif': 'Noto Serif Devanagari',
  'font-gotu': 'Gotu',
  'font-sarala': 'Sarala',
  'font-bebas': 'Bebas Neue',
  'font-anton': 'Anton',
  'font-montserrat': 'Montserrat',
  'font-teko': 'Teko',
  'font-poppins': 'Poppins',
  'font-saira': 'Saira Semi Condensed',
  'font-changa': 'Changa One',
  'font-hind': 'Hind',
  'font-martel': 'Martel'
};

// Cache of Google Family parameter -> resolved @font-face CSS with base64 data URLs
const embeddedFontCssCache = new Map<string, string>();

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function fetchAndEmbedGoogleFontFamily(familyParam: string): Promise<string> {
  if (embeddedFontCssCache.has(familyParam)) {
    return embeddedFontCssCache.get(familyParam)!;
  }

  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
    const res = await fetch(cssUrl);
    if (!res.ok) return '';
    let cssText = await res.text();

    // Match all url(https://...) occurrences
    const urlRegex = /url\((['"]?)(https:\/\/[^)'"]+)\1\)/g;
    const matches = Array.from(cssText.matchAll(urlRegex));

    await Promise.all(
      matches.map(async (match) => {
        const fullMatch = match[0];
        const fontFileUrl = match[2];
        try {
          const fontRes = await fetch(fontFileUrl);
          if (!fontRes.ok) return;
          const buf = await fontRes.arrayBuffer();
          const base64 = arrayBufferToBase64(buf);
          const mime = fontFileUrl.endsWith('.woff2')
            ? 'font/woff2'
            : fontFileUrl.endsWith('.woff')
            ? 'font/woff'
            : 'font/ttf';
          const dataUrl = `url("data:${mime};base64,${base64}")`;
          cssText = cssText.split(fullMatch).join(dataUrl);
        } catch {
          // ignore individual font subset error
        }
      })
    );

    embeddedFontCssCache.set(familyParam, cssText);
    return cssText;
  } catch (e) {
    console.warn('Could not embed font family:', familyParam, e);
    return '';
  }
}

/**
 * Inspects the canvas element for any font-* classes used, fetches and caches their
 * base64 @font-face rules, and injects an inline <style> inside the element so
 * SVG foreignObject export renders the exact fonts without clipping or width mismatch.
 */
export async function embedActiveFontsIntoElement(element: HTMLElement): Promise<() => void> {
  const familiesToLoad = new Set<string>([
    FONT_CLASS_TO_GOOGLE_FAMILY['font-khand'],
    FONT_CLASS_TO_GOOGLE_FAMILY['font-outfit'],
    FONT_CLASS_TO_GOOGLE_FAMILY['font-noto']
  ]);

  // Detect any font-* classes inside element
  const allNodes = [element, ...Array.from(element.querySelectorAll('*'))];
  allNodes.forEach((node) => {
    if (node instanceof HTMLElement && typeof node.className === 'string') {
      node.className.split(/\s+/).forEach((cls) => {
        if (FONT_CLASS_TO_GOOGLE_FAMILY[cls]) {
          familiesToLoad.add(FONT_CLASS_TO_GOOGLE_FAMILY[cls]);
        }
      });
    }
  });

  const cssChunks = await Promise.all(
    Array.from(familiesToLoad).map((fam) => fetchAndEmbedGoogleFontFamily(fam))
  );

  // Also include font utility class definitions so foreignObject always resolves .font-khand etc.
  const utilityRules = Object.entries(FONT_CLASS_TO_CSS_NAME)
    .map(([cls, familyName]) => `.${cls} { font-family: '${familyName}', 'Noto Sans Devanagari', sans-serif !important; }`)
    .join('\n');

  const combinedCss = `${cssChunks.join('\n')}\n${utilityRules}`;

  // Remove any previous injected style
  const existing = element.querySelector('style[data-samachar-embedded-fonts="true"]');
  if (existing) existing.remove();

  const styleEl = document.createElement('style');
  styleEl.setAttribute('data-samachar-embedded-fonts', 'true');
  styleEl.textContent = combinedCss;
  element.prepend(styleEl);

  return () => {
    styleEl.remove();
  };
}
