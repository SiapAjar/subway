import React, { useState } from 'react';
import { ANIMAL_LIST } from '../game/characterBuilder';
import { AnimalType } from '../types/game';
import { Crown, Home, MessageSquare, RotateCcw, Share2, Swords, Trophy } from 'lucide-react';

interface BattleResultPlayer {
  name: string;
  character: AnimalType;
  score: number;
  distance: number;
  coins: number;
  questionsCorrect: number;
}

interface BattleGameOverModalProps {
  token: string;
  p1: BattleResultPlayer;
  p2: BattleResultPlayer;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const BattleGameOverModal: React.FC<BattleGameOverModalProps> = ({
  token,
  p1,
  p2,
  onPlayAgain,
  onHome,
}) => {
  const [teacherPhone, setTeacherPhone] = useState<string>('');

  const p1Animal = ANIMAL_LIST.find((a) => a.id === p1.character) || ANIMAL_LIST[0];
  const p2Animal = ANIMAL_LIST.find((a) => a.id === p2.character) || ANIMAL_LIST[0];

  // Winner determined by points (score) as requested
  const isDraw = p1.score === p2.score;
  const p1Won = p1.score > p2.score;
  const winnerName = isDraw ? 'Seri!' : p1Won ? p1.name : p2.name;

  const handleShareWhatsApp = () => {
    const textMsg = `*HASIL PERTANDINGAN BATTLE ZOO RUNNER 3D* 🏆⚔️%0A%0A` +
      `🔑 *Token Kuis:* ${token}%0A` +
      `👑 *Pemenang:* ${isDraw ? 'HASIL IMBANG!' : `${winnerName} JUARA!`}%0A%0A` +
      `🔵 *Pemain 1:* ${p1.name} (${p1Animal.emoji} ${p1Animal.name})%0A` +
      `• Skor: ${p1.score.toLocaleString('id-ID')} Poin%0A` +
      `• Jarak: ${p1.distance}m | Kuis Benar: ${p1.questionsCorrect}%0A%0A` +
      `🔴 *Pemain 2:* ${p2.name} (${p2Animal.emoji} ${p2Animal.name})%0A` +
      `• Skor: ${p2.score.toLocaleString('id-ID')} Poin%0A` +
      `• Jarak: ${p2.distance}m | Kuis Benar: ${p2.questionsCorrect}%0A%0A` +
      `_Laporan hasil battle otomatis dari Zoo Runner 3D._`;

    let waUrl = `https://wa.me/?text=${textMsg}`;
    const cleanPhone = teacherPhone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      waUrl = `https://wa.me/${formattedPhone}?text=${textMsg}`;
    }
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl text-white relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-amber-400 uppercase tracking-wide flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-amber-300" />
            {isDraw ? 'PERTANDINGAN IMBANG!' : `${winnerName} MENANG!`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Penilaian ditentukan dari perolehan poin terbanyak dan kecakapan menjawab kuis
          </p>
        </div>

        {/* Head-to-Head Comparison Card */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Player 1 Side */}
          <div
            className={`rounded-2xl p-4 border-2 transition-all ${
              p1Won
                ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-400/30'
                : 'bg-slate-800/60 border-slate-700/80 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-sky-400">Pemain 1</span>
              {p1Won && (
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  JUARA 1 🏆
                </span>
              )}
            </div>

            <div className="text-center py-2">
              <div className="text-4xl mb-1">{p1Animal.emoji}</div>
              <h4 className="font-black text-base truncate">{p1.name}</h4>
              <p className="text-[11px] text-slate-400">{p1Animal.name}</p>
            </div>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-700/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Skor:</span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {p1.score.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jarak:</span>
                <span className="font-bold font-mono">{p1.distance}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kuis Benar:</span>
                <span className="font-bold text-emerald-400 font-mono">{p1.questionsCorrect}</span>
              </div>
            </div>
          </div>

          {/* Player 2 Side */}
          <div
            className={`rounded-2xl p-4 border-2 transition-all ${
              !p1Won && !isDraw
                ? 'bg-rose-950/50 border-rose-400 ring-2 ring-rose-400/30'
                : 'bg-slate-800/60 border-slate-700/80 opacity-90'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-rose-400">Pemain 2</span>
              {!p1Won && !isDraw && (
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  JUARA 1 🏆
                </span>
              )}
            </div>

            <div className="text-center py-2">
              <div className="text-4xl mb-1">{p2Animal.emoji}</div>
              <h4 className="font-black text-base truncate">{p2.name}</h4>
              <p className="text-[11px] text-slate-400">{p2Animal.name}</p>
            </div>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-700/60 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Skor:</span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {p2.score.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jarak:</span>
                <span className="font-bold font-mono">{p2.distance}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kuis Benar:</span>
                <span className="font-bold text-emerald-400 font-mono">{p2.questionsCorrect}</span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Share Card */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
            <Share2 className="w-4 h-4" />
            Lapor Hasil Battle ke WhatsApp Guru
          </div>

          <input
            type="tel"
            value={teacherPhone}
            onChange={(e) => setTeacherPhone(e.target.value)}
            placeholder="Nomor WA Guru (Opsional, contoh: 08123456789)"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 mb-2.5 focus:border-emerald-400 focus:outline-hidden"
          />

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Kirim Laporan Battle ke WhatsApp
          </button>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Tanding Ulang
          </button>

          <button
            type="button"
            onClick={onHome}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
