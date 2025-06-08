'use client'
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { ConnectButton } from '@repo/web3'

// NFT metadata interface
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  tokenId?: number;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// NFT Card Component
const NFTCard = ({ metadata, tokenId, onMint }: { metadata: NFTMetadata; tokenId: number; onMint: (id: number) => void }) => {
  const displayId = metadata.tokenId !== undefined ? metadata.tokenId : tokenId;
  
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
      <div className="relative aspect-square overflow-hidden">
        {metadata.image ? (
          <img 
            src={metadata.image} 
            alt={metadata.name || `NFT #${displayId}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">#{displayId}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-1.5 px-3 rounded-full border border-white/20">
          #{displayId}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{metadata.name || `NFT #${displayId}`}</h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{metadata.description || 'Unique digital collectible with verified authenticity'}</p>
        </div>
        
        {metadata.attributes && metadata.attributes.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {metadata.attributes.slice(0, 4).map((attr, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-lg p-2.5 border border-white/10">
                  <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{attr.trait_type}</span>
                  <p className="text-white text-sm font-semibold mt-0.5 truncate">{attr.value.toString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button 
          onClick={() => onMint(displayId)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
        >
          Mint NFT
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
  const [nfts, setNfts] = useState<Array<NFTMetadata | null>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingTokenId, setMintingTokenId] = useState<number | null>(null);

  // Wagmi hooks for wallet management
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Wallet connection handler
  const handleConnect = () => {
    const injectedConnector = connectors.find(connector => connector.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Function to handle minting
  const handleMint = async (tokenId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    try {
      setIsMinting(true);
      setMintingTokenId(tokenId);
      
      // Simulate minting transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Successfully minted NFT #${tokenId}!`);
    } catch (err) {
      console.error('Error minting NFT:', err);
      alert('Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
      setMintingTokenId(null);
    }
  };
  
  // Generate dummy NFT data for demonstration
  const generateDummyNFTs = (page: number, count: number): NFTMetadata[] => {
    const startId = (page - 1) * count + 1;
    return Array.from({ length: count }, (_, i) => {
      const id = startId + i;
      const rarities = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
      const styles = ['Abstract', 'Pixel', 'Surreal', 'Minimalist', 'Psychedelic'];
      const colors = ['Vibrant', 'Pastel', 'Monochrome', 'Neon', 'Earth'];
      
      return {
        name: `Ethereal Dreams #${id}`,
        description: `A mesmerizing digital artwork that captures the essence of imagination and creativity. This piece represents the ${id}th creation in our exclusive collection.`,
        image: `https://picsum.photos/500/500?random=${id}`,
        tokenId: id,
        attributes: [
          { trait_type: 'Rarity', value: rarities[id % 5] },
          { trait_type: 'Style', value: styles[id % 5] },
          { trait_type: 'Palette', value: colors[id % 5] },
          { trait_type: 'Power', value: Math.floor(Math.random() * 1000) + 1 },
          { trait_type: 'Edition', value: Math.floor((id - 1) / 100) + 1 },
          { trait_type: 'Rarity Score', value: Math.floor(Math.random() * 100) + 1 }
        ]
      };
    });
  };

  // Function to fetch NFTs
  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dummyData = generateDummyNFTs(page, 20);
      
      if (page === 1) {
        setNfts(dummyData);
      } else {
        setNfts(prev => [...prev, ...dummyData]);
      }
      
      setHasMore(page < 5);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setError('Failed to load NFTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [page]);

  // Wallet Button Component
  const WalletButton = () => {
    if (isConnected && address) {
      return (
        <div className="flex items-center gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2">
            <span className="text-slate-300 text-sm font-medium">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button 
            onClick={() => disconnect()}
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 font-medium py-2.5 px-5 rounded-xl transition-all duration-300"
          >
            Disconnect
          </button>
        </div>
      );
    }
    
    return (
      <button 
        onClick={handleConnect}
        disabled={isPending}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  };
  
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
              {/* <WalletButton /> */}
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
      
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12">
          <div className="mb-8 lg:mb-0">
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
              Ethereal Dreams
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Discover extraordinary digital art pieces crafted by visionary artists from around the world
            </p>
          </div>
          
          <div className="flex-shrink-0">
            {/* <WalletButton /> */}
            <ConnectButton />
          </div>
        </div>
        
        {/* Connection Status Banner */}
        {isConnected && address && (
          <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 font-medium">
                Wallet Connected - Ready to mint NFTs!
              </span>
            </div>
          </div>
        )}
        
        {/* Collection Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Total Items', value: '100', icon: '🎨' },
            { label: 'Unique Owners', value: '75', icon: '👥' },
            { label: 'Floor Price', value: '0.1 ETH', icon: '💎' },
            { label: 'Total Volume', value: '15.7 ETH', icon: '📈' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-1">{stat.label}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {nfts.map((nft, index) => {
                if (!nft) return <NFTCardSkeleton key={index} />;
                return (
                  <NFTCard 
                    key={nft.tokenId || index}
                    metadata={nft} 
                    tokenId={index} 
                    onMint={handleMint} 
                  />
                );
              })}
              
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
        
        {/* Minting overlay */}
        {isMinting && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 max-w-sm w-full mx-6 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Minting in Progress</h3>
              <p className="text-slate-300 mb-2">NFT #{mintingTokenId}</p>
              <p className="text-slate-400 text-sm">Please confirm the transaction in your wallet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTGallery;