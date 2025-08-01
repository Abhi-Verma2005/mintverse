'use client'
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NFTResponse } from '../lib/api-client';
import { cn, formatAddress, getRarityColor, getRarityPercentage } from '../lib/utils';
import { Eye, Heart, Share2, ExternalLink } from 'lucide-react';

interface NFTCardProps {
  nft: NFTResponse;
  onView?: (nft: NFTResponse) => void;
  onLike?: (nft: NFTResponse) => void;
  onShare?: (nft: NFTResponse) => void;
  className?: string;
  showActions?: boolean;
}

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