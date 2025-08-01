import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { apiClient, NFTMetadata, MintResponse, MintStatusResponse } from '../lib/api-client';

export interface UseMintingReturn {
  isMinting: boolean;
  mintStatus: string;
  mintResult: MintResponse | null;
  mintNFT: (metadata: Omit<NFTMetadata, 'owner_wallet'>) => Promise<MintResponse>;
  checkMintStatus: (mintId: string) => Promise<MintStatusResponse>;
  resetMinting: () => void;
}

export const useMinting = (): UseMintingReturn => {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState('');
  const [mintResult, setMintResult] = useState<MintResponse | null>(null);

  const mintNFT = useCallback(async (metadata: Omit<NFTMetadata, 'owner_wallet'>): Promise<MintResponse> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setIsMinting(true);
    setMintStatus('Preparing transaction...');

    try {
      // Step 1: Prepare transaction (simulate blockchain interaction)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMintStatus('Please confirm in your wallet...');

      // Step 2: Simulate wallet confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      setMintStatus('Transaction submitted...');

      // Step 3: Call backend API
      const result = await apiClient.mintNFT({
        ...metadata,
        owner_wallet: address,
      });

      setMintResult(result);
      setMintStatus('Transaction confirmed!');
      
      return result;
    } catch (error) {
      console.error('Minting error:', error);
      setMintStatus('Transaction failed');
      throw error;
    } finally {
      setIsMinting(false);
    }
  }, [isConnected, address]);

  const checkMintStatus = useCallback(async (mintId: string): Promise<MintStatusResponse> => {
    return await apiClient.getMintStatus(mintId);
  }, []);

  const resetMinting = useCallback(() => {
    setIsMinting(false);
    setMintStatus('');
    setMintResult(null);
  }, []);

  return {
    isMinting,
    mintStatus,
    mintResult,
    mintNFT,
    checkMintStatus,
    resetMinting,
  };
}; 