import React from 'react';
import { X, DownloadCloud, Smartphone, Monitor, Share2, PlusSquare, Check } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  hasNativePrompt: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  hasNativePrompt
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Modal Top */}
        <div className="relative p-6 pt-7 text-center bg-gradient-to-b from-red-950/40 to-slate-900 border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <DownloadCloud className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-extrabold text-white">
            Install Samachar Maker
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Install as a fast, offline web app directly on your phone, tablet, or desktop with 0 download fees.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {hasNativePrompt ? (
            <button
              onClick={() => {
                onNativeInstall?.();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 transition-all cursor-pointer active:scale-98"
            >
              <DownloadCloud className="w-5 h-5" />
              <span>Install Directly Now</span>
            </button>
          ) : null}

          {/* Platform Guides */}
          <div className="space-y-3">
            {/* iOS Safari */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>iPhone & iPad (Safari)</span>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                1. Tap the <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-slate-300" /> <strong>Share</strong> button at the bottom of Safari.<br />
                2. Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-300" /> <strong>Add to Home Screen</strong>.<br />
                3. Tap <strong>Add</strong> in the top right.
              </p>
            </div>

            {/* Android / Chrome */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Android (Chrome)</span>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                1. Tap the three dots <strong>(⋮)</strong> in Chrome&apos;s top corner.<br />
                2. Select <strong>Install App</strong> or <strong>Add to Home screen</strong>.
              </p>
            </div>

            {/* PC / Mac */}
            <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Desktop (Chrome, Edge, Brave)</span>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">
                Click the <strong>Install icon</strong> in your browser&apos;s address bar next to the URL, then click <strong>Install</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
