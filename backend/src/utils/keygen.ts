import { ethers } from 'ethers';

interface GenKey {
  address: string;
  publicKey: string;
  privateKey: string;
}

/**
 * Generate a new key pair
 */
export const generateKey = (): GenKey => {
  const wallet = ethers.Wallet.createRandom();
  const { address, publicKey, privateKey } = wallet;

  return { address, publicKey, privateKey };
};
