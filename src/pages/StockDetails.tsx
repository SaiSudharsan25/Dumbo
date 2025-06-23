import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Brain, ShoppingCart, ExternalLink, DollarSign, RefreshCw, Star, Zap, Play } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BuyStockModal } from '../components/BuyStockModal';
import { RealTradingModal } from '../components/RealTradingModal';
import { AIChat } from '../components/AIChat';
import { StockDetails, AIAnalysis } from '../types';
import { StockApiService } from '../services/stockApi';
import { DeepSeekApiService } from '../services/deepseekApi';
import { usePortfolio } from '../hooks/usePortfolio';
import { useBrokerage } from '../hooks/useBrokerage';
import { useWatchlist } from '../hooks/useWatchlist';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TIME_PERIODS = ['1H', '1D', '1W', '1M', '6M', '1Y'];

export const StockDetailsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockDetails | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRealTradingModal, setShowRealTradingModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  const { addStock } = usePortfolio();
  const { accounts } = useBrokerage();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const { user } = useAuth();
  const stockApi = StockApiService.getInstance();
  const deepseekApi = DeepSeekApiService.getInstance();

  const inWatchlist = symbol ? isInWatchlist(symbol) : false;

  useEffect(() => {
    if (symbol) {
      loadStockData();
    }
  }, [symbol]);

  useEffect(() => {
    if (stock) {
      loadAIAnalysis();
    }
  }, [stock]);

  useEffect(() => {
    if (symbol) {
      loadChartData();
    }
  }, [symbol, selectedPeriod]);

  const loadStockData = async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      const stockData = await stockApi.getStockDetails(symbol);
      setStock(stockData);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error loading stock data:', error);
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const loadAIAnalysis = async () => {
    if (!stock) return;
    
    try {
      setAiLoading(true);
      const analysis = await deepseekApi.analyzeStock(stock);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      toast.error('Failed to load AI analysis');
    } finally {
      setAiLoading(false);
    }
  };

  const loadChartData = async () => {
    if (!symbol) return;
    
    try {
      const { labels, data } = await stockApi.getStockChart(symbol, selectedPeriod);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Price',
            data,
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          }
        ]
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const handleBuyStock = async (quantity: number) => {
    if (!stock || !user) return;
    
    try {
      await addStock({
        symbol: stock.symbol,
        name: stock.name,
        buyPrice: stock.price,
        currentPrice: stock.price,
        quantity,
        buyDate: new Date(),
        gainLoss: 0,
        gainLossPercent: 0
      });
      
      toast.success(`Added ${quantity} share${quantity !== 1 ? 's' : ''} of ${stock.symbol} to simulation portfolio!`);
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      toast.error('Failed to add stock to portfolio');
      throw error;
    }
  };

  const handleWatchlistToggle = async () => {
    if (!stock || !symbol) return;
    
    try {
      if (inWatchlist) {
        await removeFromWatchlist(symbol);
        toast.success(`Removed ${symbol} from watchlist`);
      } else {
        await addToWatchlist(symbol, stock.name);
        toast.success(`Added ${symbol} to watchlist`);
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };

  const handleNewsClick = (url: string) => {
    // Check if it's a real URL or a placeholder
    if (url.includes('example-news.com') || url.includes('finance-news.com')) {
      // For demo URLs, search for the news title on Google News
      const searchQuery = encodeURIComponent(stock?.name || symbol || 'stock news');
      window.open(`https://news.google.com/search?q=${searchQuery}`, '_blank', 'noopener,noreferrer');
    } else {
      // For real URLs, open directly
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRefresh = async () => {
    await loadStockData();
    toast.success('Stock data refreshed!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <LoadingSpinner size="lg" color="dark" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading stock details...</p>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Stock not found</p>
          <Button onClick={() => navigate('/home')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isPositive = stock.changePercent >= 0;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#F59E0B',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            return `Price: ${formatCurrency(value, user?.country || 'US')}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500">
      {/* Header */}
      <motion.div 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => navigate('/home')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </motion.button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h1>
                <p className="text-gray-600 dark:text-gray-400">{stock.name}</p>
              </div>
            </div>
            
            {/* Real-time indicator and controls */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
                </div>
                <p className="text-xs text-gray-400">
                  Updated: {lastUpdateTime.toLocaleTimeString()}
                </p>
              </div>
              
              {/* Watchlist Button */}
              <motion.button
                onClick={handleWatchlistToggle}
                className={`p-2 rounded-xl transition-colors ${
                  inWatchlist 
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Star size={20} className={inWatchlist ? 'fill-current' : ''} />
              </motion.button>
              
              <motion.button
                onClick={handleRefresh}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} className="text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24">
        {/* Price Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stock.price, user?.country || 'US')}
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">per share</span>
              </p>
              <motion.div 
                className={`flex items-center gap-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: isPositive ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </motion.div>
                <span className="font-medium">
                  {isPositive ? '+' : ''}{formatCurrency(stock.change, user?.country || 'US')} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </motion.div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowAIChat(true)}
                  className="min-w-[120px]"
                >
                  <Brain size={20} />
                  AI Chat
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setShowBuyModal(true)}
                  className="min-w-[120px] bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/30 text-blue-400"
                >
                  <Play size={20} />
                  Simulate
                </Button>
              </motion.div>
              
              {/* Real Trading Button - Enhanced */}
              {accounts.length > 0 ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => setShowRealTradingModal(true)}
                    className="min-w-[140px] bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold shadow-lg relative overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="relative z-10 flex items-center gap-2">
                      <Zap size={20} />
                      <span>Buy Real</span>
                    </div>
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate('/portfolio')}
                    className="min-w-[140px] bg-blue-600/20 hover:bg-blue-600/30 border-blue-600/30 text-blue-400"
                  >
                    <DollarSign size={20} />
                    Connect Broker
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Connected Accounts Info */}
          {accounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-wrap gap-3"
            >
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{account.provider}</span>
                  <span className="text-xs opacity-75">
                    {formatCurrency(account.balance, user?.country || 'US')} available
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Chart */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
              {TIME_PERIODS.map((period) => (
                <motion.button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedPeriod === period
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {period}
                </motion.button>
              ))}
            </div>
            
            {chartData && (
              <div className="h-64 sm:h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Stock Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Open', value: formatCurrency(stock.open, user?.country || 'US') },
              { label: 'High', value: formatCurrency(stock.high, user?.country || 'US') },
              { label: 'Low', value: formatCurrency(stock.low, user?.country || 'US') },
              { label: 'Volume', value: `${(stock.volume / 1000000).toFixed(1)}M` }
            ].map((item, index) => (
              <motion.div 
                key={item.label}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{item.label}</p>
                <p className="font-bold text-gray-900 dark:text-white">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <motion.div 
              className="bg-purple-100 dark:bg-purple-900 rounded-xl p-3"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="text-purple-600 dark:text-purple-400" size={24} />
            </motion.div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">DeepSeek AI Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">AI-powered stock insights</p>
            </div>
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <LoadingSpinner size="md" color="dark" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing with DeepSeek AI...</span>
              </div>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-4 sm:space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
              >
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.summary}</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Recommendation',
                    value: aiAnalysis.recommendation,
                    color: aiAnalysis.recommendation === 'BUY' ? 'green' : 
                           aiAnalysis.recommendation === 'SELL' ? 'red' : 'yellow'
                  },
                  {
                    label: 'Risk Level',
                    value: aiAnalysis.riskLevel,
                    color: aiAnalysis.riskLevel === 'LOW' ? 'green' : 
                           aiAnalysis.riskLevel === 'HIGH' ? 'red' : 'yellow'
                  },
                  {
                    label: 'Est. Return',
                    value: `${aiAnalysis.estimatedReturn >= 0 ? '+' : ''}${aiAnalysis.estimatedReturn.toFixed(1)}%`,
                    color: aiAnalysis.estimatedReturn >= 0 ? 'green' : 'red'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    className={`p-4 rounded-xl border ${
                      item.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                      item.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.label}</p>
                    <p className={`font-bold text-lg ${
                      item.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      item.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">AI Reasoning</p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{aiAnalysis.reasoning}</p>
              </motion.div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 dark:text-gray-400">AI analysis unavailable</p>
            </div>
          )}
        </motion.div>

        {/* News */}
        {stock.news && stock.news.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Latest News</h2>
            <div className="space-y-4 sm:space-y-6">
              {stock.news.map((news, index) => (
                <motion.div 
                  key={index} 
                  className="border-l-4 border-yellow-500 pl-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-r-lg transition-colors"
                  onClick={() => handleNewsClick(news.url)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 leading-relaxed">{news.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{news.source}</span>
                        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                        {news.url.includes('example-news.com') || news.url.includes('finance-news.com') ? (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                            Search on Google News
                          </span>
                        ) : (
                          <span className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                            Real News
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
                    >
                      <ExternalLink size={16} className="text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Chat Component */}
      {stock && (
        <AIChat
          stock={stock}
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
        />
      )}

      {/* Modals */}
      <BuyStockModal
        stock={stock}
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onBuy={handleBuyStock}
      />

      <RealTradingModal
        stock={stock}
        isOpen={showRealTradingModal}
        onClose={() => setShowRealTradingModal(false)}
      />
    </div>
  );
};