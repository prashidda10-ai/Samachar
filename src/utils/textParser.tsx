import React from 'react';

/**
 * Parses markup strings into styled React spans.
 * Supports:
 * - {red}text{/red}, {yellow}text{/yellow}, {green}text{/green}, etc.
 * - {#hex}text{/#hex} or {color:#hex}text{/color} -> custom text color
 * - {bg:#hex}text{/bg} or {bg:colorName}text{/bg} -> custom background highlight pill
 * - {marker}text{/marker} -> yellow transparent highlighter pen effect
 * - {badge}text{/badge} -> red news badge
 * - **bold** or {bold}text{/bold}
 * - {underline}text{/underline}
 */

// Helper to determine if a hex color is bright (needs dark text) or dark (needs white text)
function isColorBright(hex: string): boolean {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return false;
  const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140;
}

export function renderHighlightedText(text: string, defaultColorClass: string = 'text-inherit'): React.ReactNode {
  if (!text) return null;

  // Regex matches:
  // 1. {bg:#hex or bg:name}content{/bg}
  // 2. {color:#hex}content{/color}
  // 3. {#hex}content{/#hex}
  // 4. {tag}content{/tag}
  // 5. **content**
  const regex = /\{bg:([^}]+)\}(.*?)\{\/bg\}|\{(?:color:)?(#[0-9a-fA-F]{3,8}|[a-zA-Z0-9_-]+)\}(.*?)\{\/(?:color:)?\3\}|\*\*(.*?)\*\*/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding normal text
    if (match.index > lastIndex) {
      elements.push(
        <span key={`text-${lastIndex}`} className={defaultColorClass}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    if (match[1]) {
      // Background highlight: {bg:val}content{/bg}
      const bgVal = match[1].trim();
      const content = match[2];
      const isHex = bgVal.startsWith('#') || /^[0-9a-fA-F]{6}$/.test(bgVal);
      const hexColor = isHex ? (bgVal.startsWith('#') ? bgVal : `#${bgVal}`) : '';

      if (hexColor) {
        const textColor = isColorBright(hexColor) ? '#0f172a' : '#ffffff';
        elements.push(
          <span
            key={`bg-hex-${match.index}`}
            style={{ backgroundColor: hexColor, color: textColor }}
            className="inline-block px-2 py-0.5 mx-0.5 rounded-md font-bold shadow-xs transition-all"
          >
            {content}
          </span>
        );
      } else {
        // Named bg
        let bgClass = 'bg-red-600 text-white';
        switch (bgVal.toLowerCase()) {
          case 'yellow':
            bgClass = 'bg-yellow-400 text-black';
            break;
          case 'red':
            bgClass = 'bg-red-600 text-white';
            break;
          case 'green':
            bgClass = 'bg-emerald-600 text-white';
            break;
          case 'blue':
            bgClass = 'bg-sky-600 text-white';
            break;
          case 'orange':
            bgClass = 'bg-orange-500 text-white';
            break;
          case 'white':
            bgClass = 'bg-white text-slate-900';
            break;
          case 'black':
            bgClass = 'bg-black text-white border border-white/20';
            break;
          case 'marker':
            bgClass = 'bg-yellow-300/80 text-black px-1.5 rounded-sm';
            break;
          default:
            bgClass = 'bg-red-600 text-white';
        }

        elements.push(
          <span
            key={`bg-named-${match.index}`}
            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-bold ${bgClass}`}
          >
            {content}
          </span>
        );
      }
    } else if (match[3]) {
      // Color tag or named style: {tag}content{/tag}
      const tag = match[3];
      const content = match[4];

      // Check if it's a hex code
      if (tag.startsWith('#')) {
        elements.push(
          <span key={`hex-${match.index}`} style={{ color: tag }} className="font-bold">
            {content}
          </span>
        );
      } else {
        const lower = tag.toLowerCase();
        let tagClass = '';
        let customStyle: React.CSSProperties | undefined = undefined;

        switch (lower) {
          case 'red':
            tagClass = 'text-red-500 font-bold';
            break;
          case 'yellow':
            tagClass = 'text-yellow-400 font-bold';
            break;
          case 'green':
            tagClass = 'text-emerald-400 font-bold';
            break;
          case 'blue':
            tagClass = 'text-sky-400 font-bold';
            break;
          case 'cyan':
            tagClass = 'text-cyan-400 font-bold';
            break;
          case 'orange':
            tagClass = 'text-orange-400 font-bold';
            break;
          case 'pink':
            tagClass = 'text-pink-400 font-bold';
            break;
          case 'purple':
            tagClass = 'text-purple-400 font-bold';
            break;
          case 'gold':
            tagClass = 'text-amber-300 font-bold';
            break;
          case 'white':
            tagClass = 'text-white font-bold';
            break;
          case 'black':
            tagClass = 'text-black font-bold';
            break;
          case 'marker':
            tagClass = 'bg-yellow-400/90 text-slate-950 px-1.5 py-0.5 rounded font-bold';
            break;
          case 'badge':
            tagClass = 'bg-red-600 text-white px-2 py-0.5 rounded font-bold shadow-sm';
            break;
          case 'bold':
            tagClass = 'font-bold';
            break;
          case 'underline':
            tagClass = 'underline decoration-red-500 decoration-2 underline-offset-4 font-bold';
            break;
          default:
            // Check if tag is 6-char or 3-char hex without '#'
            if (/^[0-9a-fA-F]{3,8}$/.test(tag)) {
              customStyle = { color: `#${tag}` };
              tagClass = 'font-bold';
            } else {
              tagClass = defaultColorClass;
            }
        }

        elements.push(
          <span key={`tag-${match.index}`} className={tagClass} style={customStyle}>
            {content}
          </span>
        );
      }
    } else if (match[5]) {
      // **bold** match
      elements.push(
        <strong key={`bold-${match.index}`} className="font-extrabold text-white">
          {match[5]}
        </strong>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Push remainder
  if (lastIndex < text.length) {
    elements.push(
      <span key={`text-end`} className={defaultColorClass}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return <>{elements}</>;
}

/**
 * Utility to strip highlight tags and return clean plain text for copying / accessibility
 */
export function stripHighlightTags(text: string): string {
  if (!text) return '';
  return text
    .replace(/\{bg:[^}]+\}(.*?)\{\/bg\}/g, '$1')
    .replace(/\{[#a-zA-Z0-9_-]+\}(.*?)\{\/[#a-zA-Z0-9_-]+\}/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1');
}
