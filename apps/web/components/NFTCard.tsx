'use client'
import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { NFTResponse } from '../lib/api-client';
import { cn, formatAddress, getRarityColor, getRarityPercentage } from '../lib/utils';
import { Eye, Heart, Share2, ExternalLink, X, Copy, CheckCircle, Clock, Calendar, Hash, Zap, Blocks } from 'lucide-react';

interface NFTCardProps {
  nft: NFTResponse;
  onView?: (nft: NFTResponse) => void;
  onLike?: (nft: NFTResponse) => void;
  onShare?: (nft: NFTResponse) => void;
  className?: string;
  showActions?: boolean;
}

// NFT Details Modal Component
interface NFTDetailsModalProps {
  nft: NFTResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NFTDetailsModal: React.FC<NFTDetailsModalProps> = ({ nft, isOpen, onClose }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const rarity = nft?.attributes?.find(attr => attr.trait_type === 'Rarity')?.value || 'Common';
  const rarityColor = getRarityColor(rarity);
  const rarityPercentage = getRarityPercentage(rarity);

  if (!nft) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left Column - Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                {nft.image ? (
                  <Image
                    src={nft.image}
                    alt={nft.name || 'NFT'}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/600x600/374151/9CA3AF?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">#{nft.token_id}</span>
                    </div>
                  </div>
                )}
                
                {/* Overlay badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {/* Rarity Badge */}
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border",
                    rarityColor
                  )}>
                    {rarity} ({rarityPercentage}%)
                  </div>
                  
                  {/* Mint Status Badge */}
                  {nft.mint_status && (
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      nft.mint_status === 'Confirmed' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : nft.mint_status === 'Pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        {nft.mint_status === 'Confirmed' ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                        {nft.mint_status}
                      </div>
                    </div>
                  )}
                </div>

                {/* Token ID Badge */}
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white text-sm font-medium py-2 px-4 rounded-full border border-white/20">
                  #{nft.token_id}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="p-8 space-y-6">
                {/* Header */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{nft.name}</h1>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    {nft.description || 'Unique digital collectible with verified authenticity'}
                  </p>
                </div>

                {/* Collection Info */}
                {nft.collection_name && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-sm text-slate-400 mb-2">Collection</div>
                    <div className="text-lg font-semibold text-white">{nft.collection_name}</div>
                  </div>
                )}

                {/* Minting Details */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Calendar size={20} />
                    Minting Details
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-sm text-slate-400 mb-1">Minted Date</div>
                      <div className="text-white font-medium">
                        {new Date(nft.minted_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {nft.block_number && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                 <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">
                           <Blocks size={14} />
                           Block Number
                         </div>
                        <div className="text-white font-medium">{nft.block_number.toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {/* Gas Details */}
                  {(nft.gas_used || nft.gas_price) && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                             <div className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                         <Zap size={14} />
                         Gas Information
                       </div>
                      <div className="grid grid-cols-2 gap-4">
                        {nft.gas_used && (
                          <div>
                            <div className="text-xs text-slate-400">Gas Used</div>
                            <div className="text-white font-medium">{nft.gas_used.toLocaleString()}</div>
                          </div>
                        )}
                        {nft.gas_price && (
                          <div>
                            <div className="text-xs text-slate-400">Gas Price</div>
                            <div className="text-white font-medium">{nft.gas_price} Gwei</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Transaction Hash */}
                {nft.transaction_hash && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-sm text-slate-400 mb-2 flex items-center gap-1">
                      <Hash size={14} />
                      Transaction Hash
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-white font-mono text-sm break-all flex-1">
                        {formatAddress(nft.transaction_hash)}
                      </div>
                      <button
                        onClick={() => copyToClipboard(nft.transaction_hash!, 'tx')}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {copiedField === 'tx' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Attributes */}
                {nft.attributes && nft.attributes.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Attributes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {nft.attributes.map((attr, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-1">
                            {attr.trait_type}
                          </div>
                          <div className="text-white font-semibold">{attr.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <ExternalLink size={16} />
                    View on Explorer
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const NFTCard: React.FC<NFTCardProps> = ({
  nft,
  onView,
  onLike,
  onShare,
  className,
  showActions = true
}) => {
  const rarity = nft.attributes?.find(attr => attr.trait_type === 'Rarity')?.value || 'Common';
  const rarityColor = getRarityColor(rarity);
  const rarityPercentage = getRarityPercentage(rarity);

  return (
    <motion.div
      className={cn(
        "group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {nft.image ? (
          <Image 
            src={nft.image} 
            alt={nft.name || 'NFT'}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x400/374151/9CA3AF?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">#{nft.token_id}</span>
            </div>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Token ID Badge */}
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-medium py-1.5 px-3 rounded-full border border-white/20 max-w-[80px] truncate">
          #{nft.token_id}
        </div>
        
        {/* Rarity Badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border",
          rarityColor
        )}>
          {rarity} ({rarityPercentage}%)
        </div>
        
        {/* Mint Status Badge */}
        {nft.mint_status && (
          <div className={`absolute top-3 left-20 px-2 py-1 rounded-full text-xs font-medium ${
            nft.mint_status === 'Confirmed' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : nft.mint_status === 'Pending'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
          }`}>
            {nft.mint_status}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex gap-2">
              {onView && (
                <motion.button
                  onClick={() => onView(nft)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye size={16} />
                </motion.button>
              )}
              {onLike && (
                <motion.button
                  onClick={() => onLike(nft)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart size={16} />
                </motion.button>
              )}
              {onShare && (
                <motion.button
                  onClick={() => onShare(nft)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 size={16} />
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 truncate">{nft.name}</h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
            {nft.description || 'Unique digital collectible with verified authenticity'}
          </p>
        </div>
        
        {/* Collection Info */}
        {nft.collection_name && (
          <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="text-xs text-slate-400 mb-1">Collection</div>
            <div className="text-sm font-medium text-white">{nft.collection_name}</div>
          </div>
        )}
        
        {/* Attributes */}
        {nft.attributes && nft.attributes.length > 0 && (
          <div className="mb-4 space-y-2">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Attributes</div>
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
              {formatAddress(nft.transaction_hash)}
            </div>
            {nft.block_number && (
              <div className="text-xs text-slate-400 mt-1">
                Block: {nft.block_number} | Gas: {nft.gas_used?.toLocaleString()}
              </div>
            )}
          </div>
        )}
        
        {/* Action Button */}
        {onView && (
          <motion.button 
            onClick={() => onView(nft)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ExternalLink size={16} />
            View Details
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default NFTCard; 