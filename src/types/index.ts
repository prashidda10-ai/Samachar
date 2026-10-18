export type AspectRatioType = '1:1' | '4:5' | '9:16' | '16:9';

export type TemplateStyle = 
  | 'ronb-classic' 
  | 'nepal-360' 
  | 'ghanta-24' 
  | 'sharesanskar-split' 
  | 'breaking-red' 
  | 'cultural-gold' 
  | 'ronb-story'
  | 'sports-cricket'
  | 'balen-metro'
  | 'quote-statement'
  | 'viral-reel-916'
  | 'nepal-investigation';

export type NepaliFont = 
  | 'font-khand'
  | 'font-mukta' 
  | 'font-noto' 
  | 'font-rozha' 
  | 'font-yatra' 
  | 'font-rajdhani' 
  | 'font-teko'
  | 'font-poppins'
  | 'font-saira'
  | 'font-changa'
  | 'font-hind'
  | 'font-martel'
  | 'font-outfit'
  | 'font-modak'
  | 'font-kalam'
  | 'font-biryani'
  | 'font-notoserif'
  | 'font-gotu'
  | 'font-sarala'
  | 'font-bebas'
  | 'font-anton'
  | 'font-montserrat';

export type WatermarkPosition = 
  | 'top-left' 
  | 'top-right' 
  | 'center' 
  | 'bottom-center' 
  | 'bottom-right' 
  | 'bottom-left';

export interface NewsProject {
  id: string;
  title: string;
  updatedAt: number;
  templateStyle: TemplateStyle;
  aspectRatio: AspectRatioType;
  
  // Background media & interactive positioning
  mediaType: 'image' | 'video';
  mediaUrl: string;
  secondaryMediaUrl?: string; // For split/comparison or round inset
  mediaFit: 'cover' | 'contain' | 'fill';
  mediaBrightness: number; // 0 to 150%
  mediaContrast: number; // 50 to 150%
  mediaBlur: number; // 0 to 20px
  mediaPosX?: number; // 0 to 100%, default 50%
  mediaPosY?: number; // 0 to 100%, default 50%
  mediaScale?: number; // 0.5 to 3.0, default 1
  overlayOpacity: number; // 0 to 100%
  overlayGradient: 'bottom-dark' | 'bottom-white' | 'full-vignette' | 'top-and-bottom' | 'none';
  overlayHeight?: number; // 30% to 100%, default 80%

  // Text content & Positions
  contentVerticalAlign?: 'bottom' | 'center' | 'top'; // Default bottom
  showCategoryBadge?: boolean;
  categoryBadge: string;
  categoryBadgeColor: string; // red, orange, blue, dark, or custom hex
  categoryBadgeStyle: 'pill' | 'solid-rect' | 'underline' | 'tag' | 'neon-border';
  badgeSize?: number; // px size for tagline/badge, default 14
  badgeSingleLine?: boolean; // default true (keep tagline on 1 line)
  badgePosY?: number; // offset Y in px
  badgePosX?: number; // offset X in px
  
  showHeadline?: boolean;
  headline: string;
  headlineFont: NepaliFont;
  headlineSize: number; // relative size
  headlineColor: string;
  headlineAlign: 'left' | 'center' | 'right';
  headlineTransform: 'uppercase' | 'none';
  headlineSingleLine?: boolean; // lock headline to a single line (no wrap)
  headlinePosY?: number; // offset Y in px
  headlinePosX?: number; // offset X in px

  showSubheadline?: boolean;
  subheadline?: string;
  subheadlineSize?: number; // px size for subheadline/tagline, default 13
  subheadlinePosY?: number;
  subheadlinePosX?: number;

  showBodyText?: boolean;
  bodyText: string;
  bodyFont: NepaliFont;
  bodySize: number;
  bodyColor: string;
  bodyAlign: 'left' | 'center' | 'right';
  bodyPosY?: number; // offset Y in px
  bodyPosX?: number; // offset X in px

  // Watermark and Brand
  showLogo: boolean;
  logoUrl: string;
  logoPosition: WatermarkPosition;
  logoOpacity: number; // 10 to 100
  logoSize: number; // px
  logoPosY?: number; // offset Y in px
  logoPosX?: number; // offset X in px

  watermarkText: string;
  showWatermarkText: boolean;

  // Footer bar & custom user handle
  showFooterBar: boolean;
  footerHandle: string; // e.g. "@username" or website
  footerAccentColor: string;
  footerPosY?: number;
  footerPosX?: number;
  footerAlign?: 'left' | 'center' | 'right';
  footerStyle?: 'bar' | 'pill' | 'minimal';

  // Theme
  cardTheme: 'dark' | 'light' | 'transparent';
}

export interface SavedProjectItem {
  id: string;
  title: string;
  previewUrl?: string;
  updatedAt: number;
  data: NewsProject;
}
