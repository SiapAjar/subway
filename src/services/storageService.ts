import { Question, TeacherTokenData } from '../types/game';

const TOKENS_STORAGE_KEY = 'zoo_runner_teacher_tokens';

// Default starter question packs
export const DEFAULT_QUESTION_PACKS: TeacherTokenData[] = [
  {
    token: 'DEFAULT',
    title: 'Kuis Hewan & Alam Nusantara (Bawaan)',
    createdAt: Date.now() - 100000,
    questions: [
      {
        id: 'q-def-1',
        question: 'Hewan mamalia berkantong yang menjadi fauna khas Papua adalah...',
        correctAnswer: 'Kanguru Pohon',
        options: ['Koala', 'Kanguru Pohon', 'Platipus', 'Tasmanian Devil'],
        explanation: 'Kanguru pohon mantel emas adalah satwa khas hutan hujan Papua.'
      },
      {
        id: 'q-def-2',
        question: 'Hewan pemakan daging dan tumbuhan disebut sebagai...',
        correctAnswer: 'Omnivora',
        options: ['Karnivora', 'Herbivora', 'Omnivora', 'Insektivora'],
        explanation: 'Omnivora memakan segalanya termasuk daging dan tumbuhan.'
      },
      {
        id: 'q-def-3',
        question: 'Burung yang memiliki paruh besar melengkung dan menjadi lambang Kalimantan Barat adalah...',
        correctAnswer: 'Burung Enggang Gading',
        options: ['Burung Jalak Bali', 'Burung Cenderawasih', 'Burung Merak', 'Burung Enggang Gading'],
        explanation: 'Burung Enggang Gading (Rangkong) adalah maskot fauna Kalbar.'
      },
      {
        id: 'q-def-4',
        question: 'Proses metamorfosis sempurna pada katak dimulai dari tahap telur lalu menjadi...',
        correctAnswer: 'Berudu (Kecebong)',
        options: ['Katak Muda', 'Berudu (Kecebong)', 'Pupa', 'Nimfa'],
        explanation: 'Telur katak menetas menjadi berudu berinsang.'
      },
      {
        id: 'q-def-5',
        question: 'Alat pernapasan utama pada lumba-lumba dan paus adalah...',
        correctAnswer: 'Paru-paru',
        options: ['Insang', 'Trakea', 'Paru-paru', 'Kulit basah'],
        explanation: 'Lumba-lumba adalah mamalia yang bernapas dengan paru-paru.'
      },
      {
        id: 'q-def-6',
        question: 'Hewan darat tertinggi di dunia yang memiliki pola tutul unik adalah...',
        correctAnswer: 'Jerapah',
        options: ['Gajah Afrika', 'Unta', 'Kuda Nil', 'Jerapah'],
        explanation: 'Jerapah jantan dewasa bisa mencapai tinggi hingga 5,5 meter.'
      },
      {
        id: 'q-def-7',
        question: 'Kucing termasuk dalam famili hewan karnivora yang bernama...',
        correctAnswer: 'Felidae',
        options: ['Canidae', 'Felidae', 'Bovidae', 'Ursidae'],
        explanation: 'Keluarga Felidae meliputi kucing, harimau, singa, dan macan.'
      }
    ]
  },
  {
    token: 'IPA-JUARA',
    title: 'Kuis Sains & IPA Kelas 5 (Rantai Makanan)',
    createdAt: Date.now() - 50000,
    questions: [
      {
        id: 'q-ipa-1',
        question: 'Dalam rantai makanan di sawah, posisi padi berperan sebagai...',
        correctAnswer: 'Produsen',
        options: ['Konsumen I', 'Produsen', 'Konsumen II', 'Pengurai'],
        explanation: 'Padi menghasilkan makanannya sendiri melalui fotosintesis.'
      },
      {
        id: 'q-ipa-2',
        question: 'Hewan yang memakan produsen langsung disebut sebagai konsumen tingkat...',
        correctAnswer: 'Konsumen I (Primer)',
        options: ['Konsumen II (Sekunder)', 'Konsumen Puncak', 'Konsumen I (Primer)', 'Dekomposer'],
        explanation: 'Konsumen primer biasanya berupa hewan herbivora.'
      },
      {
        id: 'q-ipa-3',
        question: 'Organisme yang bertugas menguraikan sisa makhluk hidup yang mati adalah...',
        correctAnswer: 'Bakteri dan Jamur',
        options: ['Katak dan Ular', 'Elang dan Singa', 'Bakteri dan Jamur', 'Lumut dan Paku'],
        explanation: 'Bakteri dan jamur bertindak sebagai dekomposer dalam ekosistem.'
      },
      {
        id: 'q-ipa-4',
        question: 'Gas yang diserap tumbuhan saat fotosintesis di siang hari adalah...',
        correctAnswer: 'Karbon Dioksida (CO2)',
        options: ['Oksigen (O2)', 'Nitrogen (N2)', 'Hidrogen (H2)', 'Karbon Dioksida (CO2)'],
        explanation: 'Tumbuhan menyerap CO2 dan melepaskan O2 saat fotosintesis.'
      }
    ]
  },
  {
    token: 'MTK-PINTAR',
    title: 'Kuis Matematika Berhitung Cepat',
    createdAt: Date.now() - 20000,
    questions: [
      {
        id: 'q-mtk-1',
        question: 'Berapakah hasil dari 15 x 6 + 25?',
        correctAnswer: '115',
        options: ['110', '115', '125', '105'],
        explanation: '15 x 6 = 90. Kemudian 90 + 25 = 115.'
      },
      {
        id: 'q-mtk-2',
        question: 'Sebuah persegi memiliki keliling 48 cm. Berapakah panjang sisinya?',
        correctAnswer: '12 cm',
        options: ['14 cm', '16 cm', '12 cm', '8 cm'],
        explanation: 'Keliling persegi = 4 x sisi, jadi sisi = 48 / 4 = 12 cm.'
      },
      {
        id: 'q-mtk-3',
        question: 'Berapakah 25% dari 200?',
        correctAnswer: '50',
        options: ['25', '40', '60', '50'],
        explanation: '25/100 x 200 = 50.'
      },
      {
        id: 'q-mtk-4',
        question: 'Hasil dari 144 dibagi 12 lalu dikali 5 adalah...',
        correctAnswer: '60',
        options: ['72', '60', '55', '84'],
        explanation: '144 / 12 = 12. 12 x 5 = 60.'
      }
    ]
  }
];

// Helper to get all saved tokens from localStorage
export function getSavedTokens(): TeacherTokenData[] {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!raw) {
      // Initialize with default packs
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(DEFAULT_QUESTION_PACKS));
      return DEFAULT_QUESTION_PACKS;
    }
    const parsed: TeacherTokenData[] = JSON.parse(raw);
    // Make sure default packs are present
    const existingTokens = new Set(parsed.map(p => p.token.toUpperCase()));
    let updated = false;
    DEFAULT_QUESTION_PACKS.forEach(defPack => {
      if (!existingTokens.has(defPack.token.toUpperCase())) {
        parsed.unshift(defPack);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_QUESTION_PACKS;
  }
}

// Save a token pack
export function saveTeacherToken(tokenData: TeacherTokenData): boolean {
  try {
    const all = getSavedTokens().filter(t => t.token.toUpperCase() !== tokenData.token.toUpperCase());
    all.unshift(tokenData);
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch (err) {
    console.error('Error saving teacher token:', err);
    return false;
  }
}

// Delete a token pack
export function deleteTeacherToken(token: string): boolean {
  try {
    if (token.toUpperCase() === 'DEFAULT') return false; // Prevent deleting default
    const all = getSavedTokens().filter(t => t.token.toUpperCase() !== token.toUpperCase());
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

// Find questions by token
export function getQuestionsByToken(token: string): { data: TeacherTokenData | null; error?: string } {
  const cleanToken = token.trim().toUpperCase();
  const all = getSavedTokens();
  const found = all.find(t => t.token.toUpperCase() === cleanToken);
  if (!found) {
    return { data: null, error: `Token "${token}" tidak ditemukan. Pastikan token dari guru sudah benar atau gunakan kode "DEFAULT".` };
  }
  if (!found.questions || found.questions.length === 0) {
    return { data: null, error: `Token "${token}" belum memiliki pertanyaan.` };
  }
  // Ensure options order is randomized so correct answer is randomly A, B, C, or D
  const randomizedQuestions = found.questions.map(q => ({
    ...q,
    options: shuffleArray([...q.options])
  }));
  return {
    data: {
      ...found,
      questions: randomizedQuestions
    }
  };
}

// Generate unique 6-character token
export function generateUniqueToken(prefix: string = 'GURU'): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix.toUpperCase().slice(0, 4)}-${randNum}`;
}

// Extract Google Sheet ID from any format URL
export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

// Parse CSV text into questions
// Column A: Question
// Column B: Correct Answer
// Column C, D, E: Optional choices
export function parseSpreadsheetCSV(csvText: string): Question[] {
  const lines = parseCSVRows(csvText);
  const questions: Question[] = [];

  for (let i = 0; i < lines.length; i++) {
    const row = lines[i];
    if (row.length < 2) continue;

    const colA = (row[0] || '').trim();
    const colB = (row[1] || '').trim();

    // Check if this is a header row (skip if contains "pertanyaan" or "question" in row 0)
    if (i === 0 && (colA.toLowerCase().includes('pertanyaan') || colA.toLowerCase().includes('question'))) {
      continue;
    }

    if (!colA || !colB) continue;

    // Optional answers from col C, D, E
    const distractors = row.slice(2).map(s => s.trim()).filter(s => s.length > 0);

    // Build shuffled options containing colB and distractors
    const allOptions = Array.from(new Set([colB, ...distractors]));
    // Shuffle options so correct answer is not always first
    const shuffled = shuffleArray(allOptions);

    questions.push({
      id: `q-${Date.now()}-${i}`,
      question: colA,
      correctAnswer: colB,
      options: shuffled,
      explanation: `Jawaban benar: ${colB}`
    });
  }

  return questions;
}

// Robust CSV parser supporting quotes and commas inside cells
function parseCSVRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentCell);
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell);
      if (currentRow.some(c => c.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell);
    if (currentRow.some(c => c.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Fetch Google Sheet as CSV
export async function fetchGoogleSheetQuestions(sheetUrl: string): Promise<Question[]> {
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw new Error('URL Google Spreadsheet tidak valid. Pastikan link memiliki format https://docs.google.com/spreadsheets/d/...');
  }

  // Construct standard export URLs
  const exportUrls = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
  ];

  let lastError: Error | null = null;
  for (const url of exportUrls) {
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const csv = await resp.text();
        const questions = parseSpreadsheetCSV(csv);
        if (questions.length > 0) {
          return questions;
        }
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw new Error(
    lastError?.message ||
    'Tidak dapat mengunduh data spreadsheet. Pastikan izin berbagi spreadsheet diatur ke "Siapa saja yang memiliki link dapat melihat" (Anyone with the link can view).'
  );
}

// Array shuffle helper
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
