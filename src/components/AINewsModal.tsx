import React, { useState } from 'react';
import { generateNewsWithAI, AIGeneratedNews } from '../utils/aiNewsService';
import { renderHighlightedText } from '../utils/textParser';
import { Sparkles, X, Check, Loader2, Wand2, RefreshCw } from 'lucide-react';

interface AINewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNews: (news: AIGeneratedNews) => void;
}

const SAMPLE_PROMPTS = [
  'Nepal wins crucial T20 match by 4 wickets in historic thriller',
  'Kathmandu valley introduces 24/7 electric public bus transit route',
  'Mustang apple farmers report record harvest season and tourist surge',
  'Department of Passports announces new streamlined same-day renewal system',
  'Pokhara international marathon announces record prize pool for youth athletes'
];

export const AINewsModal: React.FC<AINewsModalProps> = ({
  isOpen,
  onClose,
  onApplyNews
}) => {
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState<'ne' | 'en'>('ne');
  const [tone, setTone] = useState<'viral' | 'breaking' | 'sports' | 'politics' | 'inspirational'>('viral');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNews, setGeneratedNews] = useState<AIGeneratedNews | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (customPrompt?: string) => {
    const textToGenerate = customPrompt || topic;
    if (!textToGenerate.trim()) return;

    setIsLoading(true);
    try {
      const result = await generateNewsWithAI({
        topic: textToGenerate,
        language,
        tone
      });
      setGeneratedNews(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedNews) {
      onApplyNews(generatedNews);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-slate-900 to-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-rose-500 rounded-2xl shadow-lg shadow-red-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2 text-white">
                AI News Journalist & Editor
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                  Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Generate viral, authentic news headlines, kickers, and stories in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Topic / Input Area */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              News Topic, Press Release, or Rough Notes
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Nepal cricket team qualified for T20 World Cup after defeating UAE in semi-final at TU Cricket Ground..."
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-medium"
            />
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
              Quick Trending Topic Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(promptText);
                    handleGenerate(promptText);
                  }}
                  className="text-xs px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white rounded-full transition-all text-left truncate max-w-full"
                >
                  ⚡ {promptText.slice(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          {/* Options: Language & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Output Language */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                News Output Language
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('ne')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    language === 'ne'
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  🇳🇵 नेपाली (Devanagari)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    language === 'en'
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  🌐 English
                </button>
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                Journalism Tone / Style
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-red-500"
              >
                <option value="viral">🔥 Viral News Card (RONB / Nepal 360 style)</option>
                <option value="breaking">⚡ Urgent Breaking Flash (ताजा खबर)</option>
                <option value="sports">🏏 Sports Match Report (खेलकुद)</option>
                <option value="politics">🏛️ Politics & Governance (राजनीति)</option>
                <option value="inspirational">🌟 Inspiring / Positive Story</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => handleGenerate()}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI Crafting Viral News Card...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Viral Headline & Story</span>
              </>
            )}
          </button>

          {/* Generated Result Preview */}
          {generatedNews && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-red-500/30 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Generated Preview Result
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> High-impact markup formatted
                </span>
              </div>

              {/* Tag / Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase rounded tracking-wider font-khand">
                  {generatedNews.categoryBadge}
                </span>
                {generatedNews.subheadline && (
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-bold uppercase rounded">
                    {generatedNews.subheadline}
                  </span>
                )}
              </div>

              {/* Headline */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Headline</div>
                <div className="text-base sm:text-lg font-bold text-white font-khand leading-snug">
                  {renderHighlightedText(generatedNews.headline, 'text-white')}
                </div>
              </div>

              {/* Body Story */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Story Details</div>
                <div className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed font-mukta">
                  {renderHighlightedText(generatedNews.bodyText, 'text-slate-200')}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply to Current News Card</span>
                </button>
                <button
                  onClick={() => handleGenerate()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
                  title="Regenerate alternative"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
