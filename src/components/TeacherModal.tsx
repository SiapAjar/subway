import React, { useState } from 'react';
import {
  deleteTeacherToken,
  fetchGoogleSheetQuestions,
  generateUniqueToken,
  getSavedTokens,
  parseSpreadsheetCSV,
  saveTeacherToken,
} from '../services/storageService';
import { Question, TeacherTokenData } from '../types/game';
import {
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Table,
  Trash2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated?: (token: string) => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onTokenCreated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Dashboard state
  const [tokensList, setTokensList] = useState<TeacherTokenData[]>(() => getSavedTokens());
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [customCsv, setCustomCsv] = useState<string>('');
  const [inputMode, setInputMode] = useState<'url' | 'manual'>('url');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [generatedTokenPreview, setGeneratedTokenPreview] = useState<string>('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'guru' && password.trim() === 'guruhebat') {
      setIsAuthenticated(true);
      setLoginError('');
      setTokensList(getSavedTokens());
    } else {
      setLoginError('Username atau password guru salah! Gunakan: guru / guruhebat');
    }
  };

  const handleFetchSheet = async () => {
    if (!sheetUrl.trim()) {
      setStatusMsg({ type: 'error', text: 'Silakan masukkan link Google Spreadsheet terlebih dahulu!' });
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);

    try {
      const questions = await fetchGoogleSheetQuestions(sheetUrl.trim());
      setPreviewQuestions(questions);
      setStatusMsg({
        type: 'success',
        text: `Berhasil mengimpor ${questions.length} soal dari Google Spreadsheet!`,
      });
      if (!quizTitle) {
        setQuizTitle(`Kuis Guru #${Math.floor(100 + Math.random() * 900)}`);
      }
    } catch (err) {
      const error = err as Error;
      setStatusMsg({
        type: 'error',
        text: error.message || 'Gagal mengambil data. Pastikan link dapat diakses publik (Anyone with link).',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseManualCsv = () => {
    if (!customCsv.trim()) {
      setStatusMsg({ type: 'error', text: 'Silakan ketik atau tempel data soal terlebih dahulu!' });
      return;
    }
    try {
      const questions = parseSpreadsheetCSV(customCsv);
      if (questions.length === 0) {
        setStatusMsg({ type: 'error', text: 'Format belum sesuai. Minimal 1 baris dengan Pertanyaan dan Jawaban.' });
        return;
      }
      setPreviewQuestions(questions);
      setStatusMsg({
        type: 'success',
        text: `Berhasil memproses ${questions.length} soal manual!`,
      });
    } catch {
      setStatusMsg({ type: 'error', text: 'Gagal memproses data CSV.' });
    }
  };

  const handleSaveAndGenerateToken = () => {
    if (previewQuestions.length === 0) {
      setStatusMsg({ type: 'error', text: 'Belum ada soal yang dimuat. Klik "Muat & Uji Soal" terlebih dahulu.' });
      return;
    }

    const tokenCode = generateUniqueToken('GURU');
    const newPack: TeacherTokenData = {
      token: tokenCode,
      title: quizTitle.trim() || `Kuis Guru ${tokenCode}`,
      sheetUrl: sheetUrl.trim() || undefined,
      createdAt: Date.now(),
      questions: previewQuestions,
    };

    saveTeacherToken(newPack);
    setTokensList(getSavedTokens());
    setGeneratedTokenPreview(tokenCode);
    setStatusMsg({
      type: 'success',
      text: `Sukses! Token baru dibuat: ${tokenCode}. Berikan kode ini kepada murid.`,
    });

    if (onTokenCreated) {
      onTokenCreated(tokenCode);
    }

    // Reset inputs
    setSheetUrl('');
    setCustomCsv('');
    setQuizTitle('');
    setPreviewQuestions([]);
  };

  const handleCopy = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleDelete = (token: string) => {
    if (confirm(`Yakin ingin menghapus kuis token ${token}?`)) {
      deleteTeacherToken(token);
      setTokensList(getSavedTokens());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-amber-500/70 rounded-3xl shadow-2xl text-white relative flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-400 flex items-center gap-2">
                Portal Guru & Pengaturan Soal
              </h3>
              <p className="text-xs text-slate-400">
                Kelola tautan Google Spreadsheet & Token kuis untuk para siswa
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isAuthenticated ? (
            /* Login Gate */
            <div className="max-w-md mx-auto py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">Login Khusus Guru</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Masukkan identitas guru untuk menambah soal dari Google Spreadsheet
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Username Guru
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: guru"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 text-sm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password Guru
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contoh: guruhebat"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 text-sm"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-5 h-5" />
                  Masuk ke Dashboard Guru
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              {/* Token announcement banner if newly generated */}
              {generatedTokenPreview && (
                <div className="p-4 bg-emerald-500/20 border-2 border-emerald-500/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Token Berhasil Dibuat
                    </span>
                    <h4 className="text-2xl font-black text-white font-mono tracking-wide">
                      {generatedTokenPreview}
                    </h4>
                    <p className="text-xs text-emerald-200">
                      Bagikan kode token ini ke murid saat memulai permainan.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(generatedTokenPreview)}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 text-sm shrink-0"
                  >
                    {copiedToken === generatedTokenPreview ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedToken === generatedTokenPreview ? 'Tersalin!' : 'Salin Token'}
                  </button>
                </div>
              )}

              {/* Guide Card for Google Sheet */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Ketentuan Format Kolom Google Spreadsheet
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-amber-300 font-bold">Kolom A:</span>
                    <p className="text-slate-300">Pertanyaan Soal</p>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-emerald-400 font-bold">Kolom B:</span>
                    <p className="text-slate-300">Jawaban yang BENAR</p>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-700">
                    <span className="text-sky-300 font-bold">Kolom C, D, E:</span>
                    <p className="text-slate-300">Pilihan Jawaban Opsional (Pengecoh)</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  *Penting: Pastikan Google Spreadsheet diatur ke <strong>"Siapa saja yang memiliki link dapat melihat"</strong> (Anyone with link).
                </p>
              </div>

              {/* Form Input Tab */}
              <div className="space-y-4 bg-slate-800/40 border border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    Buat Kuis Baru & Dapatkan Token
                  </h4>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setInputMode('url')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        inputMode === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Tautan Google Sheet
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('manual')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        inputMode === 'manual' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Teks Manual / CSV
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Judul Kuis / Kelas</label>
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Contoh: Kuis IPA Kelas 5 - Adaptasi Makhluk Hidup"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-hidden"
                  />
                </div>

                {inputMode === 'url' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Link Google Spreadsheet
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0.../edit"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:border-amber-400 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleFetchSheet}
                        disabled={isLoading}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                        {isLoading ? 'Mengunduh...' : 'Muat Soal'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        Tempel Format CSV (Kolom A, Kolom B, Kolom C, D, E)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCsv(
                            `Apa ibukota Indonesia?,IKN Nusantara,Jakarta,Surabaya,Bandung\nHewan pemakan rumput disebut?,Herbivora,Karnivora,Omnivora,Insektivora\nBerapa kaki laba-laba?,8 kaki,6 kaki,4 kaki,10 kaki`
                          );
                        }}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Contoh Template
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={customCsv}
                      onChange={(e) => setCustomCsv(e.target.value)}
                      placeholder="Contoh:&#10;Pertanyaan,Jawaban Benar,Pilihan 1,Pilihan 2,Pilihan 3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono placeholder-slate-600 focus:border-amber-400 focus:outline-hidden"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleParseManualCsv}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs"
                      >
                        Periksa & Proses Soal
                      </button>
                    </div>
                  </div>
                )}

                {/* Status notice */}
                {statusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold ${
                      statusMsg.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {statusMsg.text}
                  </div>
                )}

                {/* Question preview and Save button */}
                {previewQuestions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400">
                        Ditemukan {previewQuestions.length} Soal Siap Digunakan:
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveAndGenerateToken}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-lg flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Simpan Kuis & Dapatkan Token
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-2 bg-slate-950/60">
                      {previewQuestions.slice(0, 6).map((q, i) => (
                        <div key={i} className="text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                          <p className="font-semibold text-slate-200">
                            {i + 1}. {q.question}
                          </p>
                          <p className="text-[11px] text-emerald-400 mt-1">
                            ✓ Benar: <strong>{q.correctAnswer}</strong> | Opsi: {q.options.join(', ')}
                          </p>
                        </div>
                      ))}
                      {previewQuestions.length > 6 && (
                        <p className="text-center text-[11px] text-slate-500">
                          ...dan {previewQuestions.length - 6} soal lainnya
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* List of active tokens */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Table className="w-4 h-4 text-amber-400" />
                  Daftar Token Kuis yang Tersedia ({tokensList.length})
                </h4>

                <div className="space-y-2.5">
                  {tokensList.map((tok) => {
                    const isDef = tok.token === 'DEFAULT';
                    return (
                      <div
                        key={tok.token}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-black text-amber-300 text-base bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              {tok.token}
                            </span>
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                              {tok.questions?.length || 0} Soal
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200 truncate">{tok.title}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(tok.token)}
                            className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                          >
                            {copiedToken === tok.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedToken === tok.token ? 'Tersalin' : 'Salin'}
                          </button>

                          {!isDef && (
                            <button
                              type="button"
                              onClick={() => handleDelete(tok.token)}
                              className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Hapus kuis"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
