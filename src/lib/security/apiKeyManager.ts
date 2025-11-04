/**
 * API Key Manager - Secure encryption/decryption of sensitive credentials
 *
 * Security Features:
 * - AES-256-GCM encryption (more secure than CBC)
 * - Authenticated encryption (prevents tampering)
 * - Random IV for each encryption
 * - Key rotation support
 *
 * MVP Security Mitigation Strategy
 */

import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // Must be 32 bytes (64 hex chars)
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Validate encryption key on module load
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

if (ENCRYPTION_KEY.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypt sensitive API keys with AES-256-GCM
 *
 * @param plaintext - The API key to encrypt
 * @returns JSON string with {encrypted, iv, authTag}
 */
export function encryptApiKey(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const data: EncryptedData = {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };

  return JSON.stringify(data);
}

/**
 * Decrypt API key
 *
 * @param ciphertext - JSON string from encryptApiKey()
 * @returns Decrypted API key
 * @throws Error if decryption fails or data is tampered
 */
export function decryptApiKey(ciphertext: string): string {
  try {
    const data: EncryptedData = JSON.parse(ciphertext);

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(data.iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key - data may be corrupted or tampered');
  }
}

/**
 * Rotate encryption key for all workspaces
 *
 * Use this:
 * - Periodically (every 90 days recommended)
 * - After suspected security breach
 * - When upgrading encryption algorithm
 *
 * @param db - Prisma client
 * @param oldKey - Previous ENCRYPTION_KEY (64 hex chars)
 */
export async function rotateApiKeys(
  db: PrismaClient,
  oldKey: string
): Promise<void> {
  console.log('🔄 Starting API key rotation...');

  // Temporarily set old key for decryption
  const currentKey = ENCRYPTION_KEY;
  (process.env.ENCRYPTION_KEY as any) = oldKey;

  const workspaces = await db.workspace.findMany({
    where: {
      OR: [
        { openaiApiKey: { not: null } },
        { shopifyAccessToken: { not: null } },
      ],
    },
  });

  let successCount = 0;
  let errorCount = 0;

  for (const workspace of workspaces) {
    try {
      const updates: any = {};

      if (workspace.openaiApiKey) {
        const decrypted = decryptApiKey(workspace.openaiApiKey);
        // Switch to new key
        (process.env.ENCRYPTION_KEY as any) = currentKey;
        updates.openaiApiKey = encryptApiKey(decrypted);
        (process.env.ENCRYPTION_KEY as any) = oldKey; // Switch back for next
      }

      if (workspace.shopifyAccessToken) {
        const decrypted = decryptApiKey(workspace.shopifyAccessToken);
        (process.env.ENCRYPTION_KEY as any) = currentKey;
        updates.shopifyAccessToken = encryptApiKey(decrypted);
        (process.env.ENCRYPTION_KEY as any) = oldKey;
      }

      await db.workspace.update({
        where: { id: workspace.id },
        data: updates,
      });

      successCount++;
    } catch (error) {
      console.error(`Failed to rotate keys for workspace ${workspace.id}:`, error);
      errorCount++;
    }
  }

  // Restore current key
  (process.env.ENCRYPTION_KEY as any) = currentKey;

  console.log(`✅ Key rotation complete: ${successCount} success, ${errorCount} errors`);
}

/**
 * Validate that an encrypted value can be decrypted
 * Use this to check if ENCRYPTION_KEY is correct
 */
export function validateEncryption(encrypted: string): boolean {
  try {
    decryptApiKey(encrypted);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new encryption key
 * Use this to create ENCRYPTION_KEY for .env
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
