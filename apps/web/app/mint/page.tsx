'use client'
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@repo/web3';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import Navigation from '../../components/Navigation';

import toast from 'react-hot-toast';

interface NFTMetadata {
  name: string;
  description: string;
  image_url: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection_name?: string;
}

interface MintingStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed' | 'error';
}

const MintingPage = () => {
  const { address, isConnected } = useAccount();
  const [windowSize, setWindowSize] = useState({ width: 1920, height: 1080 });
  const [currentStep, setCurrentStep] = useState(1);

  React.useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update step status when wallet connection changes
  React.useEffect(() => {
    if (currentStep === 3 && isConnected) {
      updateStepStatus(3, 'completed');
    }
  }, [isConnected, currentStep]);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    image_url: '',
    attributes: [],
    collection_name: 'Ethereal Dreams',
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [mintStatus, setMintStatus] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);

  const [steps, setSteps] = useState<MintingStep[]>([
    { id: 1, title: 'NFT Details', description: 'Enter your NFT metadata', status: 'current' },
    { id: 2, title: 'Preview', description: 'Review your NFT', status: 'pending' },
    { id: 3, title: 'Wallet Check', description: 'Connect your wallet', status: 'pending' },
    { id: 4, title: 'Minting', description: 'Creating your NFT', status: 'pending' },
    { id: 5, title: 'Success', description: 'NFT created successfully', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: number, status: MintingStep['status']) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleMetadataChange = (field: keyof NFTMetadata, value: any) => {
    setNftMetadata(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAttribute = () => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), { trait_type: '', value: '' }]
    }));
  };

  const handleAttributeChange = (index: number, field: 'trait_type' | 'value', value: string) => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: prev.attributes?.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      ) || []
    }));
  };

  const handleRemoveAttribute = (index: number) => {
    setNftMetadata(prev => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index) || []
    }));
  };

  const handleNext = () => {
    if (currentStep === 1 && (!nftMetadata.name || !nftMetadata.image_url)) {
      alert('Please fill in the required fields');
      return;
    }
    if (currentStep === 3 && !isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    if (currentStep === 3 && isConnected) {
      // Start minting process from step 3
      handleMint();
      return;
    }
    if (currentStep === 4) {
      handleMint();
      return;
    }
    
    // Update current step status to completed
    updateStepStatus(currentStep, 'completed');
    // Update next step status to current
    updateStepStatus(currentStep + 1, 'current');
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    const newStep = Math.max(1, currentStep - 1);
    
    // If we're going back from minting step, stop the minting process
    if (currentStep === 4 && isMinting) {
      setIsMinting(false);
      setMintStatus('');
    }
    
    // Update current step status to pending
    updateStepStatus(currentStep, 'pending');
    // Update previous step status to current
    updateStepStatus(newStep, 'current');
    
    setCurrentStep(newStep);
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    console.log('Starting minting process...');
    console.log('NFT metadata:', nftMetadata);
    console.log('Wallet address:', address);

    setIsMinting(true);
    setMintStatus('Preparing transaction...');
    
    // Update minting step status to current
    updateStepStatus(4, 'current');

    try {
      // Step 1: Prepare transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMintStatus('Please confirm in your wallet...');

      // Step 2: Simulate wallet confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMintStatus('Transaction submitted...');

      // Step 3: Call backend API
      console.log('Calling backend API...');
      const requestBody = {
        ...nftMetadata,
        owner_wallet: address,
      };
      console.log('Request body:', requestBody);

      const response = await fetch('http://localhost:8000/api/nfts/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to mint NFT: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      setMintResult(result.data);
      setMintStatus('Transaction confirmed!');
      
      // Move to success step immediately
      console.log('Moving to success step...');
      // Update minting step to completed
      updateStepStatus(4, 'completed');
      // Update success step to current
      updateStepStatus(5, 'current');
      
      setCurrentStep(5);
      setIsMinting(false);
      setShowConfetti(true);
      toast.success('NFT minted successfully! 🎉');
      setTimeout(() => setShowConfetti(false), 5000);

    } catch (error) {
      console.error('Minting error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMintStatus(`Transaction failed: ${errorMessage}`);
      setIsMinting(false);
      updateStepStatus(4, 'error');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                NFT Name *
              </label>
              <input
                type="text"
                value={nftMetadata.name}
                onChange={(e) => handleMetadataChange('name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter NFT name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={nftMetadata.description}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                placeholder="Describe your NFT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Image URL *
              </label>
              <input
                type="url"
                value={nftMetadata.image_url}
                onChange={(e) => handleMetadataChange('image_url', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Collection Name
              </label>
              <input
                type="text"
                value={nftMetadata.collection_name}
                onChange={(e) => handleMetadataChange('collection_name', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Collection name"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Attributes
                </label>
                <button
                  type="button"
                  onClick={handleAddAttribute}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  + Add Attribute
                </button>
              </div>
              <div className="space-y-3">
                {nftMetadata.attributes?.map((attr, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={attr.trait_type}
                      onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Trait type"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="px-3 py-3 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="aspect-square rounded-xl overflow-hidden mb-4">
                {nftMetadata.image_url ? (
                  <img
                    src={nftMetadata.image_url}
                    alt={nftMetadata.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-slate-500">No image</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{nftMetadata.name || 'Untitled NFT'}</h3>
              <p className="text-slate-400 mb-4">{nftMetadata.description || 'No description'}</p>
              
              {nftMetadata.collection_name && (
                <div className="text-sm text-slate-500 mb-4">
                  Collection: {nftMetadata.collection_name}
                </div>
              )}
              
              {nftMetadata.attributes && nftMetadata.attributes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Attributes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {nftMetadata.attributes.map((attr, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-slate-400 uppercase tracking-wide">{attr.trait_type}</div>
                        <div className="text-sm font-medium text-white">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            {isConnected ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Wallet Connected</h3>
                  <p className="text-slate-400">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-slate-400 mb-4">
                    You need to connect your wallet to mint NFTs
                  </p>
                  <ConnectButton />
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }}></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Minting in Progress</h3>
              <p className="text-slate-400">{mintStatus}</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">NFT Minted Successfully!</h3>
              <p className="text-slate-400 mb-4">
                Your NFT has been created and is now part of the blockchain
              </p>
              
              {mintResult && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                  <div className="text-sm text-slate-400 mb-2">Transaction Hash</div>
                  <div className="text-sm text-white font-mono break-all">
                    {mintResult.transaction_hash}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    Block: {mintResult.block_number} | Gas: {mintResult.gas_used}
                  </div>
                  {mintResult.transaction_hash && (
                    <Link href={`/tx/${mintResult.transaction_hash}`}>
                      <button className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        View on Explorer →
                      </button>
                    </Link>
                  )}
                </div>
              )}
              
              <div className="flex gap-4 justify-center mt-6">
                <Link href="/nfts">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                    View Gallery
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setNftMetadata({
                      name: '',
                      description: '',
                      image_url: '',
                      attributes: [],
                      collection_name: 'Ethereal Dreams',
                    });
                    setMintResult(null);
                  }}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Mint Another
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b']}
        />
      )}
      
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              Mint Your NFT
            </h1>
            <p className="text-slate-400">
              Create and mint your unique digital collectible
            </p>
          </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      step.status === 'completed' 
                        ? 'bg-emerald-500 text-white' 
                        : step.status === 'current'
                        ? 'bg-purple-500 text-white'
                        : step.status === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-white/10 text-slate-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {step.status === 'completed' ? '✓' : step.id}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      step.status === 'completed' || step.status === 'current'
                        ? 'text-white'
                        : 'text-slate-400'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {step.description}
                    </div>
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <motion.div 
                    className={`flex-1 h-0.5 mx-4 ${
                      step.status === 'completed' ? 'bg-emerald-500' : 'bg-white/10'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={currentStep}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation */}
          {currentStep < 5 && (
            <motion.div 
              className="flex justify-between mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={handleBack}
                disabled={currentStep === 1}
                className="bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back
              </motion.button>
              
              <motion.button
                onClick={handleNext}
                disabled={isMinting || (currentStep === 1 && (!nftMetadata.name || !nftMetadata.image_url))}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep === 4 ? 'Minting...' : currentStep === 3 ? 'Start Minting' : 'Next'}
              </motion.button>
            </motion.div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default MintingPage; 