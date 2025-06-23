import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Search, TrendingUp, TrendingDown, X, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StockCard } from '../components/StockCard';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist';
import { StockApiService } from '../services/stockApi';
import { Stock } from '../types';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

export const Watchlist: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { user } = useAuth();
  const { watchlist, loading, addToWatchlist, removeFromWatchlist, refresh } = useWatchlist();
  const navigate = useNavigate();
  const stockApi = StockApiService.getInstance();

  const handleSearch = async (query: string) => {
    if (!query.trim() || !user?.country) return;
    
    setSearching(true);
    try {
      const results = await stockApi.searchStocks(query, user.country);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search stocks');
    } finally {
      setSearching(false);
    }
  };

  const handleAddStock = async (stock: Stock) => {
    try {
      await addToWatchlist(stock.symbol, stock.name);
      setShowAddModal(false);
      setSearchQuery('');
      setSearchResults([]);
      toast.success(`Added ${stock.symbol} to watchlist!`);
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  const handleRemoveStock = async (symbol: string) => {
    try {
      await removeFromWatchlist(symbol);
      toast.success(`Removed ${symbol} from watchlist!`);
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const handleStockClick = (stock: Stock) => {
    navigate(`/stock/${stock.symbol}`);
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.length > 1) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="light" />
          <p className="text-gray-400 mt-4">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.div 
        className="bg-black/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div 
                className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Star className="text-black" size={28} />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Watchlist</h1>
                <p className="text-gray-400">Track your favorite stocks</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-500 text-black font-bold"
            >
              <Plus size={20} />
              Add Stock
            </Button>
          </div>

          {/* Quick Stats */}
          {watchlist.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Total Stocks</p>
                <p className="text-2xl font-bold text-white">{watchlist.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Gainers</p>
                <p className="text-2xl font-bold text-green-400">
                  {watchlist.filter(stock => stock.changePercent > 0).length}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Losers</p>
                <p className="text-2xl font-bold text-red-400">
                  {watchlist.filter(stock => stock.changePercent < 0).length}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Avg Change</p>
                <p className={`text-2xl font-bold ${
                  watchlist.reduce((sum, stock) => sum + stock.changePercent, 0) / watchlist.length >= 0 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {((watchlist.reduce((sum, stock) => sum + stock.changePercent, 0) / watchlist.length) || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {watchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="bg-white/5 rounded-full p-12 w-48 h-48 mx-auto mb-8 flex items-center justify-center"
            >
              <Star className="text-gray-500" size={64} />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Start Building Your Watchlist</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
              Add stocks you're interested in to track their performance and get real-time updates
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              size="lg"
              className="bg-green-600 hover:bg-green-500 text-black font-bold"
            >
              <Plus size={20} />
              Add Your First Stock
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {watchlist.map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -300 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <StockCard
                    stock={stock}
                    onClick={() => handleStockClick(stock)}
                  />
                  
                  {/* Remove button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStock(stock.symbol);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-600/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={16} className="text-red-400" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add to Watchlist</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search stocks by symbol or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>

              {/* Search Results */}
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" color="light" />
                  <span className="ml-3 text-gray-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((stock) => (
                    <motion.div
                      key={stock.symbol}
                      className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleAddStock(stock)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                            <BarChart3 className="text-gray-400" size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{stock.symbol}</h3>
                            <p className="text-gray-400 text-sm">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">
                            {formatCurrency(stock.price, user?.country || 'US')}
                          </p>
                          <div className={`flex items-center gap-1 ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span className="text-sm">
                              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : searchQuery.length > 1 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No stocks found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Start typing to search for stocks</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};