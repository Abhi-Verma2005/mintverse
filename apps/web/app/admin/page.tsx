'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@repo/web3';
import { apiClient, AdminStats, AnalyticsData } from '../../lib/api-client';
import Navigation from '../../components/Navigation';
import { formatNumber, formatPrice } from '../../lib/utils';
import { 
  Users, 
  Image, 
  FolderOpen, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, analyticsData] = await Promise.all([
          apiClient.getAdminStats(),
          apiClient.getAdminAnalytics()
        ]);
        setStats(statsData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md w-full mx-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-pink-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent" />
      
      <div className="relative z-10">
        <Navigation />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-400">
              Platform analytics and management
            </p>
          </div>

        {/* Stats Cards */}
        {stats && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total Users</h3>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.total_users)}</p>
              <p className="text-xs text-emerald-400 mt-2">+12% from last month</p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-pink-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Total NFTs</h3>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.total_nfts)}</p>
              <p className="text-xs text-emerald-400 mt-2">+8% from last month</p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Collections</h3>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.total_collections)}</p>
              <p className="text-xs text-emerald-400 mt-2">+15% from last month</p>
            </motion.div>

            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Transactions</h3>
              <p className="text-2xl font-bold text-white">{formatNumber(stats.total_transactions)}</p>
              <p className="text-xs text-emerald-400 mt-2">+23% from last month</p>
            </motion.div>
          </motion.div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Minting Trends */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Minting Trends</h3>
              <BarChart3 className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.minting_trends.slice(-7) || []}>
                <defs>
                  <linearGradient id="colorMints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorMints)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Popular Collections */}
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Popular Collections</h3>
              <PieChart className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.popular_collections.slice(0, 5) || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} angle={-45} textAnchor="end" />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="nft_count" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* User Engagement */}
        {stats && (
          <motion.div 
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Engagement</h3>
              <Target className="w-5 h-5 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.user_engagement.active_users_24h)}</p>
                <p className="text-sm text-slate-400">Active (24h)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.user_engagement.active_users_7d)}</p>
                <p className="text-sm text-slate-400">Active (7d)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.user_engagement.new_users_24h)}</p>
                <p className="text-sm text-slate-400">New (24h)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.user_engagement.new_users_7d)}</p>
                <p className="text-sm text-slate-400">New (7d)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div 
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
              Manage Users
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
              Manage NFTs
            </button>
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
              View Analytics
            </button>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 