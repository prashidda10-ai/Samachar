import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  X,
  Flame,
  Zap,
  Loader2,
  Maximize2,
  Check,
  Dices,
  Send,
  Minimize2
} from 'lucide-react';
import { NewsProject } from '../types';
import { generateNewsWithAI, polishHeadlineWithAI, AIGeneratedNews } from '../utils/aiNewsService';
import confetti from 'canvas-confetti';

interface AIFloatingBubbleProps {
  project: NewsProject;
  onUpdateProject: React.Dispatch<React.SetStateAction<NewsProject>>;
  onApplyAINews: (news: AIGeneratedNews) => void;
  onOpenFullAIModal: () => void;
  onShowToast: (msg: string) => void;
}

const SURPRISE_TOPICS = [
  'Nepal national cricket team secures historic victory in last-over thriller at TU Ground',
  'Kathmandu Metropolitan City launches 24/7 smart street lighting and green corridor project',
  'Record tourist arrivals reported in Pokhara and Annapurna region this season',
  'Nepal Rastra Bank announces new digital payment milestone across all 77 districts',
  'Upper Tamakoshi and national grid achieve record clean hydro electricity export'
];

export const AIFloatingBubble: React.FC<AIFloatingBubbleProps> = ({
  project,
  onUpdateProject,
  onApplyAINews,
  onOpenFullAIModal,
  onShowToast
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [aiLang, setAiLang] = useState<'ne' | 'en'>('ne');
  const [isGenerating, setIsGenerating] = useState(false);
  const [polishedVariations, setPolishedVariations] = useState<string[]>([]);
  const [isPolishing, setIsPolishing] = useState(false);

  // Draggable bubble offset from default bottom-right anchor
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{
    isDragging: boolean;
    hasMoved: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      dragRef.current.hasMoved = true;
    }
    setOffset({
      x: Math.max(-window.innerWidth + 90, Math.min(20, dragRef.current.origX + dx)),
      y: Math.max(-window.innerHeight + 120, Math.min(20, dragRef.current.origY + dy))
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!dragRef.current.hasMoved) {
      setIsExpanded((prev) => !prev);
    }
  };

  const triggerSparkleConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 65,
        origin: { x: 0.88, y: 0.85 },
        colors: ['#ef4444', '#facc15', '#fb7185', '#38bdf8']
      });
    } catch {
      // ignore
    }
  };

  // 1-Click: Lock both Tagline & Headline to a single line
  const handleLockSingleLine = () => {
    onUpdateProject((prev) => ({
      ...prev,
      headlineSingleLine: !prev.headlineSingleLine,
      badgeSingleLine: true
    }));
    triggerSparkleConfetti();
    onShowToast(
      project.headlineSingleLine
        ? 'Multi-line wrapping enabled for Headline'
        : 'Headline & Tagline locked to 1 Single Line!'
    );
  };

  // 1-Click: Polish current headline into 3 punchy variations
  const handleQuickPolish = async () => {
    if (!project.headline.trim()) return;
    setIsPolishing(true);
    try {
      const results = await polishHeadlineWithAI(project.headline, aiLang);
      setPolishedVariations(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  // 1-Click: Generate surprise viral card
  const handleSurpriseViral = async () => {
    const randomTopic = SURPRISE_TOPICS[Math.floor(Math.random() * SURPRISE_TOPICS.length)];
    setIsGenerating(true);
    try {
      const news = await generateNewsWithAI({
        topic: randomTopic,
        language: aiLang,
        tone: 'viral'
      });
      onApplyAINews(news);
      triggerSparkleConfetti();
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick Prompt Generate
  const handleQuickGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const news = await generateNewsWithAI({
        topic: quickPrompt,
        language: aiLang,
        tone: 'breaking'
      });
      onApplyAINews(news);
      setQuickPrompt('');
      triggerSparkleConfetti();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`
      }}
      className="fixed bottom-20 md:bottom-6 right-3.5 md:right-6 z-40 flex flex-col items-end select-none"
    >
      {/* EXPANDED FLOATING AI BUBBLE HUB */}
      {isExpanded && (
        <div className="mb-3 w-[320px] sm:w-[350px] bg-slate-950/95 backdrop-blur-xl border border-red-500/40 rounded-3xl shadow-[0_20px_60px_rgba(239,68,68,0.35)] overflow-hidden animate-pop origin-bottom-right text-slate-100">
          {/* Animated Header */}
          <div className="p-3.5 bg-gradient-to-r from-red-600/25 via-rose-600/20 to-amber-500/20 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/40 animate-float">
                <Sparkles className="w-4 h-4 text-white animate-spin-slow" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                  <span>AI News Copilot</span>
                  <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Instant Headlines, 1-Line Fit & Magic Tools</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switcher for AI output */}
              <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setAiLang('ne')}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-all ${
                    aiLang === 'ne' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NE
                </button>
                <button
                  type="button"
                  onClick={() => setAiLang('en')}
                  className={`px-1.5 py-0.5 rounded-md cursor-pointer transition-all ${
                    aiLang === 'en' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Minimize Bubble"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-3 max-h-[65vh] overflow-y-auto">
            {/* Quick Topic Input */}
            <form onSubmit={handleQuickGenerate} className="relative">
              <input
                type="text"
                value={quickPrompt}
                onChange={(e) => setQuickPrompt(e.target.value)}
                placeholder="Type any topic & press Enter..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 focus:border-red-500 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isGenerating || !quickPrompt.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>

            {/* Quick 1-Click Action Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleLockSingleLine}
                className={`p-2.5 rounded-2xl border text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer flex flex-col gap-1 ${
                  project.headlineSingleLine
                    ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-200'
                    : 'bg-slate-900/90 border-slate-800 hover:border-red-500/50 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  {project.headlineSingleLine && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[11px] font-bold">
                  {project.headlineSingleLine ? '1-Line Locked' : 'Lock 1-Line Fit'}
                </div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  Keep Tagline & Headline on 1 single line
                </div>
              </button>

              <button
                type="button"
                disabled={isPolishing}
                onClick={handleQuickPolish}
                className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  {isPolishing ? (
                    <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="text-[9px] font-bold text-amber-400">MAGIC</span>
                </div>
                <div className="text-[11px] font-bold text-slate-100">Polish Headline</div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  3 punchy viral hooks with highlights
                </div>
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={handleSurpriseViral}
                className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <Dices className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[9px] font-bold text-rose-400">AUTO</span>
                </div>
                <div className="text-[11px] font-bold text-slate-100">Surprise News</div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  Generate trending card in 1 click
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenFullAIModal();
                }}
                className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600/25 to-rose-600/20 border border-red-500/40 hover:border-red-400 text-left transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <Zap className="w-3 h-3 text-yellow-400" />
                </div>
                <div className="text-[11px] font-bold text-white">Full AI Studio</div>
                <div className="text-[9px] text-red-200/80 leading-tight">
                  Open full journalist editor modal
                </div>
              </button>
            </div>

            {/* Polished Headline Variations */}
            {polishedVariations.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t border-slate-800/80 animate-pop">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>✨ Click to apply polished headline:</span>
                  <button
                    type="button"
                    onClick={() => setPolishedVariations([])}
                    className="text-slate-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {polishedVariations.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onUpdateProject((prev) => ({ ...prev, headline: v }));
                      triggerSparkleConfetti();
                      onShowToast('Polished AI headline applied!');
                    }}
                    className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-left text-xs text-slate-200 transition-all cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* THE FLOATING AI BUBBLE BUTTON (Draggable & Animated) */}
      <div className="relative group flex items-center gap-2.5">
        {/* Floating Callout Pill on Hover */}
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer px-3.5 py-1.5 rounded-full bg-slate-950/95 border border-red-500/50 text-white text-xs font-extrabold shadow-xl flex items-center gap-1.5 animate-float backdrop-blur-md hover:scale-105 transition-transform"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="bg-gradient-to-r from-white via-red-200 to-amber-200 bg-clip-text text-transparent">
              AI Copilot
            </span>
          </div>
        )}

        {/* Main Glowing Bubble */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="Click to open AI Copilot or drag to move bubble anywhere"
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.65)] flex items-center justify-center cursor-grab active:cursor-grabbing animate-float hover:scale-110 active:scale-95 transition-transform border-2 border-white/30"
        >
          {/* Outer Radar Ripple Wave */}
          <span className="absolute inset-0 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
          {/* Orbiting Sparkle Ring */}
          <span className="absolute -inset-1.5 rounded-full border border-dashed border-amber-300/60 animate-spin-slow pointer-events-none" />

          {/* Bubble Icon */}
          {isExpanded ? (
            <X className="w-6 h-6 text-white relative z-10 transition-transform duration-200 rotate-90" />
          ) : (
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 text-white drop-shadow" />
              <span className="text-[8px] font-black tracking-widest uppercase -mt-0.5 text-amber-200">
                AI
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
