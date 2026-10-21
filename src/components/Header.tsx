import React, { useState } from 'react';
import {
  Download,
  Share2,
  FolderOpen,
  Save,
  Moon,
  Sun,
  RotateCcw,
  Sparkles,
  DownloadCloud,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../utils/auth';

interface HeaderProps {
  appTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenProjects: () => void;
  onSaveCurrent: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onReplaySplash: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  user: UserProfile | null;
  savedCount: number;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
  mobileTab?: 'editor' | 'preview';
  onToggleMobileTab?: (tab: 'editor' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appTheme,
  onToggleTheme,
  onOpenProjects,
  onSaveCurrent,
  onOpenShare,
  onOpenExport,
  onReplaySplash,
  onOpenAI,
  onOpenAuth,
  onLogout,
  user,
  savedCount,
  canInstallPwa,
  onInstallPwa,
  mobileTab = 'preview',
  onToggleMobileTab
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-2 sm:px-3 md:px-5 flex items-center justify-between gap-2 select-none shrink-0 z-30">
      {/* Zone 1: App Logo & Mobile Brand Title */}
      <div className="flex items-center gap-2.5">
        <img
          src="/logo.svg"
          alt="Samachar Maker Logo"
          title="Samachar Maker — By Shubest Lab"
          onClick={onReplaySplash}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-lg shadow-red-600/25 hover:scale-105 active:scale-95 transition-transform cursor-pointer object-contain shrink-0"
        />
        <div className="flex flex-col md:hidden">
          <span className="text-xs font-black tracking-tight text-white leading-none">
            Samachar <span className="text-red-500">Maker</span>
          </span>
          <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Pro Studio
          </span>
        </div>
      </div>

      {/* Zone 2: Central Tools */}
      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
        {/* PWA Install Button (always accessible) */}
        {canInstallPwa && (
          <button
            onClick={onInstallPwa}
            className="flex px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold text-xs items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Install App directly on your Device (PWA)"
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {/* Saved Projects Library */}
        <button
          onClick={onOpenProjects}
          className="hidden md:flex px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors items-center gap-1.5 whitespace-nowrap cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Saved Projects ({savedCount})</span>
        </button>

        {/* Intro Splash Replay */}
        <button
          onClick={onReplaySplash}
          title="Replay Studio Splash Intro"
          className="hidden sm:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Dark/Light Mode"
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
        >
          {appTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>

      {/* Zone 3: Google Account & Actions */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {/* Save Current Project */}
        <button
          onClick={onSaveCurrent}
          className="p-2 sm:px-2.5 md:px-3 sm:py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Save project (Account required)"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="p-2 sm:px-2.5 md:px-3 sm:py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Share card"
        >
          <Share2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Export Studio */}
        <button
          onClick={onOpenExport}
          className="hidden sm:flex px-3 md:px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-md shadow-red-600/20 transition-all items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export HD</span>
        </button>

        {/* Google User Profile (Photo Only) or Sign-in Button */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title={`${user.name} (${user.email})`}
              className="w-8 h-8 rounded-full overflow-hidden bg-red-600 border-2 border-red-500/60 hover:border-white flex items-center justify-center text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </button>

            {/* Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 text-xs">
                <div className="px-2.5 py-2 border-b border-slate-800 mb-1">
                  <div className="font-bold text-white truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                  <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">● Connected with Google</div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenProjects();
                  }}
                  className="w-full px-2.5 py-1.5 text-left text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Saved Projects ({savedCount})</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full px-2.5 py-1.5 text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg flex items-center gap-2 transition-colors mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-2.5 md:px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
