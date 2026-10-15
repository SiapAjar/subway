import React, { useState } from 'react';
import { AnimalInfo, AnimalType } from '../types/game';
import { ANIMAL_LIST } from '../game/characterBuilder';
import { Trophy, RotateCcw, Home, MessageSquare, Share2, HeartCrack, Coins, Milestone } from 'lucide-react';

interface GameOverModalProps {
  playerName: string;
  animal: AnimalType;
  token: string;
  score: number;
  distance: number;
  coins: number;
  questionsCorrect: number;
  questionsAttempted: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  playerName,
  animal,
  token,
  score,
  distance,
  coins,
  questionsCorrect,
  questionsAttempted,
  onPlayAgain,
  onHome,
}) => {
  const [teacherPhone, setTeacherPhone] = useState<string>('');
  const animalData = ANIMAL_LIST.find((a) => a.id === animal) || ANIMAL_LIST[0];

  const handleShareWhatsApp = () => {
    const textMsg = `*LAPORAN HASIL GAME ZOO RUNNER 3D* 🎮🏃‍♂️%0A%0A` +
      `👤 *Nama Siswa:* ${playerName}%0A` +
      `🐾 *Karakter:* ${animalData.emoji} ${animalData.name}%0A` +
      `🔑 *Token Kuis:* ${token}%0A` +
      `⭐ *Skor Akhir:* ${score.toLocaleString('id-ID')} Poin%0A` +
      `📏 *Jarak Tempuh:* ${distance} meter%0A` +
      `🪙 *Koin Terkumpul:* ${coins}%0A` +
      `📚 *Soal Edukasi Benar:* ${questionsCorrect} dari ${questionsAttempted} soal%0A%0A` +
      `_Halo Bapak/Ibu Guru, saya telah menyelesaikan permainan edukasi Zoo Runner 3D. Terima kasih!_`;

    let waUrl = `https://wa.me/?text=${textMsg}`;
    const cleanPhone = teacherPhone.replace(/[^0-9]/g, '');
    if (cleanPhone) {
      // If starts with 08, convert to 628
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      waUrl = `https://wa.me/${formattedPhone}?text=${textMsg}`;
    }

    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-3xl p-6 shadow-2xl text-white relative flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center justify-center mx-auto mb-2 text-rose-400">
            <HeartCrack className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">PERMAINAN BERAKHIR!</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hebat, {playerName}! Nyawa habis setelah menabrak rintangan.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
              <Trophy className="w-4 h-4" /> Skor Akhir
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {score.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-sky-400 text-xs font-bold mb-1">
              <Milestone className="w-4 h-4" /> Jarak Tempuh
            </div>
            <div className="text-2xl font-black text-sky-300 font-mono">{distance}m</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-xs font-bold mb-1">
              <Coins className="w-4 h-4" /> Koin Didapat
            </div>
            <div className="text-xl font-black text-yellow-300 font-mono">{coins}</div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
              <MessageSquare className="w-4 h-4" /> Kuis Benar
            </div>
            <div className="text-xl font-black text-emerald-300 font-mono">
              {questionsCorrect}/{questionsAttempted}
            </div>
          </div>
        </div>

        {/* WhatsApp Share Card (Requested Feature) */}
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-xs">
            <Share2 className="w-4 h-4" />
            Lapor Nilai ke Guru via WhatsApp
          </div>

          <p className="text-[11px] text-slate-300 mb-2.5">
            Klik tombol di bawah untuk mengirim pesan otomatis laporan skor kamu ke WhatsApp Guru:
          </p>

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
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            Bagikan ke WhatsApp Sekarang
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Main Lagi
          </button>

          <button
            type="button"
            onClick={onHome}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
