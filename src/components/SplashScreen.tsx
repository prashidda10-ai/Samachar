import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Radio, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'developer' | 'title' | 'ready'>('developer');

  useEffect(() => {
    // Stage 1: Reveal Developer "Shubest Lab"
    const timer1 = setTimeout(() => {
      setStage('title');
    }, 1100);

    // Stage 2: Progress counter
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 50);

    // Stage 3: Ready & auto dismiss
    const timer2 = setTimeout(() => {
      setStage('ready');
    }, 2400);

    const timer3 = setTimeout(() => {
      onFinish();
    }, 2900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl animate-pulse" />
        {/* Subtle studio grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Stage 1: Developer Reveal: Shubest Lab */}
        <AnimatePresence mode="wait">
          {stage === 'developer' ? (
            <motion.div
              key="dev"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 shadow-lg shadow-red-500/20">
                <Radio className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                Developed By
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent font-outfit">
                SHUBEST LAB
              </h2>
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* App Logo Mark */}
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-xl shadow-red-600/30 border border-red-400/40">
                  <span className="font-extrabold text-white text-3xl font-khand tracking-wider">
                    SM
                  </span>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-slate-950"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
              </div>

              {/* App Title */}
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white font-outfit">
                Samachar <span className="text-red-500">Maker</span>
              </h1>
              <p className="text-sm font-mukta text-slate-300 mt-1">
                नेपाली भाइरल न्युज टेम्प्लेट स्टुडियो
              </p>
              <div className="mt-2 text-[11px] text-slate-400 font-medium">
                By Shubest Lab
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Progress Bar */}
        <div className="w-64 mt-8">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
            <span>Loading Studio</span>
            <span>{Math.min(100, progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={onFinish}
          className="mt-6 px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
        >
          Skip Intro →
        </button>
      </div>
    </motion.div>
  );
};
