import React from 'react';
import {
  Download,
  Share2,
  FolderOpen,
  Save,
  Moon,
  Sun,
  RotateCcw,
  Languages
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface HeaderProps {
  appTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenProjects: () => void;
  onSaveCurrent: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onReplaySplash: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  appTheme,
  onToggleTheme,
  language,
  onToggleLanguage,
  onOpenProjects,
  onSaveCurrent,
  onOpenShare,
  onOpenExport,
  onReplaySplash,
  savedCount
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-3 md:px-6 flex items-center justify-between gap-3 select-none shrink-0 z-30">
      {/* Zone 1: Brand Title Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-base font-khand shadow-sm shadow-red-500/30">
          SM
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-black tracking-tight text-white font-outfit">
              Samachar <span className="text-red-500">Maker</span>
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
            {t.byDeveloper}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation & Quick Tools */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Language Switcher */}
        <button
          onClick={onToggleLanguage}
          title="Switch Language (भाषा परिवर्तन)"
          className="px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Languages className="w-3.5 h-3.5 text-red-400" />
          <span>{language === 'ne' ? 'नेपाली' : 'English'}</span>
          <span className="text-[10px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded">
            {language === 'ne' ? 'EN' : 'नेपा'}
          </span>
        </button>

        <button
          onClick={onOpenProjects}
          className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors items-center gap-1.5 whitespace-nowrap"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.savedProjects} ({savedCount})</span>
        </button>

        <button
          onClick={onReplaySplash}
          title="Replay Studio Splash Intro"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
        >
          {appTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        <button
          onClick={onSaveCurrent}
          className="px-2.5 md:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">{t.saveProject}</span>
        </button>

        <button
          onClick={onOpenShare}
          className="px-2.5 md:px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{t.share}</span>
        </button>

        <button
          onClick={onOpenExport}
          className="px-3 md:px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.download}</span>
        </button>
      </div>
    </header>
  );
};

