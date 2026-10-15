import React, { useState } from 'react';
import { ANIMAL_LIST } from '../game/characterBuilder';
import { getSavedTokens } from '../services/storageService';
import { AnimalType, GameMode } from '../types/game';
import { ArrowLeft, Play, Shield, Swords, User, Users, Sparkles, Key } from 'lucide-react';

interface CharacterSelectProps {
  mode: GameMode;
  initialToken?: string;
  onBack: () => void;
  onStartIndividu: (name: string, character: AnimalType, token: string) => void;
  onStartBattle: (
    p1: { name: string; character: AnimalType },
    p2: { name: string; character: AnimalType },
    token: string
  ) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  initialToken = 'DEFAULT',
  onBack,
  onStartIndividu,
  onStartBattle,
}) => {
  // Inputs
  const [tokenInput, setTokenInput] = useState<string>(initialToken);
  const [p1Name, setP1Name] = useState<string>('Pemain 1');
  const [p1Animal, setP1Animal] = useState<AnimalType>('kelinci');

  const [p2Name, setP2Name] = useState<string>('Pemain 2');
  const [p2Animal, setP2Animal] = useState<AnimalType>('harimau');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const savedTokens = getSavedTokens();

  const handleStart = () => {
    if (!tokenInput.trim()) {
      setErrorMsg('Harap masukkan Kode Token Kuis dari guru!');
      return;
    }

    if (mode === 'individu') {
      if (!p1Name.trim()) {
        setErrorMsg('Harap isi nama pemain!');
        return;
      }
      onStartIndividu(p1Name.trim(), p1Animal, tokenInput.trim().toUpperCase());
    } else {
      if (!p1Name.trim() || !p2Name.trim()) {
        setErrorMsg('Harap isi nama Pemain 1 dan Pemain 2!');
        return;
      }
      onStartBattle(
        { name: p1Name.trim(), character: p1Animal },
        { name: p2Name.trim(), character: p2Animal },
        tokenInput.trim().toUpperCase()
      );
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-white flex flex-col p-4 sm:p-6 lg:p-8">
      {/* Top Nav */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Menu
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-wider border border-amber-500/30 flex items-center gap-1.5">
            {mode === 'individu' ? <User className="w-4 h-4" /> : <Swords className="w-4 h-4" />}
            {mode === 'individu' ? 'Mode Individu' : 'Mode Battle Layar Terbelah'}
          </span>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col justify-between">
        {/* Token Section */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-3xl p-5 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Masukkan Kode Token dari Guru:
              </label>
              <p className="text-xs text-slate-400">
                Kode token menentukan bank soal dari Google Spreadsheet yang akan muncul selama bermain.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="Contoh: DEFAULT atau GURU-1234"
                className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-base font-mono font-bold tracking-wider text-amber-300 uppercase focus:outline-hidden w-48 text-center"
              />

              {/* Quick Token Selector Dropdown */}
              <select
                aria-label="Pilih Token Kuis Tersimpan"
                onChange={(e) => {
                  if (e.target.value) setTokenInput(e.target.value);
                }}
                className="bg-slate-800 border border-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-300 focus:outline-hidden"
              >
                <option value="">-- Pilih Kuis Tersimpan --</option>
                {savedTokens.map((t) => (
                  <option key={t.token} value={t.token}>
                    {t.token} ({t.title})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Character Pickers */}
        {mode === 'individu' ? (
          /* Single Player */
          <div className="space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <label className="text-sm font-bold text-slate-300 shrink-0">Nama Pemain:</label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  placeholder="Ketik nama kamu..."
                  className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white font-bold text-base focus:border-amber-400 focus:outline-hidden max-w-xs"
                />
              </div>

              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pilih Karakter Hewan Pelari (11 Pilihan):
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {ANIMAL_LIST.map((animal) => {
                  const isSelected = p1Animal === animal.id;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setP1Animal(animal.id)}
                      className={`relative p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col items-center justify-center text-center ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.03]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-4xl mb-1.5 filter drop-shadow">{animal.emoji}</span>
                      <span className="text-sm font-black text-white">{animal.name}</span>
                      <span className="text-[10px] text-amber-300 font-semibold mt-0.5">{animal.perk}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Battle Mode (Player 1 & Player 2) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 Card */}
            <div className="bg-slate-900/80 border-2 border-sky-500/40 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-black text-xs uppercase rounded-lg border border-sky-500/30">
                  Pemain 1 (Sisi Kiri)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Kontrol: Tombol W A S D</span>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 block mb-1">Nama Pemain 1:</label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-sky-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ANIMAL_LIST.map((animal) => {
                  const isSelected = p1Animal === animal.id;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setP1Animal(animal.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-sky-500/30 border-sky-400 text-white font-bold scale-[1.03]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl">{animal.emoji}</div>
                      <div className="text-[11px] font-bold truncate mt-0.5">{animal.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player 2 Card */}
            <div className="bg-slate-900/80 border-2 border-rose-500/40 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-black text-xs uppercase rounded-lg border border-rose-500/30">
                  Pemain 2 (Sisi Kanan)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Kontrol: Tombol Panah (Arrow)</span>
              </div>

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-400 block mb-1">Nama Pemain 2:</label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-rose-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ANIMAL_LIST.map((animal) => {
                  const isSelected = p2Animal === animal.id;
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => setP2Animal(animal.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-rose-500/30 border-rose-400 text-white font-bold scale-[1.03]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl">{animal.emoji}</div>
                      <div className="text-[11px] font-bold truncate mt-0.5">{animal.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-center text-sm">
            {errorMsg}
          </div>
        )}

        {/* Bottom CTA Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleStart}
            className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg tracking-wide shadow-2xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            {mode === 'individu' ? 'Mulai Berlari Sekarang!' : 'Mulai Pertandingan Battle!'}
          </button>
        </div>
      </div>
    </div>
  );
};
