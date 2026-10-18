import React, { useRef, useState } from 'react';
import { NewsProject, AspectRatioType, NepaliFont } from '../types';
import { TEMPLATES } from '../data/defaultTemplates';
import { SAMPLE_NEWS_IMAGES, PRESET_LOGOS, NEPALI_TAG_PRESETS } from '../data/sampleMedia';
import { stripHighlightTags } from '../utils/textParser';
import {
  LayoutTemplate,
  Image as ImageIcon,
  Type,
  ShieldCheck,
  Upload,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Eye,
  EyeOff,
  Paintbrush,
  X,
  Plus,
  Sparkles,
  Layers
} from 'lucide-react';

import { Language, TRANSLATIONS } from '../utils/translations';

interface EditorSidebarProps {
  project: NewsProject;
  onChange: (updated: NewsProject) => void;
  onApplyTemplate: (styleKey: string) => void;
  language: Language;
  onOpenAI?: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  project,
  onChange,
  onApplyTemplate,
  language,
  onOpenAI
}) => {
  const t = TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState<'templates' | 'content' | 'media' | 'branding'>('templates');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'viral' | 'breaking' | 'sports' | 'politics' | 'video'>('all');
  const [customHighlightColor, setCustomHighlightColor] = useState('#ff3b30');
  const [showSubheadlineInput, setShowSubheadlineInput] = useState(Boolean(project.subheadline));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Helper to update specific fields
  const updateField = <K extends keyof NewsProject>(key: K, value: NewsProject[K]) => {
    onChange({ ...project, [key]: value, updatedAt: Date.now() });
  };

  // Handle custom photo or video file upload preserving full native resolution
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isSecondary: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    if (isVideo) {
      // Direct object URL maintains 100% raw video stream quality with zero compression artifacts
      const objectUrl = URL.createObjectURL(file);
      onChange({
        ...project,
        mediaUrl: objectUrl,
        mediaType: 'video',
        updatedAt: Date.now()
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isSecondary) {
        updateField('secondaryMediaUrl', result);
      } else {
        onChange({
          ...project,
          mediaUrl: result,
          mediaType: 'image',
          updatedAt: Date.now()
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle custom logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField('logoUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Insert color tags into headline or body text
  const insertColorTag = (field: 'headline' | 'bodyText', colorTag: string) => {
    const current = project[field];
    const sampleWord = field === 'headline' ? 'Nepal' : 'Important';
    updateField(field, `${current} {${colorTag}}${sampleWord}{/${colorTag}}`);
  };

  // Insert custom background pill highlight
  const insertBgHighlight = (field: 'headline' | 'bodyText', hexColor: string) => {
    const current = project[field];
    updateField(field, `${current} {bg:${hexColor}}Breaking{/bg}`);
  };

  // Clear all highlights
  const handleClearHighlights = (field: 'headline' | 'bodyText') => {
    updateField(field, stripHighlightTags(project[field]));
  };

  const [selectedTextToMove, setSelectedTextToMove] = useState<'headline' | 'badge' | 'body'>('headline');

  // Nudge media position
  const nudgeMedia = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(100, (project.mediaPosX ?? 50) + dx));
    const newY = Math.max(0, Math.min(100, (project.mediaPosY ?? 50) + dy));
    onChange({ ...project, mediaPosX: newX, mediaPosY: newY, updatedAt: Date.now() });
  };

  // Nudge text and username position
  const nudgeText = (element: 'headline' | 'badge' | 'body' | 'footer', dx: number, dy: number) => {
    if (element === 'headline') {
      const curX = project.headlinePosX || 0;
      const curY = project.headlinePosY || 0;
      onChange({ ...project, headlinePosX: curX + dx, headlinePosY: curY + dy, updatedAt: Date.now() });
    } else if (element === 'badge') {
      const curX = project.badgePosX || 0;
      const curY = project.badgePosY || 0;
      onChange({ ...project, badgePosX: curX + dx, badgePosY: curY + dy, updatedAt: Date.now() });
    } else if (element === 'body') {
      const curX = project.bodyPosX || 0;
      const curY = project.bodyPosY || 0;
      onChange({ ...project, bodyPosX: curX + dx, bodyPosY: curY + dy, updatedAt: Date.now() });
    } else if (element === 'footer') {
      const curX = project.footerPosX || 0;
      const curY = project.footerPosY || 0;
      onChange({ ...project, footerPosX: curX + dx, footerPosY: curY + dy, updatedAt: Date.now() });
    }
  };

  // Reset element position
  const resetPosition = (element: 'headline' | 'badge' | 'body' | 'footer' | 'all') => {
    if (element === 'headline') {
      onChange({ ...project, headlinePosX: 0, headlinePosY: 0, updatedAt: Date.now() });
    } else if (element === 'badge') {
      onChange({ ...project, badgePosX: 0, badgePosY: 0, updatedAt: Date.now() });
    } else if (element === 'body') {
      onChange({ ...project, bodyPosX: 0, bodyPosY: 0, updatedAt: Date.now() });
    } else if (element === 'footer') {
      onChange({ ...project, footerPosX: 0, footerPosY: 0, updatedAt: Date.now() });
    } else if (element === 'all') {
      onChange({
        ...project,
        headlinePosX: 0,
        headlinePosY: 0,
        badgePosX: 0,
        badgePosY: 0,
        bodyPosX: 0,
        bodyPosY: 0,
        footerPosX: 0,
        footerPosY: 0,
        mediaPosX: 50,
        mediaPosY: 50,
        updatedAt: Date.now()
      });
    }
  };

  // Filter templates
  const filteredTemplates = Object.entries(TEMPLATES).filter(([_, tpl]) => {
    if (templateFilter === 'all') return true;
    return tpl.categoryGroup === templateFilter;
  });

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200">
      {/* STREAMLINED 4-TAB NAVIGATION */}
      <div className="grid grid-cols-4 p-2 gap-1.5 border-b border-slate-800 bg-slate-950/60 select-none">
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'templates'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <LayoutTemplate className="w-4 h-4 shrink-0" />
          <span>{t.tabTemplates}</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'content'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Type className="w-4 h-4 shrink-0" />
          <span>{t.tabContent}</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'media'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="w-4 h-4 shrink-0" />
          <span>{t.tabMedia}</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'branding'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 ring-1 ring-red-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{t.tabBranding}</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-5">
            {/* Aspect Ratio Selector */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                {t.sizeAspectRatio}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '4:5', name: '4:5', sub: 'Feed' },
                  { id: '1:1', name: '1:1', sub: 'Square' },
                  { id: '9:16', name: '9:16', sub: 'Reels' },
                  { id: '16:9', name: '16:9', sub: 'Wide' }
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => updateField('aspectRatio', ratio.id as AspectRatioType)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      project.aspectRatio === ratio.id
                        ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{ratio.name}</div>
                    <div className="text-[10px] opacity-75">{ratio.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Categories Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t.viralTemplatesHeading} ({Object.keys(TEMPLATES).length})
                </h3>
                <span className="text-[11px] text-red-400 font-medium">{t.clickToApply}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { id: 'all', label: t.filterAll },
                  { id: 'viral', label: t.filterViral },
                  { id: 'breaking', label: t.filterBreaking },
                  { id: 'sports', label: t.filterSports },
                  { id: 'politics', label: t.filterCivic },
                  { id: 'video', label: t.filterReels }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTemplateFilter(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      templateFilter === cat.id
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 gap-2.5">
                {filteredTemplates.map(([key, tpl]) => (
                  <button
                    key={key}
                    onClick={() => onApplyTemplate(key)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                      project.templateStyle === key
                        ? 'bg-red-600/15 border-red-500 ring-2 ring-red-500/30 shadow-lg shadow-red-950/20'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                          {tpl.badge}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                          {tpl.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {tpl.description}
                        </p>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 px-2 py-1 bg-slate-900/80 rounded-lg shrink-0 ml-2">
                        {tpl.aspectRatio || '4:5'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEXT & FONTS */}
        {activeTab === 'content' && (
          <div className="space-y-5">
            {/* Quick Visibility Switcher */}
            <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Visibility:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateField('showCategoryBadge', !project.showCategoryBadge)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${
                    project.showCategoryBadge !== false
                      ? 'bg-red-600/20 text-red-400 border-red-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {project.showCategoryBadge !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Tag
                </button>

                <button
                  onClick={() => updateField('showHeadline', !project.showHeadline)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${
                    project.showHeadline !== false
                      ? 'bg-red-600/20 text-red-400 border-red-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {project.showHeadline !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Headline
                </button>

                <button
                  onClick={() => updateField('showBodyText', !project.showBodyText)}
                  className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all ${
                    project.showBodyText !== false
                      ? 'bg-red-600/20 text-red-400 border-red-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {project.showBodyText !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Story
                </button>
              </div>
            </div>

            {/* Category / Topic Tag */}
            {project.showCategoryBadge !== false && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {t.categoryBadgeHeading}
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    {[
                      { id: 'underline', label: 'Underline' },
                      { id: 'solid-rect', label: 'Box' },
                      { id: 'pill', label: 'Pill' },
                      { id: 'tag', label: 'Tag' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => updateField('categoryBadgeStyle', s.id as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          project.categoryBadgeStyle === s.id
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-1">
                  {NEPALI_TAG_PRESETS.slice(0, 6).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => updateField('categoryBadge', tag)}
                      className="px-2 py-0.5 bg-slate-800/80 hover:bg-slate-750 text-[11px] text-slate-300 rounded border border-slate-700/80"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={project.categoryBadge}
                  onChange={(e) => updateField('categoryBadge', e.target.value)}
                  placeholder={t.categoryPlaceholder}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                />

                {/* Tagline Size & 1-Line Lock Controls */}
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      updateField('badgeSingleLine', project.badgeSingleLine === false ? true : false)
                    }
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                      project.badgeSingleLine !== false
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title="Keep Tagline on a single line even when enlarged"
                  >
                    {project.badgeSingleLine !== false ? '✓ 1-Line Locked' : 'Allow Multi-Line'}
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Tag Size</span>
                    <input
                      type="range"
                      min="10"
                      max="32"
                      value={project.badgeSize || 14}
                      onChange={(e) => updateField('badgeSize', Number(e.target.value))}
                      className="w-20 accent-red-500"
                    />
                    <span className="text-slate-300 font-mono text-[11px] w-6">
                      {project.badgeSize || 14}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Subheadline (Easily added or removed) */}
            <div className="pt-2 border-t border-slate-800">
              {showSubheadlineInput ? (
                <div className="space-y-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t.subheadlineLabel}
                    </label>
                    <button
                      onClick={() => {
                        updateField('subheadline', '');
                        updateField('showSubheadline', false);
                        setShowSubheadlineInput(false);
                      }}
                      className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.removeSubheadline}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={project.subheadline || ''}
                    onChange={(e) => {
                      updateField('subheadline', e.target.value);
                      updateField('showSubheadline', true);
                    }}
                    placeholder="e.g. EXCLUSIVE INTERVIEW / BREAKING UPDATE"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowSubheadlineInput(true);
                    updateField('showSubheadline', true);
                    updateField('subheadline', 'EXCLUSIVE');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 py-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addSubheadline}</span>
                </button>
              )}
            </div>

            {/* Main Headline & Custom Color Chips */}
            {project.showHeadline !== false && (
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {t.headlineHeading}
                    </label>
                    {onOpenAI && (
                      <button
                        onClick={onOpenAI}
                        type="button"
                        className="px-2 py-0.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-[10px] font-bold text-red-400 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                        title="Generate news headline with Gemini AI"
                      >
                        <Sparkles className="w-3 h-3 text-red-400 animate-pulse" />
                        <span>AI Write</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleClearHighlights('headline')}
                    className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1"
                    title="Clear highlight colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t.clearHighlights}</span>
                  </button>
                </div>

                {/* 1-Click Color Highlighting Toolbar */}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Color:</span>
                    <button
                      onClick={() => insertColorTag('headline', 'red')}
                      className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold text-[11px] hover:scale-105 transition-transform"
                    >
                      🔴 Red
                    </button>
                    <button
                      onClick={() => insertColorTag('headline', 'yellow')}
                      className="px-2 py-0.5 rounded-md bg-yellow-400 text-black font-bold text-[11px] hover:scale-105 transition-transform"
                    >
                      🟡 Yellow
                    </button>
                    <button
                      onClick={() => insertColorTag('headline', 'green')}
                      className="px-2 py-0.5 rounded-md bg-emerald-500 text-white font-bold text-[11px] hover:scale-105 transition-transform"
                    >
                      🟢 Green
                    </button>
                    <button
                      onClick={() => insertColorTag('headline', 'blue')}
                      className="px-2 py-0.5 rounded-md bg-sky-500 text-white font-bold text-[11px] hover:scale-105 transition-transform"
                    >
                      🔵 Blue
                    </button>
                    <button
                      onClick={() => insertBgHighlight('headline', '#fef08a')}
                      className="px-2 py-0.5 rounded-md bg-yellow-300 text-slate-950 font-bold text-[11px] hover:scale-105 transition-transform"
                    >
                      🖍️ {t.backgroundHighlight}
                    </button>
                  </div>

                  {/* Custom Color Picker */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] text-slate-400">Custom:</span>
                    <input
                      type="color"
                      value={customHighlightColor}
                      onChange={(e) => setCustomHighlightColor(e.target.value)}
                      className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <button
                      onClick={() => insertColorTag('headline', customHighlightColor)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold rounded cursor-pointer"
                    >
                      Apply to Text
                    </button>
                    <button
                      onClick={() => insertBgHighlight('headline', customHighlightColor)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold rounded cursor-pointer"
                    >
                      Apply Pill (Bg)
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={project.headline}
                  onChange={(e) => updateField('headline', e.target.value)}
                  placeholder={t.headlinePlaceholder}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 leading-snug font-medium"
                />

                {/* Headline Controls: Alignment, 1-Line Lock & Size */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateField('headlineAlign', 'left')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${project.headlineAlign === 'left' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('headlineAlign', 'center')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${project.headlineAlign === 'center' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('headlineAlign', 'right')}
                      className={`p-1.5 rounded-lg cursor-pointer transition-all ${project.headlineAlign === 'right' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'}`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('headlineSingleLine', !project.headlineSingleLine)}
                      className={`ml-1 px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer ${
                        project.headlineSingleLine
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300 shadow-xs'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                      title="Keep Headline on 1 single line without wrapping"
                    >
                      {project.headlineSingleLine ? '✓ 1-Line Locked' : '1-Line Lock'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{t.fontSize}</span>
                    <input
                      type="range"
                      min="14"
                      max="64"
                      value={project.headlineSize}
                      onChange={(e) => updateField('headlineSize', Number(e.target.value))}
                      className="w-24 accent-red-500"
                    />
                    <span className="text-slate-300 font-mono w-6">{project.headlineSize}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Story / Body Text */}
            {project.showBodyText !== false && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {t.bodyHeading}
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => insertColorTag('bodyText', 'yellow')}
                      className="px-1.5 py-0.5 rounded bg-yellow-400 text-black font-bold text-[10px]"
                    >
                      🟡 Yellow
                    </button>
                    <button
                      onClick={() => insertColorTag('bodyText', 'red')}
                      className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]"
                    >
                      🔴 Red
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={project.bodyText}
                  onChange={(e) => updateField('bodyText', e.target.value)}
                  placeholder={t.bodyPlaceholder}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 leading-relaxed font-normal"
                />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{t.fontSize}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="14"
                      max="34"
                      value={project.bodySize}
                      onChange={(e) => updateField('bodySize', Number(e.target.value))}
                      className="w-28 accent-red-500"
                    />
                    <span className="text-slate-300 font-mono">{project.bodySize}</span>
                  </div>
                </div>
              </div>
            )}

            {/* EXPLICIT MOVE TEXT POSITION CONTROLS */}
            <div className="pt-2 border-t border-slate-800">
              <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-red-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Move className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      {t.moveTextHeading}
                    </span>
                  </div>
                  <button
                    onClick={() => resetPosition(selectedTextToMove)}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
                    title="Reset current element position"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.resetPosition}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {t.moveTextSub}
                </p>

                {/* Select Which Text to Move */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setSelectedTextToMove('headline')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedTextToMove === 'headline'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📢 {t.moveHeadline}
                  </button>
                  <button
                    onClick={() => setSelectedTextToMove('badge')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedTextToMove === 'badge'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🏷️ {t.moveTag}
                  </button>
                  <button
                    onClick={() => setSelectedTextToMove('body')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedTextToMove === 'body'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    📝 {t.moveBody}
                  </button>
                </div>

                {/* 4-Way Directional Nudge Buttons */}
                <div className="flex items-center justify-center gap-2 py-1 bg-slate-900/70 rounded-xl border border-slate-800 p-2">
                  <button
                    onClick={() => nudgeText(selectedTextToMove, -5, 0)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Move Left 5px"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                    <span>{t.nudgeLeft}</span>
                  </button>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => nudgeText(selectedTextToMove, 0, -5)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      title="Move Up 5px"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-red-400" />
                      <span>{t.nudgeUp}</span>
                    </button>
                    <button
                      onClick={() => nudgeText(selectedTextToMove, 0, 5)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      title="Move Down 5px"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-red-400" />
                      <span>{t.nudgeDown}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => nudgeText(selectedTextToMove, 5, 0)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Move Right 5px"
                  >
                    <span>{t.nudgeRight}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>

                {/* Sliders for Current Selected Element */}
                <div className="space-y-2 pt-1">
                  {/* Vertical Offset Y Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{t.verticalOffset} (Y)</span>
                      <span className="font-mono text-red-400 font-bold">
                        {selectedTextToMove === 'headline'
                          ? project.headlinePosY || 0
                          : selectedTextToMove === 'badge'
                          ? project.badgePosY || 0
                          : project.bodyPosY || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      value={
                        selectedTextToMove === 'headline'
                          ? project.headlinePosY || 0
                          : selectedTextToMove === 'badge'
                          ? project.badgePosY || 0
                          : project.bodyPosY || 0
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (selectedTextToMove === 'headline') updateField('headlinePosY', val);
                        else if (selectedTextToMove === 'badge') updateField('badgePosY', val);
                        else updateField('bodyPosY', val);
                      }}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>

                  {/* Horizontal Offset X Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>{t.horizontalOffset} (X)</span>
                      <span className="font-mono text-red-400 font-bold">
                        {selectedTextToMove === 'headline'
                          ? project.headlinePosX || 0
                          : selectedTextToMove === 'badge'
                          ? project.badgePosX || 0
                          : project.bodyPosX || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      value={
                        selectedTextToMove === 'headline'
                          ? project.headlinePosX || 0
                          : selectedTextToMove === 'badge'
                          ? project.badgePosX || 0
                          : project.bodyPosX || 0
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (selectedTextToMove === 'headline') updateField('headlinePosX', val);
                        else if (selectedTextToMove === 'badge') updateField('badgePosX', val);
                        else updateField('bodyPosX', val);
                      }}
                      className="w-full accent-red-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Font Picker */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                {t.nepaliFontsHeading}
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800">
                {[
                  { id: 'font-khand', name: 'Khand (Bold Heavy)', desc: 'Viral Impact' },
                  { id: 'font-teko', name: 'Teko (Condensed Tall)', desc: 'Tall Headline' },
                  { id: 'font-mukta', name: 'Mukta (Standard Clean)', desc: 'Standard Editorial' },
                  { id: 'font-noto', name: 'Noto Sans (Modern)', desc: 'Modern Clean' },
                  { id: 'font-rozha', name: 'Rozha One (Serif)', desc: 'Editorial Serif' },
                  { id: 'font-poppins', name: 'Poppins (Geometric)', desc: 'Clean Modern' },
                  { id: 'font-saira', name: 'Saira Semi (Impact)', desc: 'High Impact' },
                  { id: 'font-changa', name: 'Changa One (Heavy)', desc: 'Heavy Pop' },
                  { id: 'font-hind', name: 'Hind (Clean Sans)', desc: 'Standard Devanagari' },
                  { id: 'font-martel', name: 'Martel (Classic Serif)', desc: 'Prestigious' },
                  { id: 'font-rajdhani', name: 'Rajdhani (Tech Bold)', desc: 'Tech Bold' },
                  { id: 'font-yatra', name: 'Yatra One (Retro)', desc: 'Retro Bold' },
                  { id: 'font-bebas', name: 'Bebas Neue (English)', desc: 'English Impact' },
                  { id: 'font-anton', name: 'Anton (Viral Heavy)', desc: 'Viral Heavy' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      updateField('headlineFont', f.id as NepaliFont);
                      updateField('bodyFont', f.id as NepaliFont);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      project.headlineFont === f.id
                        ? 'bg-red-600/20 border-red-500 text-white ring-1 ring-red-500'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className={`text-sm font-bold truncate ${f.id}`}>{f.name}</div>
                    <div className="text-[10px] text-slate-400">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDIA & POSITION (Includes fix for Upper Movement) */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            {/* 1-CLICK CONTENT PLACEMENT (Top / Center / Bottom) */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                {t.contentPosition}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onChange({ ...project, contentVerticalAlign: 'top', headlinePosY: 0, badgePosY: 0 })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    project.contentVerticalAlign === 'top'
                      ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-xs">{t.positionTop}</span>
                </button>

                <button
                  onClick={() => onChange({ ...project, contentVerticalAlign: 'center', headlinePosY: 0, badgePosY: 0 })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    project.contentVerticalAlign === 'center'
                      ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">{t.positionCenter}</span>
                </button>

                <button
                  onClick={() => onChange({ ...project, contentVerticalAlign: 'bottom', headlinePosY: 0, badgePosY: 0 })}
                  className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    !project.contentVerticalAlign || project.contentVerticalAlign === 'bottom'
                      ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-xs">{t.positionBottom}</span>
                </button>
              </div>
            </div>

            {/* Upload Custom Media */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                {t.uploadMediaHeading}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-3 rounded-xl border border-dashed border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-white flex flex-col items-center gap-1.5 transition-all"
                >
                  <Upload className="w-5 h-5 text-red-400" />
                  <span>{t.uploadPhoto}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-3 rounded-xl border border-dashed border-sky-500/60 bg-sky-500/10 hover:bg-sky-500/20 text-xs font-bold text-sky-200 flex flex-col items-center gap-1.5 transition-all"
                >
                  <Video className="w-5 h-5 text-sky-400" />
                  <span>{t.uploadVideo}</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileUpload(e, false)}
                className="hidden"
              />

              {project.templateStyle === 'sharesanskar-split' && (
                <button
                  onClick={() => secondaryFileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/10 text-xs text-amber-300 font-semibold flex items-center justify-center gap-2 mt-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.secondaryPhoto}</span>
                </button>
              )}
            </div>

            {/* MOVE & SCALE PHOTO (Fix for Upper/Lower movement) */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-red-400" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {t.moveMediaHeading}
                  </label>
                </div>
                <button
                  onClick={() => onChange({ ...project, mediaPosX: 50, mediaPosY: 50, mediaScale: 1 })}
                  className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t.centerMedia}</span>
                </button>
              </div>

              {/* Instant Alignment Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => updateField('mediaPosY', 0)}
                  className={`py-1 px-2 rounded-lg text-xs font-semibold border ${
                    project.mediaPosY === 0 ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  🔝 {t.photoTop}
                </button>
                <button
                  onClick={() => updateField('mediaPosY', 50)}
                  className={`py-1 px-2 rounded-lg text-xs font-semibold border ${
                    project.mediaPosY === 50 ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  ⏺️ {t.photoCenter}
                </button>
                <button
                  onClick={() => updateField('mediaPosY', 100)}
                  className={`py-1 px-2 rounded-lg text-xs font-semibold border ${
                    project.mediaPosY === 100 ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  🔽 {t.photoBottom}
                </button>
              </div>

              {/* D-Pad Arrows */}
              <div className="flex items-center justify-center gap-2 py-1">
                <button
                  onClick={() => nudgeMedia(-5, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                  title="Move Left"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => nudgeMedia(0, -5)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => nudgeMedia(0, 5)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => nudgeMedia(5, 0)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200"
                  title="Move Right"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Sliders */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t.panY}</span>
                  <span className="font-mono">{project.mediaPosY ?? 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={project.mediaPosY ?? 50}
                  onChange={(e) => updateField('mediaPosY', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t.zoomScale}</span>
                  <span className="font-mono">{(project.mediaScale ?? 1).toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={project.mediaScale ?? 1}
                  onChange={(e) => updateField('mediaScale', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            {/* Gradient & Dark Overlay Controls */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                {t.filtersHeading}
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'bottom-dark', label: 'Bottom Dark Fade' },
                  { id: 'top-and-bottom', label: 'Top & Bottom Fade' },
                  { id: 'full-vignette', label: 'Vignette' },
                  { id: 'none', label: 'None (Clear)' }
                ].map((grad) => (
                  <button
                    key={grad.id}
                    onClick={() => updateField('overlayGradient', grad.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      project.overlayGradient === grad.id
                        ? 'bg-red-600 text-white border-red-500 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {grad.label}
                  </button>
                ))}
              </div>

              {/* Height Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t.gradientHeight}</span>
                  <span>{project.overlayHeight ?? 82}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={project.overlayHeight ?? 82}
                  onChange={(e) => updateField('overlayHeight', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{t.gradientDarkness}</span>
                  <span>{project.overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={project.overlayOpacity}
                  onChange={(e) => updateField('overlayOpacity', Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            {/* Sample Presets */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">{t.samplePresets}</label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_NEWS_IMAGES.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      onChange({
                        ...project,
                        mediaUrl: img.dataUrl,
                        mediaType: 'image',
                        updatedAt: Date.now()
                      });
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left group transition-all ${
                      project.mediaUrl === img.dataUrl
                        ? 'border-red-500 ring-2 ring-red-500/40'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-16 w-full overflow-hidden bg-slate-950">
                      <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-1.5 bg-slate-900 text-[11px] font-semibold text-slate-300 truncate">
                      {img.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BRANDING & HANDLE */}
        {activeTab === 'branding' && (
          <div className="space-y-5">
            {/* Channel Handle Editor */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t.socialDetails}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">{t.showHandle}</span>
                  <input
                    type="checkbox"
                    checked={project.showFooterBar !== false}
                    onChange={(e) => updateField('showFooterBar', e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {project.showFooterBar !== false && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={project.footerHandle}
                    onChange={(e) => updateField('footerHandle', e.target.value)}
                    placeholder="@routineofnepalbanda / @yourchannel"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 font-semibold"
                  />
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                    <span>Dot Color:</span>
                    <input
                      type="color"
                      value={project.footerAccentColor || '#ef4444'}
                      onChange={(e) => updateField('footerAccentColor', e.target.value)}
                      className="w-6 h-6 rounded bg-transparent border border-slate-700 cursor-pointer"
                    />
                  </div>

                  {/* EXPLICIT MOVE BOTTOM USERNAME / HANDLE POSITION CONTROLS */}
                  <div className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Move className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-bold text-white">
                          {t.moveUsernameHeading}
                        </span>
                      </div>
                      <button
                        onClick={() => resetPosition('footer')}
                        className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
                        title="Reset username position"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{t.resetPosition}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {t.moveUsernameSub}
                    </p>

                    {/* Quick Alignment: Left / Center / Right */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => updateField('footerAlign', 'left')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          project.footerAlign === 'left' || !project.footerAlign
                            ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => updateField('footerAlign', 'center')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          project.footerAlign === 'center'
                            ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        Center
                      </button>
                      <button
                        onClick={() => updateField('footerAlign', 'right')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          project.footerAlign === 'right'
                            ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        Right
                      </button>
                    </div>

                    {/* 4-Way Directional Nudge Buttons */}
                    <div className="flex items-center justify-center gap-2 py-1 bg-slate-900 rounded-xl border border-slate-800 p-2">
                      <button
                        onClick={() => nudgeText('footer', -5, 0)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        title="Move Left 5px"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
                        <span>{t.nudgeLeft}</span>
                      </button>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => nudgeText('footer', 0, -5)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                          title="Move Up 5px"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-red-400" />
                          <span>{t.nudgeUp}</span>
                        </button>
                        <button
                          onClick={() => nudgeText('footer', 0, 5)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                          title="Move Down 5px"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-red-400" />
                          <span>{t.nudgeDown}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => nudgeText('footer', 5, 0)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                        title="Move Right 5px"
                      >
                        <span>{t.nudgeRight}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>

                    {/* Sliders for Username Y and X */}
                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>{t.verticalOffset}</span>
                          <span className="font-mono text-red-400 font-bold">{project.footerPosY || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-150"
                          max="100"
                          value={project.footerPosY || 0}
                          onChange={(e) => updateField('footerPosY', Number(e.target.value))}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>{t.horizontalOffset}</span>
                          <span className="font-mono text-red-400 font-bold">{project.footerPosX || 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={project.footerPosX || 0}
                          onChange={(e) => updateField('footerPosX', Number(e.target.value))}
                          className="w-full accent-red-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Preset Position Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                      <button
                        onClick={() => onChange({ ...project, footerPosX: 0, footerPosY: 0, footerAlign: 'left', updatedAt: Date.now() })}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-center"
                      >
                        ↙️ {t.presetBottomLeft}
                      </button>
                      <button
                        onClick={() => onChange({ ...project, footerPosX: 0, footerPosY: 0, footerAlign: 'center', updatedAt: Date.now() })}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-center"
                      >
                        ⬇️ {t.presetBottomCenter}
                      </button>
                      <button
                        onClick={() => onChange({ ...project, footerPosX: 0, footerPosY: 0, footerAlign: 'right', updatedAt: Date.now() })}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-center"
                      >
                        ↘️ {t.presetBottomRight}
                      </button>
                      <button
                        onClick={() => onChange({ ...project, footerPosX: 0, footerPosY: -380, footerAlign: 'left', updatedAt: Date.now() })}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium text-center"
                      >
                        ⬆️ {t.presetAboveHeadline}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Logo Options */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {t.showLogo}
                </label>
                <input
                  type="checkbox"
                  checked={project.showLogo}
                  onChange={(e) => updateField('showLogo', e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded cursor-pointer"
                />
              </div>

              {project.showLogo && (
                <>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4 text-red-400" />
                    <span>{t.uploadLogo}</span>
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  {/* Preset Logos */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {PRESET_LOGOS.map((lg) => (
                      <button
                        key={lg.id}
                        onClick={() => updateField('logoUrl', lg.dataUrl)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          project.logoUrl === lg.dataUrl
                            ? 'border-red-500 bg-red-500/10 ring-1 ring-red-500'
                            : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black/50">
                          <img src={lg.dataUrl} alt={lg.name} className="w-full h-full object-cover" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>{t.logoSize}</span>
                      <span>{project.logoSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="28"
                      max="76"
                      value={project.logoSize}
                      onChange={(e) => updateField('logoSize', Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Card Background Theme */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                {t.cardTheme}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateField('cardTheme', 'dark')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    project.cardTheme === 'dark'
                      ? 'bg-slate-900 border-red-500 text-white font-bold ring-2 ring-red-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs">{t.darkNewsCard}</span>
                </button>

                <button
                  onClick={() => updateField('cardTheme', 'light')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    project.cardTheme === 'light'
                      ? 'bg-slate-900 border-red-500 text-white font-bold ring-2 ring-red-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs">{t.lightNewsCard}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
