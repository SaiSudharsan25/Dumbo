import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ExternalLink, TrendingUp, Clock, Filter, RefreshCw, Globe, Zap } from 'lucide-react';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { NewsApiService } from '../services/newsApi';
import { NewsItem } from '../types';
import toast from 'react-hot-toast';

const NEWS_CATEGORIES = ['ALL', 'STOCKS', 'CRYPTO', 'ECONOMY', 'EARNINGS', 'TECH', 'ENERGY'];

export const MarketNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  const newsApi = NewsApiService.getInstance();

  useEffect(() => {
    loadNews();
    
    // Auto-refresh news every 5 minutes
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing news...');
      loadNews();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterNews();
  }, [news, selectedCategory]);

  const loadNews = async () => {
    try {
      setLoading(true);
      console.log('📰 Loading comprehensive real-time market news...');
      const newsData = await newsApi.getMarketNews();
      console.log('✅ News loaded:', newsData.length, 'articles from multiple sources');
      setNews(newsData);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered...');
      await loadNews();
      toast.success('News refreshed from multiple sources!');
    } catch (error) {
      toast.error('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  const filterNews = () => {
    if (selectedCategory === 'ALL') {
      setFilteredNews(news);
    } else {
      const filtered = news.filter(item => {
        const title = item.title.toLowerCase();
        const summary = item.summary.toLowerCase();
        const category = selectedCategory.toLowerCase();
        
        switch (selectedCategory) {
          case 'STOCKS':
            return title.includes('stock') || title.includes('share') || title.includes('equity') || 
                   title.includes('trading') || summary.includes('stock') || summary.includes('share');
          case 'CRYPTO':
            return title.includes('crypto') || title.includes('bitcoin') || title.includes('ethereum') ||
                   title.includes('blockchain') || summary.includes('crypto') || summary.includes('bitcoin');
          case 'ECONOMY':
            return title.includes('economy') || title.includes('economic') || title.includes('gdp') ||
                   title.includes('inflation') || title.includes('federal reserve') || 
                   summary.includes('economy') || summary.includes('economic');
          case 'EARNINGS':
            return title.includes('earnings') || title.includes('revenue') || title.includes('profit') ||
                   title.includes('quarterly') || summary.includes('earnings') || summary.includes('revenue');
          case 'TECH':
            return title.includes('tech') || title.includes('technology') || title.includes('ai') ||
                   title.includes('artificial intelligence') || summary.includes('tech') || summary.includes('technology');
          case 'ENERGY':
            return title.includes('energy') || title.includes('oil') || title.includes('gas') ||
                   title.includes('renewable') || summary.includes('energy') || summary.includes('oil');
          default:
            return true;
        }
      });
      setFilteredNews(filtered);
    }
  };

  const handleNewsClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date();
    const published = new Date(publishedAt);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Reuters': 'text-orange-500',
      'Bloomberg': 'text-blue-500',
      'MarketWatch': 'text-green-500',
      'Financial Times': 'text-pink-500',
      'CNBC': 'text-red-500',
      'Wall Street Journal': 'text-purple-500',
      'Alpha Vantage': 'text-indigo-500',
      'Finnhub': 'text-teal-500'
    };
    return colors[source] || 'text-blue-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="light" />
          <p className="text-gray-400 mt-4">Loading real-time market news from multiple sources...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching from NewsAPI, Alpha Vantage, Finnhub & more</p>
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
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 flex items-center justify-center relative"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Newspaper className="text-white" size={28} />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Zap className="text-yellow-400 w-4 h-4" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Market News</h1>
                <p className="text-gray-400">Real-time financial news from trusted sources worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-2 bg-green-600/20 border border-green-600/30 px-3 py-2 rounded-full">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-green-400 text-sm font-medium">Live News</span>
              </div>
              
              <Button
                onClick={handleRefresh}
                loading={refreshing}
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <RefreshCw size={20} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {NEWS_CATEGORIES.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* News Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Globe size={16} />
              <span>Total Articles: {news.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filtered: {filteredNews.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Last Updated: {lastUpdateTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* News Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Newspaper className="mx-auto text-gray-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-white mb-2">No News Available</h2>
            <p className="text-gray-400">Try refreshing or selecting a different category</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredNews.map((article, index) => (
                <motion.div
                  key={`${article.url}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleNewsClick(article.url)}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    initial={false}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className={`font-medium ${getSourceColor(article.source)}`}>
                          {article.source}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{getTimeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                      <motion.div
                        className="p-2 bg-gray-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.1 }}
                      >
                        <ExternalLink size={16} className="text-gray-400" />
                      </motion.div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors leading-tight">
                      {article.title}
                    </h3>

                    <p className="text-gray-300 leading-relaxed line-clamp-3 mb-4">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-400">
                        <TrendingUp size={16} />
                        <span className="text-sm font-medium">Market Impact</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                          {selectedCategory !== 'ALL' ? selectedCategory : 'GENERAL'}
                        </span>
                        {article.source.includes('API') && (
                          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full border border-blue-600/30">
                            Real-time
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};