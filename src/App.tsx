import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimalType, GameMode, GameScreen, Question } from './types/game';
import { getQuestionsByToken, DEFAULT_QUESTION_PACKS, shuffleArray } from './services/storageService';
import { soundManager } from './game/audio';
import { ANIMAL_LIST } from './game/characterBuilder';
import { RunnerCanvas, RunnerCanvasHandle } from './components/RunnerCanvas';
import { CharacterSelect } from './components/CharacterSelect';
import { QuizModal } from './components/QuizModal';
import { GameOverModal } from './components/GameOverModal';
import { BattleGameOverModal } from './components/BattleGameOverModal';
import { TeacherModal } from './components/TeacherModal';
import { HomeHero3D } from './components/HomeHero3D';
import {
  Volume2,
  VolumeX,
  GraduationCap,
  Play,
  Swords,
  User,
  Sparkles,
  Smartphone,
  Flame,
  Award,
  Zap,
} from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [mode, setMode] = useState<GameMode>('individu');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(true);

  // Home screen hero animal showcase
  const [heroAnimal, setHeroAnimal] = useState<AnimalType>('kelinci');

  // Active quiz questions bank
  const [activeToken, setActiveToken] = useState<string>('DEFAULT');
  const [questionBank, setQuestionBank] = useState<Question[]>(
    DEFAULT_QUESTION_PACKS[0].questions
  );
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // Quizzes state: SEPARATED per player so Battle mode screen remains cleanly split!
  const [singleQuiz, setSingleQuiz] = useState<Question | null>(null);
  const [p1Quiz, setP1Quiz] = useState<Question | null>(null);
  const [p2Quiz, setP2Quiz] = useState<Question | null>(null);

  // Single Player State
  const [singlePlayer, setSinglePlayer] = useState<{
    name: string;
    character: AnimalType;
    score: number;
    distance: number;
    coins: number;
    questionsAttempted: number;
    questionsCorrect: number;
  }>({
    name: 'Pelari Cilik',
    character: 'kelinci',
    score: 0,
    distance: 0,
    coins: 0,
    questionsAttempted: 0,
    questionsCorrect: 0,
  });

  // Battle Mode State (Player 1 & Player 2)
  const [p1State, setP1State] = useState<{
    name: string;
    character: AnimalType;
    score: number;
    distance: number;
    coins: number;
    questionsCorrect: number;
    isAlive: boolean;
  }>({
    name: 'Pemain 1',
    character: 'kelinci',
    score: 0,
    distance: 0,
    coins: 0,
    questionsCorrect: 0,
    isAlive: true,
  });

  const [p2State, setP2State] = useState<{
    name: string;
    character: AnimalType;
    score: number;
    distance: number;
    coins: number;
    questionsCorrect: number;
    isAlive: boolean;
  }>({
    name: 'Pemain 2',
    character: 'harimau',
    score: 0,
    distance: 0,
    coins: 0,
    questionsCorrect: 0,
    isAlive: true,
  });

  // Runner canvas references for imperative controls
  const singleRunnerRef = useRef<RunnerCanvasHandle>(null);
  const p1RunnerRef = useRef<RunnerCanvasHandle>(null);
  const p2RunnerRef = useRef<RunnerCanvasHandle>(null);

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth >= window.innerHeight || window.innerWidth > 768);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keys if typing in inputs or teacher modal is open
      if (
        isTeacherModalOpen ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Title screen quick start shortcuts
      if (screen === 'home') {
        if (e.code === 'Digit1' || e.code === 'Numpad1') {
          e.preventDefault();
          setMode('individu');
          setScreen('character_select');
        } else if (e.code === 'Digit2' || e.code === 'Numpad2') {
          e.preventDefault();
          setMode('battle');
          setScreen('character_select');
        } else if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          setMode('individu');
          setScreen('character_select');
        }
        return;
      }

      if (screen === 'playing_individu') {
        if (singleQuiz) return; // Suspended while answering quiz in single mode

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          singleRunnerRef.current?.moveLeft();
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          singleRunnerRef.current?.moveRight();
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          e.preventDefault();
          singleRunnerRef.current?.jump();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
          e.preventDefault();
          singleRunnerRef.current?.slide();
        }
      } else if (screen === 'playing_battle') {
        // Player 1 controls (WASD) - active only if P1 is NOT doing a quiz
        if (!p1Quiz) {
          if (e.code === 'KeyA') {
            e.preventDefault();
            p1RunnerRef.current?.moveLeft();
          } else if (e.code === 'KeyD') {
            e.preventDefault();
            p1RunnerRef.current?.moveRight();
          } else if (e.code === 'KeyW') {
            e.preventDefault();
            p1RunnerRef.current?.jump();
          } else if (e.code === 'KeyS') {
            e.preventDefault();
            p1RunnerRef.current?.slide();
          }
        }

        // Player 2 controls (Arrow Keys) - active only if P2 is NOT doing a quiz
        if (!p2Quiz) {
          if (e.code === 'ArrowLeft') {
            e.preventDefault();
            p2RunnerRef.current?.moveLeft();
          } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            p2RunnerRef.current?.moveRight();
          } else if (e.code === 'ArrowUp') {
            e.preventDefault();
            p2RunnerRef.current?.jump();
          } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            p2RunnerRef.current?.slide();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, singleQuiz, p1Quiz, p2Quiz, isTeacherModalOpen]);

  // Sound toggle
  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Helper to load questions by token
  const loadTokenQuestions = useCallback((token: string): boolean => {
    const result = getQuestionsByToken(token);
    if (result.data && result.data.questions.length > 0) {
      setQuestionBank(result.data.questions);
      setActiveToken(result.data.token);
      setQuestionIndex(0);
      return true;
    }
    // Fallback to default
    setQuestionBank(DEFAULT_QUESTION_PACKS[0].questions);
    setActiveToken('DEFAULT');
    return false;
  }, []);

  // Pick Next Question round-robin with random options order
  const getNextQuestion = useCallback((): Question => {
    if (!questionBank || questionBank.length === 0) {
      const def = DEFAULT_QUESTION_PACKS[0].questions[0];
      return {
        ...def,
        options: shuffleArray([...def.options]),
      };
    }
    const q = questionBank[questionIndex % questionBank.length];
    setQuestionIndex((prev) => prev + 1);
    return {
      ...q,
      options: shuffleArray([...q.options]),
    };
  }, [questionBank, questionIndex]);

  // Start Individu Game
  const handleStartIndividu = (name: string, character: AnimalType, token: string) => {
    loadTokenQuestions(token);
    setSinglePlayer({
      name,
      character,
      score: 0,
      distance: 0,
      coins: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
    });
    setScreen('playing_individu');
    soundManager.startBgm();
  };

  // Start Battle Game
  const handleStartBattle = (
    p1: { name: string; character: AnimalType },
    p2: { name: string; character: AnimalType },
    token: string
  ) => {
    loadTokenQuestions(token);
    setP1State({
      name: p1.name,
      character: p1.character,
      score: 0,
      distance: 0,
      coins: 0,
      questionsCorrect: 0,
      isAlive: true,
    });
    setP2State({
      name: p2.name,
      character: p2.character,
      score: 0,
      distance: 0,
      coins: 0,
      questionsCorrect: 0,
      isAlive: true,
    });
    setP1Quiz(null);
    setP2Quiz(null);
    setScreen('playing_battle');
    soundManager.startBgm();
  };

  // Handle Mystery Box pickup in Single Player
  const handleSingleMysteryBox = useCallback(() => {
    soundManager.stopBgm();
    singleRunnerRef.current?.pause();
    const q = getNextQuestion();
    setSingleQuiz(q);
  }, [getNextQuestion]);

  // Handle Mystery Box pickup in Battle Mode for Player 1
  // Crucial: ONLY Player 1 is paused! Player 2 continues uninterrupted!
  const handleP1MysteryBox = useCallback(() => {
    p1RunnerRef.current?.pause();
    const q = getNextQuestion();
    setP1Quiz(q);
  }, [getNextQuestion]);

  // Handle Mystery Box pickup in Battle Mode for Player 2
  // Crucial: ONLY Player 2 is paused! Player 1 continues uninterrupted!
  const handleP2MysteryBox = useCallback(() => {
    p2RunnerRef.current?.pause();
    const q = getNextQuestion();
    setP2Quiz(q);
  }, [getNextQuestion]);

  // Handle Single Player Quiz Answer
  const handleSingleQuizAnswer = (isCorrect: boolean) => {
    setSinglePlayer((prev) => ({
      ...prev,
      questionsAttempted: prev.questionsAttempted + 1,
      questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0),
    }));

    if (isCorrect) {
      singleRunnerRef.current?.addBonusLifeAndScore(1, 250);
    }
    singleRunnerRef.current?.resume();
    setSingleQuiz(null);
    soundManager.startBgm();
  };

  // Handle Player 1 Quiz Answer in Battle
  const handleP1QuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      p1RunnerRef.current?.addBonusScoreOnly(300);
      setP1State((prev) => ({
        ...prev,
        score: prev.score + 300,
        questionsCorrect: prev.questionsCorrect + 1,
      }));
    }
    p1RunnerRef.current?.resume();
    setP1Quiz(null);
  };

  // Handle Player 2 Quiz Answer in Battle
  const handleP2QuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      p2RunnerRef.current?.addBonusScoreOnly(300);
      setP2State((prev) => ({
        ...prev,
        score: prev.score + 300,
        questionsCorrect: prev.questionsCorrect + 1,
      }));
    }
    p2RunnerRef.current?.resume();
    setP2Quiz(null);
  };

  // Single Player Game Over
  const handleSingleGameOver = (finalStats: { score: number; distance: number; coins: number }) => {
    soundManager.stopBgm();
    setSinglePlayer((prev) => ({
      ...prev,
      score: finalStats.score,
      distance: finalStats.distance,
      coins: finalStats.coins,
    }));
    setScreen('game_over_individu');
  };

  // Battle Mode Player Knocked Out
  const handleP1GameOver = (finalStats: { score: number; distance: number; coins: number }) => {
    setP1State((prev) => ({
      ...prev,
      score: finalStats.score,
      distance: finalStats.distance,
      coins: finalStats.coins,
      isAlive: false,
    }));
    if (!p2State.isAlive) {
      soundManager.stopBgm();
      setScreen('game_over_battle');
    }
  };

  const handleP2GameOver = (finalStats: { score: number; distance: number; coins: number }) => {
    setP2State((prev) => ({
      ...prev,
      score: finalStats.score,
      distance: finalStats.distance,
      coins: finalStats.coins,
      isAlive: false,
    }));
    if (!p1State.isAlive) {
      soundManager.stopBgm();
      setScreen('game_over_battle');
    }
  };

  const activeHeroAnimal = ANIMAL_LIST.find((a) => a.id === heroAnimal) || ANIMAL_LIST[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Nunito',sans-serif] text-white select-none">
      {/* Landscape Reminder for small mobile portrait viewports */}
      {!isLandscape && screen !== 'home' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <Smartphone className="w-16 h-16 text-amber-400 animate-bounce mb-3 rotate-90" />
          <h3 className="text-xl font-black text-amber-400 mb-1">Putar Layar ke Mode Lanskap</h3>
          <p className="text-xs text-slate-300 max-w-xs">
            Game Subway Surfers Zoo Runner dirancang khusus untuk orientasi lanskap agar trek rel dan mode split-screen 2 pemain tampil optimal!
          </p>
          <button
            type="button"
            onClick={() => setIsLandscape(true)}
            className="mt-5 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs border border-slate-700 cursor-pointer"
          >
            Tetap Lanjutkan
          </button>
        </div>
      )}

      {/* Top Floating Utility Bar (Mute & Teacher Portal Shortcut) */}
      <div className="fixed top-3 right-3 z-40 flex items-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={toggleSound}
          className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-xs transition-colors shadow-lg cursor-pointer"
          title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {screen === 'home' && (
          <button
            type="button"
            onClick={() => setIsTeacherModalOpen(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/50 text-amber-300 font-black text-xs flex items-center gap-2 backdrop-blur-xs transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Portal Masuk Guru</span>
            <span className="sm:hidden">Guru</span>
          </button>
        )}
      </div>

      {/* SCREEN 1: ULTRA-COOL ARCADE HOME SCREEN */}
      {screen === 'home' && (
        <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-slate-950 to-slate-950 overflow-y-auto">
          {/* Subtle animated neon ambient glow */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Banner */}
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between shrink-0 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 font-extrabold text-xs tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>SUBWAY SURFERS 3D EDUKASI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-mono">EDISI INDONESIA</span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-400" /> 60 FPS 3D</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-emerald-400" /> Google Sheets Quiz</span>
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-rose-400" /> Split-Screen Battle</span>
            </div>
          </div>

          {/* Center Main Stage (2 Columns: Hero Copy & Actions on Left, 3D Interactive Stage on Right) */}
          <div className="max-w-7xl w-full mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-2">
            {/* Left Column: Arcade Title & Mode Pickers */}
            <div className="lg:col-span-6 space-y-4">
              {/* Bespoke Subway Surfers Style Title Lockup */}
              <div>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight uppercase leading-none font-['Fredoka',sans-serif]">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-lime-300 drop-shadow-md">
                    ZOO RUNNER
                  </span>
                  <span className="block text-3xl sm:text-4xl md:text-5xl text-emerald-400 mt-1 tracking-wider drop-shadow flex items-center gap-2">
                    JUNGLE SAFARI 3D 🌴
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg leading-relaxed">
                  Lari lincah di rel kayu hutan tropis, lompati batang pohon tumbang, meluncur di bawah sulur liana pohon rimba, ambil kotak peninggalan kuis dari guru dan raih poin tertinggi!
                </p>
              </div>

              {/* Game Mode CTA Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {/* Mode Individu */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('individu');
                    setScreen('character_select');
                  }}
                  className="group relative p-4 rounded-3xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 hover:border-amber-400 shadow-xl hover:shadow-amber-500/20 transition-all text-left flex flex-col justify-between hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <User className="w-5 h-5" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-black text-amber-300 uppercase">
                      1 Pemain
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      Mode Individu
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Jawab kuis benar = <strong>+1 Nyawa</strong> & lapor skor ke WhatsApp Guru.
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <span>MAIN SEKARANG</span>
                    <Play className="w-3.5 h-3.5 fill-amber-400" />
                  </div>
                </button>

                {/* Mode Battle */}
                <button
                  type="button"
                  onClick={() => {
                    setMode('battle');
                    setScreen('character_select');
                  }}
                  className="group relative p-4 rounded-3xl bg-gradient-to-b from-sky-500/15 via-slate-900 to-slate-900 border-2 border-sky-500/50 hover:border-sky-400 shadow-xl hover:shadow-sky-500/20 transition-all text-left flex flex-col justify-between hover:scale-[1.02] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      <Swords className="w-5 h-5" />
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-[10px] font-black text-sky-300 uppercase">
                      Layar Terbelah
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                      Mode Battle 1 vs 1
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Split-screen 2 pemain. Kuis kuis berhadiah poin, duel skor tertinggi!
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-black text-sky-400">
                    <span>TANDING BATTLE</span>
                    <Play className="w-3.5 h-3.5 fill-sky-400" />
                  </div>
                </button>
              </div>

              {/* Control Hint Line */}
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-300 font-bold">🕹️ Navigasi Tombol:</span>
                <span className="font-mono text-amber-300">A / D / Panah</span> Pindah Jalur
                <span className="font-mono text-sky-300">W / Spasi</span> Lompat
                <span className="font-mono text-emerald-300">S / Bawah</span> Meluncur
              </div>
            </div>

            {/* Right Column: Interactive 3D Hero Stage & Live Character Switcher */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="relative w-full h-[320px] sm:h-[380px] bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border-2 border-slate-800 rounded-3xl p-2 shadow-2xl overflow-hidden flex flex-col justify-between">
                {/* Badge top */}
                <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1.5">
                    <span>{activeHeroAnimal.emoji}</span>
                    <span>{activeHeroAnimal.name}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold bg-slate-950/60 px-2 py-0.5 rounded-md">
                    {activeHeroAnimal.perk}
                  </span>
                </div>

                {/* 3D Canvas Centerpiece */}
                <div className="w-full h-full">
                  <HomeHero3D selectedAnimal={heroAnimal} />
                </div>

                {/* Interactive Animal Dock */}
                <div className="absolute bottom-2 inset-x-2 z-10 bg-slate-950/90 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-xs flex items-center gap-1.5 overflow-x-auto justify-start sm:justify-center">
                  {ANIMAL_LIST.map((animal) => {
                    const isSelected = heroAnimal === animal.id;
                    return (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => {
                          setHeroAnimal(animal.id);
                          soundManager.playSwitchLane();
                        }}
                        className={`p-1.5 rounded-xl text-lg sm:text-xl transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg shadow-amber-500/30'
                            : 'hover:bg-slate-800 text-slate-300 opacity-70 hover:opacity-100'
                        }`}
                        title={animal.name}
                      >
                        {animal.emoji}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Note */}
          <div className="max-w-7xl w-full mx-auto text-center text-[11px] text-slate-500 shrink-0 pt-2 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Kode Soal Saat Ini: <strong className="text-amber-400 font-mono">{activeToken}</strong> (Dapat diganti dengan token dari Guru)
            </span>
            <span>
              Masuk Guru: Username <code className="text-slate-400">guru</code> · Password <code className="text-slate-400">guruhebat</code>
            </span>
          </div>
        </div>
      )}

      {/* SCREEN 2: CHARACTER & TOKEN SELECTION */}
      {screen === 'character_select' && (
        <CharacterSelect
          mode={mode}
          initialToken={activeToken}
          onBack={() => setScreen('home')}
          onStartIndividu={handleStartIndividu}
          onStartBattle={handleStartBattle}
        />
      )}

      {/* SCREEN 3: PLAYING INDIVIDU */}
      {screen === 'playing_individu' && (
        <div className="relative w-full h-full">
          <RunnerCanvas
            ref={singleRunnerRef}
            playerName={singlePlayer.name}
            animal={singlePlayer.character}
            initialLives={3}
            theme="amber"
            isPaused={Boolean(singleQuiz)}
            onMysteryBox={handleSingleMysteryBox}
            onHit={(livesLeft) => {
              setSinglePlayer((prev) => ({ ...prev, lives: livesLeft }));
            }}
            onGameOver={handleSingleGameOver}
          />

          {/* Single Player Quiz Modal */}
          {singleQuiz && (
            <QuizModal
              question={singleQuiz}
              playerName={singlePlayer.name}
              isBattleMode={false}
              isHalfScreen={false}
              onAnswer={handleSingleQuizAnswer}
            />
          )}
        </div>
      )}

      {/* SCREEN 4: PLAYING BATTLE (STRICT SPLIT-SCREEN LANDSCAPE) */}
      {/* Both screens remain 50% split. When P1 gets a quiz, ONLY P1 sees the quiz overlay on the left; P2 keeps running uninterrupted! */}
      {screen === 'playing_battle' && (
        <div className="relative w-full h-full flex flex-row overflow-hidden divide-x-4 divide-slate-900">
          {/* Player 1 Viewport (Left Half 50%) */}
          <div className="relative w-1/2 h-full overflow-hidden">
            <RunnerCanvas
              ref={p1RunnerRef}
              playerName={p1State.name}
              animal={p1State.character}
              initialLives={3}
              theme="sky"
              isSplitScreen={true}
              isPaused={Boolean(p1Quiz)}
              onMysteryBox={handleP1MysteryBox}
              onHit={() => {}}
              onGameOver={handleP1GameOver}
            />

            {/* In-viewport Quiz Overlay for Player 1 ONLY */}
            {p1Quiz && (
              <QuizModal
                question={p1Quiz}
                playerName={p1State.name}
                isBattleMode={true}
                isHalfScreen={true}
                onAnswer={handleP1QuizAnswer}
              />
            )}

            {!p1State.isAlive && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
                <span className="text-2xl font-black text-rose-400 uppercase">
                  {p1State.name} Gugur!
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Menunggu Pemain 2 menyelesaikan permainan...
                </p>
              </div>
            )}
          </div>

          {/* Player 2 Viewport (Right Half 50%) */}
          <div className="relative w-1/2 h-full overflow-hidden">
            <RunnerCanvas
              ref={p2RunnerRef}
              playerName={p2State.name}
              animal={p2State.character}
              initialLives={3}
              theme="rose"
              isSplitScreen={true}
              isPaused={Boolean(p2Quiz)}
              onMysteryBox={handleP2MysteryBox}
              onHit={() => {}}
              onGameOver={handleP2GameOver}
            />

            {/* In-viewport Quiz Overlay for Player 2 ONLY */}
            {p2Quiz && (
              <QuizModal
                question={p2Quiz}
                playerName={p2State.name}
                isBattleMode={true}
                isHalfScreen={true}
                onAnswer={handleP2QuizAnswer}
              />
            )}

            {!p2State.isAlive && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
                <span className="text-2xl font-black text-rose-400 uppercase">
                  {p2State.name} Gugur!
                </span>
                <p className="text-xs text-slate-300 mt-1">
                  Menunggu Pemain 1 menyelesaikan permainan...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 5: GAME OVER INDIVIDU */}
      {screen === 'game_over_individu' && (
        <GameOverModal
          playerName={singlePlayer.name}
          animal={singlePlayer.character}
          token={activeToken}
          score={singlePlayer.score}
          distance={singlePlayer.distance}
          coins={singlePlayer.coins}
          questionsCorrect={singlePlayer.questionsCorrect}
          questionsAttempted={singlePlayer.questionsAttempted}
          onPlayAgain={() => {
            setScreen('playing_individu');
            soundManager.startBgm();
          }}
          onHome={() => setScreen('home')}
        />
      )}

      {/* SCREEN 6: GAME OVER BATTLE */}
      {screen === 'game_over_battle' && (
        <BattleGameOverModal
          token={activeToken}
          p1={p1State}
          p2={p2State}
          onPlayAgain={() => {
            setP1State((prev) => ({ ...prev, isAlive: true, score: 0, distance: 0, coins: 0 }));
            setP2State((prev) => ({ ...prev, isAlive: true, score: 0, distance: 0, coins: 0 }));
            setP1Quiz(null);
            setP2Quiz(null);
            setScreen('playing_battle');
            soundManager.startBgm();
          }}
          onHome={() => setScreen('home')}
        />
      )}

      {/* TEACHER DASHBOARD MODAL */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onTokenCreated={(token) => {
          setActiveToken(token);
          loadTokenQuestions(token);
        }}
      />
    </div>
  );
}
