import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wand2, Flame, RefreshCw, X, MessageSquareQuote } from 'lucide-react';

interface AIFloatingBubbleProps {
  onOpenAIModal: () => void;
  onQuickHeadline?: () => void;
  onPolishCurrent?: () => void;
}

export const AIFloatingBubble: React.FC<AIFloatingBubbleProps> = ({
  onOpenAIModal,
  onQuickHeadline,
  onPolishCurrent
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-7 right-4 md:right-7 z-40 select-none">
      {/* Mini Quick Action Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute bottom-16 right-0 mb-2 w-64 p-3 bg-slate-900/95 backdrop-blur-xl border border-red-500/40 rounded-3xl shadow-2xl text-white space-y-2"
            style={{
              boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.35), 0 0 25px rgba(244, 63, 94, 0.2)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 px-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span className="text-xs font-black tracking-wider uppercase bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                  Gemini 3.8 AI Assistant
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {/* Action 1: Open Full AI Journalist Studio */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAIModal();
                }}
                className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/50 hover:to-rose-600/50 border border-red-500/40 text-left flex items-center gap-2.5 transition-all group"
              >
                <div className="p-2 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/40 group-hover:scale-110 transition-transform">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-red-300 transition-colors">
                    AI News Writer Studio
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Draft viral headlines & body stories
                  </div>
                </div>
              </button>

              {/* Action 2: Quick Polish Current Card */}
              {onPolishCurrent && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onPolishCurrent();
                  }}
                  className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-2 transition-all hover:border-amber-500/50 group"
                >
                  <Flame className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                    Auto-Highlight Keywords
                  </span>
                </button>
              )}

              {/* Action 3: Instant Catchy Variation */}
              {onQuickHeadline && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onQuickHeadline();
                  }}
                  className="w-full p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center gap-2 transition-all hover:border-rose-500/50 group"
                >
                  <RefreshCw className="w-4 h-4 text-rose-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-300">
                    Generate Viral Alternative
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Bubble Icon Button */}
      <motion.div
        drag
        dragConstraints={{ left: -300, right: 20, top: -450, bottom: 20 }}
        dragElastic={0.15}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        className="relative group cursor-grab active:cursor-grabbing"
      >
        {/* Pulsing ambient outer glow rings */}
        <div className="absolute -inset-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 opacity-70 blur-md group-hover:opacity-100 animate-pulse pointer-events-none" />

        {/* Orbiting particle ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute -inset-1 rounded-full border border-dashed border-rose-400/60 pointer-events-none"
        />

        {/* Bubble Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-2xl border-2 border-white/40 backdrop-blur-md transition-shadow group-hover:shadow-red-500/50"
          style={{
            boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)'
          }}
          title="AI News Assistant (Click to open)"
        >
          {/* Animated sparkles icon */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 8, -8, 0]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
          </motion.div>

          {/* AI Badge pill */}
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-slate-950 border border-red-500 text-[9px] font-black tracking-tight text-white shadow-md">
            AI
          </span>
        </button>

        {/* Hover Tooltip */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2.5 py-1 bg-slate-900/90 text-white text-[11px] font-bold rounded-xl border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden sm:block">
          ✨ AI News Journalist
        </div>
      </motion.div>
    </div>
  );
};
