import React, { useState } from 'react';
import { UserProfile, signInWithGoogle } from '../utils/auth';
import { X, Lock, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  reason?: 'save' | 'view' | 'general';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reason = 'general'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle(customEmail.trim() || undefined);
      onSuccess(user);
      onClose();
    } catch (e) {
      console.error('Google Sign-in failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

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

          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-600/30">
            <Lock className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-extrabold text-white">
            {reason === 'save'
              ? 'Sign in to Save Projects'
              : reason === 'view'
              ? 'Sign in to Access Saved Projects'
              : 'Sign in to Samachar Maker'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {reason === 'save'
              ? 'An account is required to store your news templates, custom positions, and drafts.'
              : reason === 'view'
              ? 'Please sign in with your Google account to view and restore your saved templates.'
              : 'Create a free account with Google to save templates, re-edit drafts, and export in HD.'}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4">
          <div className="space-y-2.5 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Save & Re-edit:</strong> Never lose your headline placements, media positions, or custom tags.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Cross-device PWA:</strong> Access your news cards seamlessly from phone, tablet, and PC.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>AI Journalist Tools:</strong> Unlimited headline generation and text highlights with Gemini 3.8.</span>
            </div>
          </div>

          {/* Optional specific email for testing */}
          {showEmailInput && (
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 uppercase font-semibold">Google Account Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="prashidda10@gmail.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          )}

          {/* Continue with Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-white/10 transition-all cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            )}
            <span className="text-sm">Continue with Google</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Secure 256-bit encryption
            </span>
            <button
              onClick={() => setShowEmailInput(!showEmailInput)}
              className="text-slate-400 hover:text-slate-300 underline"
            >
              {showEmailInput ? 'Use default' : 'Change account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
