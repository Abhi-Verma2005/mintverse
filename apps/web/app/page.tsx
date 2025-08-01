'use client'
import { ConnectButton } from '@repo/web3';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Navigation from '../components/Navigation';

const NFTLandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalMinted: 0,
    activeUsers: 0,
    totalVolume: 0
  });

  // Wagmi hooks for wallet management
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Animation trigger on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Animate stats counter
    const animateStats = () => {
      const targets = { totalMinted: 1247, activeUsers: 892, totalVolume: 45.7 };
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        setStats({
          totalMinted: Math.floor(targets.totalMinted * easeOut),
          activeUsers: Math.floor(targets.activeUsers * easeOut),
          totalVolume: Number((targets.totalVolume * easeOut).toFixed(1))
        });
        
        if (step >= steps) clearInterval(timer);
      }, increment);
    };
    
    setTimeout(animateStats, 500);
  }, []);

  // Slide carousel for featured NFTs
  const featuredNFTs = [
    { id: 1, name: "Ethereal Dreams #001", image: "https://picsum.photos/400/400?random=1" },
    { id: 2, name: "Cosmic Voyage #047", image: "https://picsum.photos/400/400?random=2" },
    { id: 3, name: "Digital Genesis #123", image: "https://picsum.photos/400/400?random=3" },
    { id: 4, name: "Neon Shadows #089", image: "https://picsum.photos/400/400?random=4" }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNFTs.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, []);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Wallet connection handler
  const handleConnect = () => {
    if (isConnected) return;
    const injectedConnector = connectors.find(connector => connector.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  // Wallet component
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="relative z-10">
        {/* Navigation */}
        <Navigation />

        {/* Hero Section */}
        <section id='hero' className="container mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                  🚀 Limited Collection - Only 10,000 NFTs
                </span>
              </div>
              
              <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6 leading-tight">
                Mint Your
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Digital Dreams
                </span>
              </h1>
              
              <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
                Join an exclusive community of digital art collectors. Each NFT is uniquely crafted with rare traits and stunning visual appeal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                {isConnected && <Link href="/mint">
                  <button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  Start Minting
                </button>
                </Link>}
                <Link href="/nfts">
                  <button onClick={() => scrollToSection('gallery')} className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300">
                  View Gallery
                </button>
                </Link>
                {isConnected && <Link href="/my-nfts">
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/25">
                  My NFTs
                  </button>
                </Link>}
                
              </div>
              
              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalMinted.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Minted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stats.activeUsers.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stats.totalVolume} ETH</div>
                  <div className="text-slate-400 text-sm">Volume</div>
                </div>
              </div>
            </div>
            
            {/* Featured NFT Carousel */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative">
                <div className="relative w-full max-w-md mx-auto">
                  {/* Main NFT Display */}
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10">
                    <img 
                    //@ts-expect-error: no need here
                      src={featuredNFTs[currentSlide].image}
                      //@ts-expect-error: no need here
                      alt={featuredNFTs[currentSlide].name}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      {/* @ts-expect-error: no need here */}
                      <h3 className="text-white font-semibold text-xl mb-2">{featuredNFTs[currentSlide].name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Current Price</span>
                        <span className="text-purple-400 font-bold">0.1 ETH</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Carousel Indicators */}
                  <div className="flex justify-center mt-6 gap-2">
                    {featuredNFTs.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 w-8' 
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center animate-bounce">
                  <span className="text-2xl">✨</span>
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm border border-white/10 flex items-center justify-center animate-pulse">
                  <span className="text-lg">🎨</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="about" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Why Choose Ethereal Dreams?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience the future of digital collectibles with cutting-edge technology and exclusive benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Unique Artwork",
                description: "Every NFT is procedurally generated with over 200+ possible trait combinations"
              },
              {
                icon: "🔐",
                title: "Verified Authenticity",
                description: "Built on Ethereum with smart contracts ensuring permanent ownership and provenance"
              },
              {
                icon: "🌟",
                title: "Exclusive Benefits",
                description: "Holders get access to private Discord, future drops, and special community events"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Minting Section */}
        <section id="mint" className="container mx-auto px-6 py-20">
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Mint?</h2>
            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
              Join thousands of collectors who have already secured their digital dreams. Limited supply, unlimited possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4">
                <span className="text-slate-400 text-sm">Mint Price</span>
                <div className="text-2xl font-bold text-white">0.1 ETH</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4">
                <span className="text-slate-400 text-sm">Remaining</span>
                <div className="text-2xl font-bold text-purple-400">8,753 / 10,000</div>
              </div>
              {isConnected && (
                <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl px-6 py-4">
                  <span className="text-emerald-400 text-sm">Wallet Connected</span>
                  <div className="text-lg font-bold text-emerald-300">✓ Ready to Mint</div>
                </div>
              )}
            </div>
            
            {isConnected ? (
              <Link href="/mint">
                <button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                >
                  Mint Your NFT Now
                </button>
              </Link>
            ) : (
              <button 
                onClick={() => scrollToSection('nav')}
                disabled={isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
              >
                {isPending ? 'Connecting...' : 'Connect Wallet to Mint'}
              </button>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-16 border-t border-white/10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-white font-bold text-xl">Ethereal Dreams</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Creating the future of digital art through innovative blockchain technology and stunning visual experiences.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'Discord', 'Instagram'].map((social) => (
                  <button key={social} className="w-10 h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all duration-300">
                    <span className="text-slate-400 text-sm">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button className="hover:text-white transition-colors duration-300">Mint NFT</button></li>
                <li><button onClick={() => scrollToSection('gallery')} className="hover:text-white transition-colors duration-300">Gallery</button></li>
                <li><button className="hover:text-white transition-colors duration-300">FAQ</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button className="hover:text-white transition-colors duration-300">Discord</button></li>
                <li><button className="hover:text-white transition-colors duration-300">Twitter</button></li>
                <li><button className="hover:text-white transition-colors duration-300">Instagram</button></li>
                <li><button className="hover:text-white transition-colors duration-300">Medium</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Ethereal Dreams. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NFTLandingPage;