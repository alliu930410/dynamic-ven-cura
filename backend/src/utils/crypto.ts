import * as crypto from 'crypto';

const { WALLET_ENCRYPTION_KEY } = process.env;
if (WALLET_ENCRYPTION_KEY) {
  throw new Error(
    'WALLET_ENCRYPTION_KEY is not set in the environment variables',
  );
}

// Convert WALLET_ENCRYPTION_KEY to a buffer
const encryptionKey = Buffer.from(WALLET_ENCRYPTION_KEY, 'hex');
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts the key using the encryption key and a random initialization vector
 *
 * @param key The key to encrypt
 * @param iv The initialization vector to use. If not provided, a random one will be generated
 * @returns encryptedKey and iv
 */
export const encryptKey = (
  key: string,
  iv: Buffer | null,
): { encryptedKey: string; iv: string } => {
  const initializationVector = iv || crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    encryptionKey,
    initializationVector,
  );

  const encryptedKey = Buffer.concat([
    cipher.update(key, 'utf8'),
    cipher.final(),
  ]);

  return {
    encryptedKey: encryptedKey.toString('hex'),
    iv: initializationVector.toString('hex'),
  };
};

/**
 * Decrypts the key using the encryption key and the initialization vector
 *
 * @param encryptedKey The key to decrypt
 * @param iv The initialization vector to use
 */
export const decryptKey = (encryptedKey: string, iv: string): string => {
  const initializationVector = Buffer.from(iv, 'hex');
  const encryptedText = Buffer.from(encryptedKey, 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    encryptionKey,
    initializationVector,
  );

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
};
