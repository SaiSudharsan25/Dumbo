import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StockCard } from '../components/StockCard';
import { useAuth } from '../hooks/useAuth';
import { StockApiService } from '../services/stockApi';
import { Stock } from '../types';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

interface ScreenerFilters {
  minPrice: number;
  maxPrice: number;
  minChange: number;
  maxChange: number;
  minVolume: number;
  sector: string;
}

const SECTORS = ['ALL', 'TECHNOLOGY', 'HEALTHCARE', 'FINANCIAL', 'ENERGY', 'CONSUMER', 'INDUSTRIAL'];

export const StockScreener: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>({
    minPrice: 0,
    maxPrice: 1000,
    minChange: -100,
    maxChange: 100,
    minVolume: 0,
    sector: 'ALL'
  });

  const { user } = useAuth();
  const navigate = useNavigate();
  const stockApi = StockApiService.getInstance();

  useEffect(() => {
    loadStocks();
  }, [user?.country]);

  useEffect(() => {
    applyFilters();
  }, [stocks, filters]);

  const loadStocks = async () => {
    if (!user?.country) return;

    try {
      setLoading(true);
      const stockData = await stockApi.getStocksByCountry(user.country);
      setStocks(stockData);
    } catch (error) {
      console.error('Error loading stocks:', error);
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = stocks.filter(stock => {
      return (
        stock.price >= filters.minPrice &&
        stock.price <= filters.maxPrice &&
        stock.changePercent >= filters.minChange &&
        stock.changePercent <= filters.maxChange &&
        stock.volume >= filters.minVolume &&
        (filters.sector === 'ALL' || stock.sector?.toUpperCase().includes(filters.sector))
      );
    });

    setFilteredStocks(filtered);
  };

  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 1000,
      minChange: -100,
      maxChange: 100,
      minVolume: 0,
      sector: 'ALL'
    });
  };

  const getTopGainers = () => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  };

  const getTopLosers = () => {
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  };

  const getMostActive = () => {
    return [...stocks].sort((a, b) => b.volume - a.volume).slice(0, 5);
  };

  const handleStockClick = (stock: Stock) => {
    navigate(`/stock/${stock.symbol}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="light" />
          <p className="text-gray-400 mt-4">Loading stock screener...</p>
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
                className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-4 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Search className="text-black" size={28} />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Stock Screener</h1>
                <p className="text-gray-400">Find stocks that match your criteria</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <Filter size={20} />
              Filters
            </Button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/5 rounded-2xl p-6 mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Change % Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min %"
                        value={filters.minChange}
                        onChange={(e) => setFilters({...filters, minChange: Number(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max %"
                        value={filters.maxChange}
                        onChange={(e) => setFilters({...filters, maxChange: Number(e.target.value)})}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sector</label>
                    <select
                      value={filters.sector}
                      onChange={(e) => setFilters({...filters, sector: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      {SECTORS.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button onClick={resetFilters} variant="ghost">
                    Reset Filters
                  </Button>
                  <Button onClick={() => setShowFilters(false)}>
                    Apply Filters ({filteredStocks.length} results)
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Total Stocks</p>
              <p className="text-2xl font-bold text-white">{filteredStocks.length}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Avg Price</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(
                  filteredStocks.reduce((sum, stock) => sum + stock.price, 0) / filteredStocks.length || 0,
                  user?.country || 'US'
                )}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Gainers</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredStocks.filter(stock => stock.changePercent > 0).length}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Losers</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredStocks.filter(stock => stock.changePercent < 0).length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Top Gainers */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" size={24} />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {getTopGainers().map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleStockClick(stock)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-bold text-white">{stock.symbol}</p>
                    <p className="text-gray-400 text-sm">{formatCurrency(stock.price, user?.country || 'US')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">+{stock.changePercent.toFixed(2)}%</p>
                    <p className="text-gray-400 text-sm">#{index + 1}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="text-red-400" size={24} />
              Top Losers
            </h3>
            <div className="space-y-3">
              {getTopLosers().map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleStockClick(stock)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-bold text-white">{stock.symbol}</p>
                    <p className="text-gray-400 text-sm">{formatCurrency(stock.price, user?.country || 'US')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold">{stock.changePercent.toFixed(2)}%</p>
                    <p className="text-gray-400 text-sm">#{index + 1}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Most Active */}
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="text-blue-400" size={24} />
              Most Active
            </h3>
            <div className="space-y-3">
              {getMostActive().map((stock, index) => (
                <motion.div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleStockClick(stock)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-bold text-white">{stock.symbol}</p>
                    <p className="text-gray-400 text-sm">{formatCurrency(stock.price, user?.country || 'US')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-bold">{(stock.volume / 1000000).toFixed(1)}M</p>
                    <p className="text-gray-400 text-sm">#{index + 1}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtered Results */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">
            Screener Results ({filteredStocks.length} stocks)
          </h3>
          
          {filteredStocks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Search className="mx-auto text-gray-500 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-white mb-2">No Stocks Found</h2>
              <p className="text-gray-400">Try adjusting your filters to see more results</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredStocks.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StockCard
                      stock={stock}
                      onClick={() => handleStockClick(stock)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};