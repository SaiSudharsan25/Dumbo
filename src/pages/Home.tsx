import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, User, Sparkles, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StockCard } from '../components/StockCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { BoltBadge } from '../components/BoltBadge';
import { Stock } from '../types';
import { useRealTimeStocks } from '../hooks/useRealTimeStocks';
import { StockApiService } from '../services/stockApi';
import { useAuth } from '../hooks/useAuth';
import { useBrokerage } from '../hooks/useBrokerage';
import toast from 'react-hot-toast';

const FILTER_OPTIONS = ['ALL', 'TRENDING', 'TECH', 'ENERGY', 'FINANCE', 'HEALTHCARE'];

export const Home: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [dataSource, setDataSource] = useState<'alpha_vantage' | 'brokerage'>('alpha_vantage');
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  const { user } = useAuth();
  const { accounts, positions } = useBrokerage();
  const navigate = useNavigate();
  const stockApi = StockApiService.getInstance();

  // Get symbols for real-time updates
  const stockSymbols = stocks.map(stock => stock.symbol);
  const { stocks: realTimeStocks, forceUpdate } = useRealTimeStocks(stockSymbols);

  console.log('🏠 Home component render:', {
    userEmail: user?.email,
    userCountry: user?.country,
    stocksCount: stocks.length,
    loading,
    connectedAccounts: accounts.length,
    dataSource,
    apiStatus
  });

  useEffect(() => {
    if (user?.country) {
      console.log('🚀 User country available, determining data source...');
      
      // Determine data source: brokerage account if connected, otherwise Alpha Vantage
      if (accounts.length > 0 && positions.length > 0) {
        console.log('📊 Using brokerage account data');
        setDataSource('brokerage');
        loadStocksFromBrokerage();
      } else {
        console.log('📈 Using Alpha Vantage API data');
        setDataSource('alpha_vantage');
        loadStocksFromAlphaVantage();
      }
    } else {
      console.log('⚠️ No user country available');
      setLoading(false);
    }
  }, [user?.country, accounts.length, positions.length]);

  useEffect(() => {
    filterStocks();
  }, [stocks, searchQuery, selectedFilter, realTimeStocks]);

  // Update stocks with real-time data
  useEffect(() => {
    if (Object.keys(realTimeStocks).length > 0) {
      const updatedStocks = stocks.map(stock => {
        const realTimeStock = realTimeStocks[stock.symbol];
        return realTimeStock || stock;
      });
      
      // Only update if there are actual changes
      const hasChanges = updatedStocks.some((stock, index) => 
        stock.price !== stocks[index]?.price || 
        stock.changePercent !== stocks[index]?.changePercent
      );
      
      if (hasChanges) {
        setStocks(updatedStocks);
        setLastUpdateTime(new Date());
      }
    }
  }, [realTimeStocks]);

  const loadStocksFromAlphaVantage = async () => {
    if (!user?.country) {
      console.log('❌ Cannot load stocks - no country set');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📈 Loading REAL stocks from Alpha Vantage for country:', user.country);
      setLoading(true);
      setApiStatus('loading');
      
      const stockData = await stockApi.getStocksByCountry(user.country);
      console.log('✅ Real stocks loaded from Alpha Vantage:', stockData.length);
      
      if (stockData.length === 0) {
        throw new Error('No stock data received from Alpha Vantage');
      }
      
      setStocks(stockData);
      setLastUpdateTime(new Date());
      setApiStatus('success');
      toast.success(`✅ Loaded ${stockData.length} real stocks from Alpha Vantage`);
    } catch (error) {
      console.error('❌ Error loading stocks from Alpha Vantage:', error);
      setApiStatus('error');
      toast.error('❌ Failed to load real stock data from Alpha Vantage. Please check your internet connection.');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStocksFromBrokerage = async () => {
    if (positions.length === 0) {
      console.log('❌ No brokerage positions available');
      setLoading(false);
      return;
    }
    
    try {
      console.log('📊 Loading stocks from connected brokerage accounts');
      setLoading(true);
      setApiStatus('loading');
      
      // Convert brokerage positions to stock format
      const brokerageStocks: Stock[] = positions.map(position => ({
        symbol: position.symbol,
        name: position.symbol, // In real implementation, fetch company name
        price: position.currentPrice,
        change: position.unrealizedPnL / position.quantity,
        changePercent: position.unrealizedPnLPercent,
        volume: 0, // Not available from brokerage
        marketCap: undefined,
        sector: 'Technology', // Default sector
        country: user?.country || 'US'
      }));
      
      console.log('✅ Stocks loaded from brokerage:', brokerageStocks.length);
      
      setStocks(brokerageStocks);
      setLastUpdateTime(new Date());
      setApiStatus('success');
      toast.success(`✅ Loaded ${brokerageStocks.length} stocks from connected brokerage accounts`);
    } catch (error) {
      console.error('❌ Error loading stocks from brokerage:', error);
      setApiStatus('error');
      toast.error('❌ Failed to load stocks from brokerage accounts');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user?.country) return;
    
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing stocks from:', dataSource);
      
      if (dataSource === 'brokerage') {
        await loadStocksFromBrokerage();
      } else {
        await loadStocksFromAlphaVantage();
        // Force update real-time data
        await forceUpdate();
      }
      
      setLastUpdateTime(new Date());
      toast.success('✅ Stocks refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing stocks:', error);
      toast.error('❌ Failed to refresh stocks');
    } finally {
      setRefreshing(false);
    }
  };

  const filterStocks = () => {
    let filtered = stocks;

    if (searchQuery) {
      filtered = filtered.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'ALL') {
      filtered = filtered.filter(stock => {
        const sector = stock.sector?.toUpperCase() || '';
        switch (selectedFilter) {
          case 'TECH':
            return sector.includes('TECHNOLOGY') || sector.includes('TECH');
          case 'ENERGY':
            return sector.includes('ENERGY');
          case 'FINANCE':
            return sector.includes('FINANCIAL') || sector.includes('FINANCE');
          case 'HEALTHCARE':
            return sector.includes('HEALTHCARE') || sector.includes('HEALTH');
          case 'TRENDING':
            return Math.abs(stock.changePercent) > 2;
          default:
            return true;
        }
      });
    }

    setFilteredStocks(filtered);
  };

  const handleStockClick = (stock: Stock) => {
    console.log('📊 Navigating to stock details:', stock.symbol);
    navigate(`/stock/${stock.symbol}`);
  };

  if (!user?.country) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Please select a country first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Bolt.new Badge - Only on Homepage */}
      <BoltBadge variant="white" position="bottom-right" />

      {/* Header */}
      <motion.div 
        className="bg-black/80 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex items-center gap-4">
                <Logo size="lg" />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="text-green-400 w-6 h-6" />
                </motion.div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Hey {user?.displayName?.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-gray-400 mt-1">
                    {dataSource === 'brokerage' ? 'Your brokerage portfolio' : 'Real-time market data from Alpha Vantage'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Data source indicator */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
                dataSource === 'brokerage' 
                  ? 'bg-purple-600/20 border-purple-600/30 text-purple-400'
                  : apiStatus === 'success'
                  ? 'bg-green-600/20 border-green-600/30 text-green-400'
                  : apiStatus === 'error'
                  ? 'bg-red-600/20 border-red-600/30 text-red-400'
                  : 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400'
              }`}>
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {dataSource === 'brokerage' ? 'Brokerage' : 
                   apiStatus === 'success' ? 'Alpha Vantage' :
                   apiStatus === 'error' ? 'API Error' : 'Loading...'}
                </span>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Updated: {lastUpdateTime.toLocaleTimeString()}
                </p>
              </div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  loading={refreshing}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <RefreshCw size={18} />
                </Button>
              </motion.div>
              <motion.button
                onClick={() => navigate('/settings')}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={20} className="text-white" />
              </motion.button>
            </div>
          </div>

          {/* API Status Alert */}
          {apiStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-900/30 border border-red-600/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                <div>
                  <p className="text-red-100 font-medium">Unable to fetch real stock data</p>
                  <p className="text-red-200 text-sm">
                    Please check your internet connection and try refreshing. 
                    {dataSource === 'alpha_vantage' && ' Alpha Vantage API may be experiencing issues.'}
                  </p>
                </div>
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white"
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div 
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              whileHover={{ scale: 1.1 }}
            >
              <Search size={20} />
            </motion.div>
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300"
            />
          </motion.div>

          {/* Filter Chips */}
          <motion.div 
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {FILTER_OPTIONS.map((filter, index) => (
              <motion.button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                  selectedFilter === filter
                    ? 'bg-green-600 text-black border-green-500 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {filter}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Stock List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner size="lg" color="light" />
              <motion.p 
                className="text-gray-400 mt-4 text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Loading {dataSource === 'brokerage' ? 'brokerage portfolio' : 'real market data from Alpha Vantage'}...
                <br />
                <span className="text-sm">This may take a few moments for real API data</span>
              </motion.p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
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

              {filteredStocks.length === 0 && !loading && (
                <motion.div 
                  className="col-span-full text-center py-20"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-6xl mb-6"
                  >
                    📊
                  </motion.div>
                  <p className="text-gray-400 text-xl mb-2">
                    {stocks.length === 0 ? 'No stocks available' : 'No stocks found'}
                  </p>
                  <p className="text-gray-500 text-base mb-4">
                    {stocks.length === 0 ? 
                      `Try refreshing or ${dataSource === 'alpha_vantage' ? 'check Alpha Vantage API' : 'connect a brokerage account'}` : 
                      'Try adjusting your search or filter'}
                  </p>
                  {stocks.length === 0 && (
                    <Button onClick={handleRefresh} className="mt-6" loading={refreshing}>
                      <RefreshCw size={20} />
                      Refresh Stocks
                    </Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};