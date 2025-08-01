'use client'
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { debounce } from '../lib/utils';

interface SearchFiltersProps {
  onSearch: (params: {
    query?: string;
    rarity?: string;
    collection?: string;
    owner?: string;
  }) => void;
  collections?: Array<{ id: string; name: string }>;
  loading?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  collections = [],
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    rarity: '',
    collection: '',
    owner: ''
  });

  const rarityOptions = [
    { value: '', label: 'All Rarities' },
    { value: 'Legendary', label: 'Legendary' },
    { value: 'Epic', label: 'Epic' },
    { value: 'Rare', label: 'Rare' },
    { value: 'Common', label: 'Common' }
  ];

  // Debounced search function
  const debouncedSearch = debounce((params: typeof searchParams) => {
    onSearch(params);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchParams);
  }, [searchParams]);

  const handleInputChange = (field: keyof typeof searchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      rarity: '',
      collection: '',
      owner: ''
    });
  };

  const hasActiveFilters = Object.values(searchParams).some(value => value !== '');

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search NFTs by name, description, or token ID..."
            value={searchParams.query}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </motion.button>

        {hasActiveFilters && (
          <motion.button
            onClick={clearFilters}
            className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 font-medium py-3 px-4 rounded-xl transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <X className="w-4 h-4" />
            Clear
          </motion.button>
        )}
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {/* Rarity Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rarity
                </label>
                <select
                  value={searchParams.rarity}
                  onChange={(e) => handleInputChange('rarity', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {rarityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Collection
                </label>
                <select
                  value={searchParams.collection}
                  onChange={(e) => handleInputChange('collection', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">All Collections</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.name}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Owner Address
                </label>
                <input
                  type="text"
                  placeholder="Enter wallet address..."
                  value={searchParams.owner}
                  onChange={(e) => handleInputChange('owner', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <motion.div
                className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-sm text-slate-400">Active filters:</span>
                {Object.entries(searchParams).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <motion.span
                      key={key}
                      className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {key}: {value}
                      <button
                        onClick={() => handleInputChange(key as keyof typeof searchParams, '')}
                        className="ml-1 hover:text-purple-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <motion.div
          className="flex items-center justify-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-slate-400">Searching...</span>
        </motion.div>
      )}
    </div>
  );
};

export default SearchFilters; 