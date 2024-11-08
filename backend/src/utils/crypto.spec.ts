import * as crypto from 'crypto';
import { decryptKey, encryptKey } from './crypto';

describe('Utils: crypto functions', () => {
  const testKey = 'test-key';
  const mockIv = crypto.randomBytes(16);

  it('should encrypt a key and return encrypted data and IV in hexadecimal (when iv is provided)', () => {
    const { encryptedKey, iv } = encryptKey(testKey, mockIv);
    expect(encryptedKey).toHaveLength(32); // 16 bytes is 32 characters in hex
    expect(iv).toEqual(mockIv.toString('hex'));
  });

  it('should encrypt a key and return encrypted data and a random IV (when iv is not provided)', () => {
    const { encryptedKey, iv } = encryptKey(testKey);
    expect(encryptedKey).toHaveLength(32); // 16 bytes is 32 characters in hex
    expect(iv).toHaveLength(32); // 16 bytes is 32 characters in hex
  });

  it('should decrypt a key and return the original key (when iv is provided)', () => {
    const { encryptedKey, iv } = encryptKey(testKey, mockIv);
    const decryptedKey = decryptKey(encryptedKey, iv);

    expect(decryptedKey).toEqual(testKey);
  });

  it('should decrypt a key and return the original key (when iv is not provided)', () => {
    const { encryptedKey, iv } = encryptKey(testKey);
    const decryptedKey = decryptKey(encryptedKey, iv);

    expect(decryptedKey).toEqual(testKey);
  });

  it('should throw an error if the key is not encrypted with the same IV', () => {
    const { encryptedKey, iv } = encryptKey(testKey, mockIv);
    const malformedIv = crypto.randomBytes(16).toString('hex');

    expect(() => decryptKey(encryptedKey, malformedIv)).toThrow();
  });
});
