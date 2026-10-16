import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Send, Globe, Instagram, Facebook } from 'lucide-react';
import { NewsProject } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: NewsProject;
  imageDataUrl: string | null;
  language?: Language;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
  imageDataUrl,
  language = 'ne'
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  // Generate plain text caption from project content
  const cleanCaption = `${project.categoryBadge ? `[${project.categoryBadge}]\n` : ''}${project.headline.replace(/\{.*?\}/g, '')}\n\n${project.bodyText.replace(/\{.*?\}/g, '')}\n\nVia #${project.footerHandle || 'SamacharMaker'} #NepalNews`;

  const copyCaptionToClipboard = () => {
    navigator.clipboard.writeText(cleanCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyImageToClipboard = async () => {
    if (!imageDataUrl) return;
    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (e) {
      alert(language === 'ne' 
        ? 'तपाईंको ब्राउजरले क्लिपबोर्डमा सिधै फोटो कपी गर्न अनुमति दिएन। कृपया डाउनलोड गर्नुहोस्।' 
        : 'Browser clipboard image write not supported. Please download the image.');
    }
  };

  const handleNativeShare = async () => {
    if (!imageDataUrl) return;
    try {
      const res = await fetch(imageDataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${project.title || 'samachar'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: project.title,
          text: cleanCaption
        });
      } else if (navigator.share) {
        await navigator.share({
          title: project.title,
          text: cleanCaption,
          url: window.location.href
        });
      } else {
        alert(language === 'ne' 
          ? 'Web Share API यो ब्राउजरमा उपलब्ध छैन। कृपया तलका सामाजिक सञ्जाल बटनहरू प्रयोग गर्नुहोस्।' 
          : 'Web Share not supported in this browser. Please use the direct links below.');
      }
    } catch (err) {
      console.log('Share canceled or failed', err);
    }
  };

  // Social share intent links
  const encodedText = encodeURIComponent(cleanCaption);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white">{t.shareModalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Native Share Button */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Share2 className="w-5 h-5" />
              <span>{t.quickShareDevice}</span>
            </button>
          )}

          {/* Quick Copy Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyImageToClipboard}
              className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            >
              {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedImage ? t.copied : t.copyImage}</span>
            </button>

            <button
              onClick={copyCaptionToClipboard}
              className="p-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors text-xs font-semibold"
            >
              {copiedCaption ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedCaption ? t.copied : t.copyCaption}</span>
            </button>
          </div>

          {/* Direct Social App Links */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              {t.orOpenApp}
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 transition-colors"
              >
                <MessageSquare className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">WhatsApp</span>
              </a>

              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 hover:bg-blue-600/25 transition-colors"
              >
                <Facebook className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Facebook</span>
              </a>

              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-600/15 border border-sky-500/30 text-sky-400 hover:bg-sky-600/25 transition-colors"
              >
                <Send className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Twitter / X</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-600/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600/25 transition-colors"
              >
                <Globe className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Telegram</span>
              </a>
            </div>
          </div>

          {/* Instagram Note */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start gap-3">
            <Instagram className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block mb-0.5">{t.instagramTipTitle}</span>
              {t.instagramTipBody}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
