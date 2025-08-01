'use client'
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@repo/web3';
import { apiClient, NFTResponse } from '../../lib/api-client';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import { NFTDetailsModal } from '../../components/NFTCard';

// Helper function to get safe image URL
const getSafeImageUrl = (imageUrl: string | null): string => {
  if (!imageUrl) return 'https://picsum.photos/400/400?random=999';
  
  // Return the original image URL - don't modify it
  return imageUrl;
};

// NFT Card Component
const NFTCard = ({ nft, onMint }: { nft: NFTResponse; onMint: (id: string) => void }) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 h-full flex flex-col">
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
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-1.5 px-3 rounded-full border border-white/20 max-w-[80px] truncate">
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
        
        <button 
          onClick={() => onMint(nft.id)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 mt-auto"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// Loading Skeleton for NFT Cards
const NFTCardSkeleton = () => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 animate-pulse">
      <div className="bg-slate-800 aspect-square"></div>
      <div className="p-5">
        <div className="h-5 bg-slate-700 rounded-lg w-3/4 mb-3"></div>
        <div className="h-4 bg-slate-700 rounded-lg w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded-lg w-2/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-slate-700 rounded-lg h-12"></div>
          ))}
        </div>
        <div className="h-12 bg-slate-700 rounded-xl"></div>
      </div>
    </div>
  );
};

// Main NFT Gallery Component
const NFTGallery = () => {
  const [nfts, setNfts] = useState<NFTResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFTResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address, isConnected } = useAccount();

  // Function to handle NFT interaction
  const handleNFTInteraction = async (nftId: string) => {
    const nft = nfts.find(n => n.id === nftId);
    if (nft) {
      setSelectedNFT(nft);
      setIsModalOpen(true);
    }
  };

  // Function to fetch NFTs from API
  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.getNFTs(page - 1, 20);
      
      if (page === 1) {
        setNfts(result.data);
      } else {
        setNfts(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.data.length === 20);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch collection stats
  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      // Use a sample collection ID for demo
      const collectionId = '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e';
      const data = await apiClient.getCollectionMetrics(collectionId);
      setStats(data.collections?.[0] || null);
    } catch (err: any) {
      setStatsError(err.message || 'Error fetching stats');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Display loading state on initial load
  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 container mx-auto px-6 py-12">
          {/* Header with wallet button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
            <div className="mb-8 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                Loading Collection
              </h1>
            </div>
            <div className="flex-shrink-0">
              <ConnectButton /> 
            </div>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-6 animate-pulse">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, idx) => (
              <NFTCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md w-full mx-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main gallery display
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
              NFT Gallery
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Discover extraordinary digital art pieces crafted by visionary artists from around the world
            </p>
          </div>
        
        {/* Connection Status Banner */}
        {isConnected && address && (
          <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 font-medium">
                Wallet Connected - Ready to explore NFTs!
              </span>
            </div>
          </div>
        )}
        
        {/* Collection Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {statsLoading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center animate-pulse">
                <div className="text-2xl mb-2">⏳</div>
                <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">Loading...</h3>
                <p className="text-white text-2xl font-bold">--</p>
              </div>
            ))
          ) : statsError ? (
            <div className="col-span-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-2">⚠️</div>
              <h3 className="text-red-400 text-sm font-medium uppercase tracking-wide mb-1">Error</h3>
              <p className="text-white text-2xl font-bold">{statsError}</p>
            </div>
          ) : stats ? ([
            { label: 'Total Items', value: stats.tokenCount || '--', icon: '🎨' },
            { label: 'Unique Owners', value: stats.ownerCount || '--', icon: '👥' },
            { label: 'Floor Price', value: stats.floorAskPrice ? `${stats.floorAskPrice} ETH` : '--', icon: '💎' },
            { label: 'Total Volume', value: stats.volume?.allTime ? `${stats.volume.allTime} ETH` : '--', icon: '📈' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">{stat.label}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))) : null}
        </div>
        
        {nfts.length === 0 && !loading ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-slate-500 text-3xl">🎨</span>
            </div>
            <p className="text-slate-400 text-xl">No NFTs found in this collection</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
              {nfts.map((nft) => (
                <NFTCard 
                  key={nft.id}
                  nft={nft} 
                  onMint={handleNFTInteraction} 
                />
              ))}
              
              {loading && page > 1 && (
                <>
                  {[...Array(4)].map((_, idx) => (
                    <NFTCardSkeleton key={`loading-${idx}`} />
                  ))}
                </>
              )}
            </div>
            
            {hasMore && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  ) : (
                    'Discover More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
      
      {/* NFT Details Modal */}
      <NFTDetailsModal
        nft={selectedNFT}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNFT(null);
        }}
      />
    </div>
  );
};

export default NFTGallery;