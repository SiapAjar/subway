import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Question } from '../types/game';
import { soundManager } from '../game/audio';
import { Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface QuizModalProps {
  question: Question;
  playerName: string;
  isBattleMode?: boolean;
  isHalfScreen?: boolean;
  onAnswer: (isCorrect: boolean) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  question,
  playerName,
  isBattleMode = false,
  isHalfScreen = false,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() => {
    const arr = [...question.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  // Re-shuffle options whenever a new question is passed in
  useEffect(() => {
    const arr = [...question.options];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffledOptions(arr);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(15);
  }, [question.id, question.question]);

  // Timer countdown
  useEffect(() => {
    if (isAnswered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSelect(''); // Time ran out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered]);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    const correct = option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    setIsCorrect(correct);

    if (correct) {
      soundManager.playCorrect();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } else {
      soundManager.playWrong();
    }

    // Auto close and continue game
    setTimeout(() => {
      onAnswer(correct);
    }, 1600);
  };

  const containerClass = isHalfScreen
    ? 'absolute inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-200';

  return (
    <div className={containerClass}>
      <div className={`w-full ${isHalfScreen ? 'max-w-md p-4 sm:p-5' : 'max-w-lg p-6'} bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl text-white relative overflow-hidden`}>
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with Player badge and Timer */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-600/30 text-purple-300 rounded-xl">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  Bonus Soal Edukasi {isBattleMode ? '· Mode Battle' : '· Mode Individu'}
                </p>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black tracking-wider">
                  ⏸️ GAME TERPAUSE
                </span>
              </div>
              <h4 className="text-base font-bold text-white">Pemain: {playerName}</h4>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono font-bold text-sm ${
              timeLeft <= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-amber-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 mb-5">
          <p className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
            {question.question}
          </p>
        </div>

        {/* Options (Randomly shuffled order: A, B, C, D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {shuffledOptions.map((option, idx) => {
            const letter = ['A', 'B', 'C', 'D'][idx] || `${idx + 1}`;
            const isThisOption = selectedOption === option;
            const isRightAnswer = option.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

            let btnStyle = 'bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700 hover:border-amber-400/50';

            if (isAnswered) {
              if (isRightAnswer) {
                btnStyle = 'bg-emerald-600 text-white border-emerald-400 scale-[1.02] shadow-lg shadow-emerald-500/30';
              } else if (isThisOption && !isRightAnswer) {
                btnStyle = 'bg-rose-600/90 text-white border-rose-400';
              } else {
                btnStyle = 'bg-slate-800/40 text-slate-500 border-slate-800 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelect(option)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all font-semibold ${btnStyle}`}
              >
                <span className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center font-bold text-sm shrink-0">
                  {letter}
                </span>
                <span className="text-sm md:text-base leading-tight break-words flex-1">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback message */}
        {isAnswered && (
          <div
            className={`p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-center text-sm ${
              isCorrect
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  {isBattleMode
                    ? '🎉 Benar! +300 Poin Tambahan Battle!'
                    : '🎉 Benar! +1 Nyawa Tambahan & +250 Poin! Melanjutkan permainan...'}
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>
                  Kurang tepat! Jawaban benar: <strong className="underline ml-1">{question.correctAnswer}</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
