import { generateKey } from './keygen';
import { isAddress } from 'ethers';

describe('keygen', () => {
  it('should generate a key', () => {
    const res = generateKey();

    expect(res).toHaveProperty('address');
    expect(res).toHaveProperty('publicKey');
    expect(res).toHaveProperty('privateKey');

    expect(isAddress(res.address)).toBe(true);
  });
});
