import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import type { ParsedDocument } from '@/types';

/**
 * Parse PDF file
 */
export async function parsePDF(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const data = await pdf(buffer);
  
  return {
    text: data.text.trim(),
    metadata: {
      title: file.name,
      pageCount: data.numpages,
      format: 'PDF',
    },
  };
}

/**
 * Parse DOCX file
 */
export async function parseDOCX(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await mammoth.extractRawText({ arrayBuffer });
  
  return {
    text: result.value.trim(),
    metadata: {
      title: file.name,
      format: 'DOCX',
    },
  };
}

/**
 * Parse XLSX file
 */
export async function parseXLSX(file: File): Promise<ParsedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  let fullText = '';
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_txt(sheet, { blankrows: false });
    fullText += `=== ${sheetName} ===\n${sheetData}\n\n`;
  });
  
  return {
    text: fullText.trim(),
    metadata: {
      title: file.name,
      format: 'XLSX',
    },
  };
}

/**
 * Parse plain text file
 */
export async function parseTXT(file: File): Promise<ParsedDocument> {
  const text = await file.text();
  
  return {
    text: text.trim(),
    metadata: {
      title: file.name,
      format: 'TXT',
    },
  };
}

/**
 * Main document parser - auto-detects format
 */
export async function parseDocument(file: File): Promise<ParsedDocument> {
  const fileType = file.type;
  
  switch (fileType) {
    case 'application/pdf':
      return parsePDF(file);
      
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return parseDOCX(file);
      
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return parseXLSX(file);
      
    case 'text/plain':
      return parseTXT(file);
      
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

/**
 * Chunk text for embedding
 * Splits text into smaller chunks with overlap for better context
 */
export function chunkText(
  text: string,
  maxChunkSize: number = 1000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first (double newlines)
  const paragraphs = text.split(/\n\n+/);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph exceeds max size, save current chunk
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Start new chunk with overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate word count
      currentChunk = overlapWords.join(' ') + '\n\n' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no chunks were created (text too short), return as single chunk
  if (chunks.length === 0 && text.trim()) {
    chunks.push(text.trim());
  }
  
  return chunks;
}

/**
 * Extract metadata from document text
 */
export function extractMetadata(text: string, filename: string): {
  subject?: string;
  language: string;
} {
  // Simple heuristic for subject detection
  const subjectKeywords: Record<string, string[]> = {
    mathematics: ['math', 'calculus', 'algebra', 'geometry', 'trigonometry', 'equation'],
    science: ['biology', 'chemistry', 'physics', 'experiment', 'hypothesis'],
    programming: ['code', 'function', 'class', 'variable', 'algorithm', 'programming'],
    literature: ['author', 'novel', 'poem', 'literature', 'story', 'character'],
    history: ['history', 'century', 'war', 'kingdom', 'ancient', 'civilization'],
  };
  
  let detectedSubject: string | undefined;
  const lowerText = text.toLowerCase();
  
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matchCount >= 2) {
      detectedSubject = subject;
      break;
    }
  }
  
  // Simple language detection (very basic)
  let language = 'en'; // Default to English
  
  // Check for common words in other languages
  const malayWords = ['dan', 'atau', 'adalah', 'yang', 'dengan'];
  const indonesianWords = ['dan', 'atau', 'adalah', 'yang', 'dengan'];
  const vietnameseWords = ['và', 'hoặc', 'là', 'của', 'với'];
  const thaiWords = ['และ', 'หรือ', 'คือ', 'ของ', 'กับ'];
  
  if (malayWords.some(word => lowerText.includes(word))) language = 'ms';
  if (indonesianWords.some(word => lowerText.includes(word))) language = 'id';
  if (vietnameseWords.some(word => lowerText.includes(word))) language = 'vi';
  if (thaiWords.some(word => lowerText.includes(word))) language = 'th';
  
  return {
    subject: detectedSubject,
    language,
  };
}
