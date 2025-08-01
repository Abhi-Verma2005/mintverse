'use client'
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@repo/web3';
import { apiClient, NFTResponse } from '../../lib/api-client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navigation from '../../components/Navigation';

// Helper function to get safe image URL
const getSafeImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return 'https://picsum.photos/400/400?random=999';
  
  // Return the original image URL - don't modify it
  return imageUrl;
};

// NFT Card Component for My NFTs
const MyNFTCard = ({ nft }: { nft: NFTResponse }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 h-full flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden flex-shrink-0">
                  {nft.image ? (
            <Image 
              src={getSafeImageUrl(nft.image)} 
              alt={nft.name || 'NFT'}
              width={400}
              height={400}
              unoptimized
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = 'https://picsum.photos/400/400?random=999';
              }}
            />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">#{nft.token_id}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-1.5 px-3 rounded-full border border-white/20">
          #{nft.token_id}
        </div>
        
        {/* Mint Status Badge */}
        {nft.mint_status && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
            nft.mint_status === 'Confirmed' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : nft.mint_status === 'Pending'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
          }`}>
            {nft.mint_status}
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4 flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{nft.name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{nft.description || 'Unique digital collectible with verified authenticity'}</p>
        </div>
        
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {nft.attributes.slice(0, 4).map((attr, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{attr.trait_type}</span>
                  <p className="text-white text-sm font-semibold mt-0.5 truncate">{attr.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Transaction Details */}
        {nft.transaction_hash && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-slate-400 mb-1">Transaction Hash</div>
            <div className="text-xs text-white font-mono break-all">
              {nft.transaction_hash.slice(0, 10)}...{nft.transaction_hash.slice(-8)}
            </div>
            {nft.block_number && (
              <div className="text-xs text-slate-400 mt-1">
                Block: {nft.block_number} | Gas: {nft.gas_used?.toLocaleString()}
              </div>
            )}
          </div>
        )}
        
        {/* Mint Date */}
        {nft.minted_at && (
          <div className="mb-4 text-xs text-slate-400">
            Minted: {new Date(nft.minted_at).toLocaleDateString()}
          </div>
        )}
        
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95">
            View on Explorer
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300">
            Share
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Loading Skeleton for NFT Cards
const NFTCardSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
      <div className="bg-slate-800 aspect-square"></div>
      <div className="p-5">
        <div className="h-6 bg-slate-700 rounded mb-2"></div>
        <div className="h-4 bg-slate-700 rounded mb-4"></div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="h-12 bg-slate-700 rounded"></div>
          <div className="h-12 bg-slate-700 rounded"></div>
        </div>
        <div className="h-12 bg-slate-700 rounded"></div>
      </div>
    </div>
  );
};

const MyNFTsPage = () => {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState<NFTResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalNFTs: 0,
    confirmedNFTs: 0,
    pendingNFTs: 0
  });

  const fetchMyNFTs = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch NFTs for the connected wallet
      const result = await apiClient.getUserNFTs(address, 0, 100);
      setNfts(result.data);
      
      // Calculate stats
      const confirmed = result.data.filter(nft => nft.mint_status === 'Confirmed').length;
      const pending = result.data.filter(nft => nft.mint_status === 'Pending').length;
      
      setStats({
        totalNFTs: result.data.length,
        confirmedNFTs: confirmed,
        pendingNFTs: pending
      });
    } catch (err) {
      console.error('Error fetching my NFTs:', err);
      setError('Failed to load your NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchMyNFTs();
    }
  }, [isConnected, address]);

  // If not connected, show connect wallet screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                My NFT Collection
              </h1>
              <p className="text-slate-400 text-lg">Connect your wallet to view your minted NFTs</p>
            </div>
            <div className="flex-shrink-0">
              <ConnectButton />
            </div>
          </div>
          
          {/* Connect Wallet CTA */}
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-slate-400 mb-8">
                To view your NFT collection, please connect your wallet first.
              </p>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                My NFT Collection
              </h1>
              <p className="text-slate-400 text-lg">
                Your personal collection of minted digital assets
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/mint">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  Mint New NFT
                </button>
              </Link>
            </div>
          </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalNFTs}</div>
            <div className="text-slate-400">Total NFTs</div>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6">
            <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.confirmedNFTs}</div>
            <div className="text-emerald-300">Confirmed</div>
          </div>
          <div className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-6">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pendingNFTs}</div>
            <div className="text-yellow-300">Pending</div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {[...Array(8)].map((_, idx) => (
              <NFTCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-400 text-2xl">⚠</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
              <p className="text-slate-400 mb-6">{error}</p>
              <button 
                onClick={fetchMyNFTs}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && nfts.length === 0 && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎨</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No NFTs Yet</h2>
              <p className="text-slate-400 mb-8">
                You haven't minted any NFTs yet. Start your collection by minting your first NFT!
              </p>
              <Link href="/mint">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                  Mint Your First NFT
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* NFT Grid */}
        {!loading && !error && nfts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
            {nfts.map((nft) => (
              <MyNFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyNFTsPage; 