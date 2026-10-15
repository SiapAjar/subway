import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { GameEngine } from '../game/gameEngine';
import { AnimalType } from '../types/game';
import { ANIMAL_LIST } from '../game/characterBuilder';
import { Heart, Coins, Trophy, Milestone, Sparkles } from 'lucide-react';
import { OnScreenControls } from './OnScreenControls';

export interface RunnerCanvasHandle {
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  slide: () => void;
  pause: () => void;
  resume: () => void;
  addBonusLifeAndScore: (lives?: number, score?: number) => void;
  addBonusScoreOnly: (score?: number) => void;
  triggerBonusSparkles: () => void;
}

interface RunnerCanvasProps {
  playerName: string;
  animal: AnimalType;
  initialLives?: number;
  theme?: 'amber' | 'sky' | 'rose';
  isSplitScreen?: boolean;
  isPaused?: boolean;
  onMysteryBox: () => void;
  onHit: (remainingLives: number) => void;
  onGameOver: (finalStats: { score: number; distance: number; coins: number }) => void;
}

export const RunnerCanvas = forwardRef<RunnerCanvasHandle, RunnerCanvasProps>(
  (
    {
      playerName,
      animal,
      initialLives = 3,
      theme = 'amber',
      isSplitScreen = false,
      isPaused = false,
      onMysteryBox,
      onHit,
      onGameOver,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<GameEngine | null>(null);

    interface SparkleParticle {
      id: number;
      tx: number;
      ty: number;
      size: number;
      delay: number;
      color: string;
      type: 'star' | 'orb' | 'diamond';
    }

    const [stats, setStats] = useState({
      score: 0,
      distance: 0,
      coins: 0,
      lives: initialLives,
    });

    const [rewardBadge, setRewardBadge] = useState<{ text: string; icon: string; id: number } | null>(null);
    const [characterReward, setCharacterReward] = useState<{
      id: number;
      text: string;
      icon: string;
      particles: SparkleParticle[];
    } | null>(null);

    const animalData = ANIMAL_LIST.find((a) => a.id === animal) || ANIMAL_LIST[0];

    // Trigger explosive celebratory sparkles & aura around character
    const triggerCharacterReward = useCallback((text: string, icon: string) => {
      const colors = [
        '#facc15', // Gold
        '#10b981', // Emerald
        '#34d399', // Mint
        '#38bdf8', // Sky
        '#fef08a', // Light yellow
        '#ffffff', // White
        '#fbbf24', // Amber
      ];
      const particles: SparkleParticle[] = [];
      const count = 36;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
        const dist = 55 + Math.random() * 145;
        const tx = Math.cos(angle) * dist;
        const ty = -(40 + Math.abs(Math.sin(angle)) * 145 + Math.random() * 95);
        const types: ('star' | 'orb' | 'diamond')[] = ['star', 'orb', 'diamond'];
        particles.push({
          id: i,
          tx,
          ty,
          size: 11 + Math.floor(Math.random() * 16),
          delay: Math.floor(Math.random() * 280),
          color: colors[i % colors.length],
          type: types[i % types.length],
        });
      }

      const id = Date.now();
      setCharacterReward({ id, text, icon, particles });
      setRewardBadge({ text, icon, id });

      setTimeout(() => {
        setCharacterReward((curr) => (curr?.id === id ? null : curr));
      }, 2500);
      setTimeout(() => {
        setRewardBadge((curr) => (curr?.id === id ? null : curr));
      }, 2500);
    }, []);

    // Keep callbacks in ref so callback identity changes never recreate GameEngine
    const callbacksRef = useRef({
      onStatsUpdate: setStats,
      onMysteryBox,
      onHit,
      onGameOver,
    });

    useEffect(() => {
      callbacksRef.current = {
        onStatsUpdate: setStats,
        onMysteryBox,
        onHit,
        onGameOver,
      };
    });

    // Handle isPaused prop changes
    useEffect(() => {
      if (isPaused) {
        engineRef.current?.pause();
      } else {
        engineRef.current?.resume();
      }
    }, [isPaused]);

    // Expose engine controls to parent
    useImperativeHandle(ref, () => ({
      moveLeft: () => engineRef.current?.moveLeft(),
      moveRight: () => engineRef.current?.moveRight(),
      jump: () => engineRef.current?.jump(),
      slide: () => engineRef.current?.slide(),
      pause: () => engineRef.current?.pause(),
      resume: () => engineRef.current?.resume(),
      addBonusLifeAndScore: (lives = 1, score = 250) => {
        engineRef.current?.addBonusLifeAndScore(lives, score);
        triggerCharacterReward(`+${lives} NYAWA & +${score} POIN!`, '💚');
      },
      addBonusScoreOnly: (score = 300) => {
        engineRef.current?.addBonusScoreOnly(score);
        triggerCharacterReward(`+${score} POIN BONUS!`, '⭐');
      },
      triggerBonusSparkles: () => {
        engineRef.current?.triggerBonusSparkles();
        triggerCharacterReward('+BONUS SPARKLES!', '✨');
      },
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const engine = new GameEngine(
        containerRef.current,
        animal,
        initialLives,
        {
          onStatsUpdate: (s) => callbacksRef.current.onStatsUpdate(s),
          onMysteryBox: () => callbacksRef.current.onMysteryBox(),
          onHit: (l) => callbacksRef.current.onHit(l),
          onGameOver: (fs) => callbacksRef.current.onGameOver(fs),
        }
      );
      engineRef.current = engine;

      if (isPaused) {
        engine.pause();
      }

      const handleResize = () => {
        engine.handleResize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        engine.destroy();
        engineRef.current = null;
      };
    }, [animal, initialLives]);

    const themeColors = {
      amber: {
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
        scoreText: 'text-amber-300',
      },
      sky: {
        badge: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
        scoreText: 'text-sky-300',
      },
      rose: {
        badge: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
        scoreText: 'text-rose-300',
      },
    }[theme];

    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Full-Screen Golden-Emerald Edge Vignette Flash on Reward */}
        {characterReward && (
          <div className="pointer-events-none absolute inset-0 z-10 animate-[vignette-reward-flash_2.4s_ease-out_forwards] shadow-[inset_0_0_80px_rgba(16,185,129,0.38),inset_0_0_140px_rgba(250,204,21,0.22)]" />
        )}

        {/* Dynamic Glow & Sparkles Burst Directly Around Character */}
        {characterReward && (
          <div
            key={characterReward.id}
            className="pointer-events-none absolute bottom-[27%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
          >
            {/* Outer Blurred Emerald-Gold Radiant Aura */}
            <div className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-emerald-400/40 via-amber-300/45 to-emerald-200/30 blur-2xl animate-[aura-expand-fade_2.4s_ease-out_forwards]" />

            {/* Rotating Radiant Sunburst / Dashed Ring */}
            <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-amber-300/85 animate-[aura-spin-glow_3s_linear_infinite] shadow-[0_0_35px_rgba(250,204,21,0.7)]" />

            {/* Inner Glowing Core Pulse */}
            <div className="absolute w-24 h-24 rounded-full bg-emerald-400/25 border-2 border-emerald-300/80 animate-[aura-expand-fade_2.2s_ease-out_forwards] shadow-[0_0_25px_rgba(52,211,153,0.8)]" />

            {/* 36+ Floating Sparkle Particles (Stars, Diamonds, Orbs) */}
            {characterReward.particles.map((p) => (
              <div
                key={p.id}
                className="absolute pointer-events-none animate-[sparkle-burst_2.2s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                style={
                  {
                    '--tx': `${p.tx}px`,
                    '--ty': `${p.ty}px`,
                    animationDelay: `${p.delay}ms`,
                    color: p.color,
                    filter: `drop-shadow(0 0 6px ${p.color})`,
                  } as React.CSSProperties
                }
              >
                {p.type === 'star' && (
                  <svg
                    width={p.size}
                    height={p.size}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                )}
                {p.type === 'diamond' && (
                  <div
                    className="rotate-45 rounded-[2px]"
                    style={{
                      width: `${p.size * 0.75}px`,
                      height: `${p.size * 0.75}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 10px ${p.color}`,
                    }}
                  />
                )}
                {p.type === 'orb' && (
                  <div
                    className="rounded-full"
                    style={{
                      width: `${p.size * 0.65}px`,
                      height: `${p.size * 0.65}px`,
                      backgroundColor: p.color,
                      boxShadow: `0 0 12px ${p.color}, 0 0 4px #ffffff`,
                    }}
                  />
                )}
              </div>
            ))}

            {/* Floating Reward Text directly above the character */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap animate-[float-reward-text_2.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-950/95 border-2 border-amber-300 text-yellow-300 shadow-[0_0_25px_rgba(250,204,21,0.85)] font-black text-xs sm:text-sm tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-spin" />
                <span>{characterReward.text}</span>
                <span className="text-base">{characterReward.icon}</span>
              </div>
            </div>
          </div>
        )}

        {/* HUD Overlay - strictly pointer-events-none except interactive buttons */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-4">
          {/* Top Status Cluster */}
          <div className="flex items-center justify-between gap-2">
            {/* Lives / Nyawa */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800 pointer-events-auto shadow-md">
              <span className="text-xs font-bold text-slate-300 mr-1 hidden sm:inline">Nyawa:</span>
              <div className="flex gap-1">
                {Array.from({ length: Math.max(3, stats.lives) }).map((_, i) => (
                  <Heart
                    key={i}
                    className={`w-5 h-5 transition-transform ${
                      i < stats.lives
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'fill-slate-700 text-slate-700 opacity-40 scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Player Info Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl border ${themeColors.badge} bg-slate-950/80 shadow-md`}
            >
              <span className="text-lg">{animalData.emoji}</span>
              <span className="text-xs font-black truncate max-w-[120px]">{playerName}</span>
            </div>

            {/* Score & Distance */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className={`font-mono font-black tabular-nums text-sm ${themeColors.scoreText}`}>
                  {stats.score.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <Milestone className="w-4 h-4 text-sky-400" />
                <span className="font-mono font-bold tabular-nums text-slate-200">
                  {stats.distance}m
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="font-mono font-bold tabular-nums text-yellow-300">
                  {stats.coins}
                </span>
              </div>
            </div>
          </div>

          {/* Floating Sparkle Reward Badge */}
          {rewardBadge && (
            <div
              key={rewardBadge.id}
              className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-2xl shadow-emerald-500/40 border-2 border-white animate-bounce"
            >
              <Sparkles className="w-4 h-4 text-emerald-950 fill-emerald-950 animate-spin" />
              <span>{rewardBadge.icon} {rewardBadge.text}</span>
            </div>
          )}

          {/* Bottom On-Screen Controls */}
          <div className="w-full flex justify-center pb-1">
            <OnScreenControls
              theme={theme}
              label={isSplitScreen ? (theme === 'sky' ? 'P1 (WASD)' : 'P2 (Panah)') : 'Sentuh / Keyboard'}
              onLeft={() => engineRef.current?.moveLeft()}
              onRight={() => engineRef.current?.moveRight()}
              onJump={() => engineRef.current?.jump()}
              onSlide={() => engineRef.current?.slide()}
            />
          </div>
        </div>
      </div>
    );
  }
);
