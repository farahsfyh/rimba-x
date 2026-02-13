import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Password validation schema
 * Minimum 8 characters, at least one letter and one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * File validation
 */
export interface FileValidationOptions {
  allowedTypes: string[];
  maxSize: number; // in bytes
  checkMagicNumbers?: boolean;
}

/**
 * Validate uploaded file
 */
export function validateFile(
  file: File,
  options: FileValidationOptions
): { valid: boolean; error?: string } {
  // Check file type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > options.maxSize) {
    const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // File name validation - prevent path traversal
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return {
      valid: false,
      error: 'Invalid file name',
    };
  }

  return { valid: true };
}

/**
 * Verify file magic numbers (file signatures)
 */
export async function verifyFileSignature(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // PDF signature: %PDF
  if (file.type === 'application/pdf') {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }
  
  // ZIP-based formats (DOCX, XLSX): PK
  if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return bytes[0] === 0x50 && bytes[1] === 0x4B;
  }
  
  // Plain text files don't have magic numbers
  if (file.type === 'text/plain') {
    return true;
  }
  
  return false;
}

/**
 * Validate session age
 */
export function isSessionValid(createdAt: string, maxAgeMinutes: number = 30): boolean {
  const sessionAge = Date.now() - new Date(createdAt).getTime();
  const maxAge = maxAgeMinutes * 60 * 1000;
  return sessionAge <= maxAge;
}

/**
 * Validate UUID format
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Validate language code
 */
export const languageSchema = z.enum(['en', 'ms', 'id', 'vi', 'th']);

/**
 * Validate XP value
 */
export const xpSchema = z.number().int().min(0).max(1000000);

/**
 * Validate level
 */
export const levelSchema = z.number().int().min(1).max(100);
