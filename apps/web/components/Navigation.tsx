'use client'
import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@repo/web3';
import { motion } from 'framer-motion';

const Navigation = () => {
  const { isConnected } = useAccount();

  return (
    <nav className="container mx-auto px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-lg">M</span>
            </motion.div>
          </Link>
          <Link href="/">
            <span className="text-white font-bold text-xl cursor-pointer hover:text-purple-300 transition-colors">
              Mintverse
            </span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-slate-300">
          <Link href="/">
            <motion.button 
              className="hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Home
            </motion.button>
          </Link>
          
          <Link href="/nfts">
            <motion.button 
              className="hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Gallery
            </motion.button>
          </Link>
          
          {isConnected && (
            <Link href="/mint">
              <motion.button 
                className="hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mint NFT
              </motion.button>
            </Link>
          )}
          
          {isConnected && (
            <Link href="/my-nfts">
              <motion.button 
                className="hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                My NFTs
              </motion.button>
            </Link>
          )}
          
          <Link href="/admin">
            <motion.button 
              className="hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Admin
            </motion.button>
          </Link>
        </div>
        
        <div className="flex-shrink-0">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 