import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface OnScreenControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  label?: string;
  theme?: 'amber' | 'sky' | 'rose';
}

export const OnScreenControls: React.FC<OnScreenControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
  label,
  theme = 'amber',
}) => {
  const colorMap = {
    amber: 'bg-amber-500/20 active:bg-amber-500/40 border-amber-400/40 text-amber-300',
    sky: 'bg-sky-500/20 active:bg-sky-500/40 border-sky-400/40 text-sky-300',
    rose: 'bg-rose-500/20 active:bg-rose-500/40 border-rose-400/40 text-rose-300',
  };

  const activeColor = colorMap[theme];

  return (
    <div className="pointer-events-auto flex items-center justify-between w-full max-w-sm px-3 py-2 select-none">
      {/* Left / Right Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onLeft}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 ${activeColor}`}
          aria-label="Kiri"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={onRight}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 ${activeColor}`}
          aria-label="Kanan"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {label && (
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2">
          {label}
        </span>
      )}

      {/* Jump / Slide Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onJump}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 ${activeColor}`}
          aria-label="Lompat"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={onSlide}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center backdrop-blur-xs transition-transform active:scale-90 ${activeColor}`}
          aria-label="Meluncur / Menunduk"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
