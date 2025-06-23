import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, TrendingUp, TrendingDown, RefreshCw, Trash2, BarChart3, Link, Plus, Brain, Wallet, Target, Layers } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { PortfolioCard } from '../components/PortfolioCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { BrokerageConnection } from '../components/BrokerageConnection';
import { PortfolioSummary } from '../components/PortfolioSummary';
import { EnhancedAIChat } from '../components/EnhancedAIChat';
import { usePortfolio } from '../hooks/usePortfolio';
import { useTheme } from '../contexts/ThemeContext';
import { BrokerageApiService, BrokerageAccount, BrokeragePosition } from '../services/brokerageApi';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

export const Portfolio: React.FC = () => {
  const { portfolio, loading, removeStock, clearPortfolio, totalValue, totalGainLoss, refresh, forceUpdatePrices } = usePortfolio();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showBrokerageModal, setShowBrokerageModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<BrokerageAccount[]>([]);
  const [brokeragePositions, setBrokeragePositions] = useState<BrokeragePosition[]>([]);
  const [loadingBrokerageData, setLoadingBrokerageData] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'simulation' | 'real' | 'combined'>('combined');

  const brokerageApi = BrokerageApiService.getInstance();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (portfolio.length > 0) {
        console.log('🔄 Auto-updating portfolio prices...');
        await forceUpdatePrices();
        setLastUpdateTime(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [portfolio.length, forceUpdatePrices]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      await forceUpdatePrices();
      
      if (connectedAccounts.length > 0) {
        await refreshBrokerageData();
      }
      
      setLastUpdateTime(new Date());
      toast.success('Portfolio refreshed!');
    } catch (error) {
      toast.error('Failed to refresh portfolio');
    } finally {
      setRefreshing(false);
    }
  };

  const handleClearPortfolio = async () => {
    if (!window.confirm('Are you sure you want to clear your entire simulation portfolio? This action cannot be undone.')) {
      return;
    }
    
    setClearing(true);
    try {
      await clearPortfolio();
      toast.success('Simulation portfolio cleared!');
    } catch (error) {
      toast.error('Failed to clear portfolio');
    } finally {
      setClearing(false);
    }
  };

  const handleSellStock = async (portfolioItemId: string) => {
    try {
      await removeStock(portfolioItemId);
      toast.success('Stock sold from simulation portfolio!');
    } catch (error) {
      toast.error('Failed to sell stock');
    }
  };

  const handleBrokerageAccountConnected = async (account: BrokerageAccount) => {
    setConnectedAccounts([...connectedAccounts, account]);
    await refreshBrokerageData();
  };

  const refreshBrokerageData = async () => {
    if (connectedAccounts.length === 0) return;
    
    setLoadingBrokerageData(true);
    try {
      const allPositions: BrokeragePosition[] = [];
      
      for (const account of connectedAccounts) {
        try {
          const accountPositions = await brokerageApi.getPortfolioPositions(account);
          allPositions.push(...accountPositions);
        } catch (error) {
          console.warn(`Failed to load positions for ${account.provider}:`, error);
        }
      }
      
      setBrokeragePositions(allPositions);
    } catch (error) {
      console.error('Failed to refresh brokerage data:', error);
      toast.error('Failed to refresh brokerage data');
    } finally {
      setLoadingBrokerageData(false);
    }
  };

  const isProfit = totalGainLoss >= 0;
  const hasSimulationData = portfolio.length > 0;
  const hasRealData = brokeragePositions.length > 0;
  const hasAnyData = hasSimulationData || hasRealData;

  const simulationChartData = hasSimulationData ? {
    labels: portfolio.map(item => item.symbol),
    datasets: [
      {
        data: portfolio.map(item => item.currentPrice * item.quantity),
        backgroundColor: [
          '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', 
          '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
        ],
        borderColor: isDark ? '#1F2937' : '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  } : null;

  const realChartData = hasRealData ? {
    labels: brokeragePositions.map(pos => pos.symbol),
    datasets: [
      {
        data: brokeragePositions.map(pos => pos.marketValue),
        backgroundColor: [
          '#059669', '#2563EB', '#D97706', '#DC2626', '#7C3AED',
          '#EA580C', '#0891B2', '#65A30D', '#DB2777', '#4B5563'
        ],
        borderColor: isDark ? '#1F2937' : '#FFFFFF',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#E5E7EB' : '#374151',
          font: {
            size: 12,
            weight: '500' as const,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#E5E7EB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value, user?.country || 'US')} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderRadius: 8,
      },
    },
  };

  const brokerageValue = brokeragePositions.reduce((sum, pos) => sum + pos.marketValue, 0);
  const brokerageGainLoss = brokeragePositions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalCombinedValue = totalValue + brokerageValue;
  const totalCombinedGainLoss = totalGainLoss + brokerageGainLoss;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="light" />
          <p className="text-gray-400 mt-4">Loading portfolio...</p>
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
                className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-4 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <PieChart className="text-black" size={28} />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Your Portfolio</h1>
                <p className="text-gray-400">Manage your investments and track performance</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              {hasAnyData && (
                <div className="flex items-center gap-2 bg-green-600/20 border border-green-600/30 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </div>
              )}
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <Brain size={20} />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBrokerageModal(true)}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <Link size={20} />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  loading={refreshing}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  <RefreshCw size={20} />
                </Button>
              </motion.div>
              
              {hasSimulationData && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClearPortfolio}
                    loading={clearing}
                    className="bg-red-600/20 hover:bg-red-600/30 border-red-600/30 text-red-400"
                  >
                    <Trash2 size={20} />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Portfolio Tabs */}
          {hasAnyData && (
            <div className="flex gap-2 mb-6">
              {[
                { id: 'combined', label: 'Combined', icon: Layers },
                { id: 'simulation', label: 'Simulation', icon: BarChart3 },
                { id: 'real', label: 'Real Trading', icon: Target }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-green-600 text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          )}

          {hasAnyData && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="text-green-400" size={24} />
                    <span className="text-green-400 font-medium">
                      {activeTab === 'combined' ? 'Total Value' : 
                       activeTab === 'simulation' ? 'Simulation Value' : 'Real Value'}
                    </span>
                  </div>
                  <motion.p 
                    key={activeTab === 'combined' ? totalCombinedValue : activeTab === 'simulation' ? totalValue : brokerageValue}
                    initial={{ scale: 1.1, color: '#10B981' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl font-bold text-white"
                  >
                    {formatCurrency(
                      activeTab === 'combined' ? totalCombinedValue : 
                      activeTab === 'simulation' ? totalValue : brokerageValue, 
                      user?.country || 'US'
                    )}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`bg-gradient-to-br ${
                    (activeTab === 'combined' ? totalCombinedGainLoss : 
                     activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 
                      ? 'from-green-600/20 to-green-800/20 border-green-600/30' 
                      : 'from-red-600/20 to-red-800/20 border-red-600/30'
                  } border rounded-2xl p-6`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {(activeTab === 'combined' ? totalCombinedGainLoss : 
                      activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 ? 
                      <TrendingUp className="text-green-400" size={24} /> :
                      <TrendingDown className="text-red-400" size={24} />
                    }
                    <span className={`${
                      (activeTab === 'combined' ? totalCombinedGainLoss : 
                       activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 
                        ? 'text-green-400' : 'text-red-400'
                    } font-medium`}>
                      P&L
                    </span>
                  </div>
                  <motion.p 
                    key={activeTab === 'combined' ? totalCombinedGainLoss : activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss}
                    initial={{ scale: 1.1, color: (activeTab === 'combined' ? totalCombinedGainLoss : activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 ? '#10B981' : '#EF4444' }}
                    animate={{ scale: 1, color: 'inherit' }}
                    transition={{ duration: 0.3 }}
                    className={`text-3xl font-bold ${
                      (activeTab === 'combined' ? totalCombinedGainLoss : 
                       activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 
                        ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {(activeTab === 'combined' ? totalCombinedGainLoss : 
                      activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss) >= 0 ? '+' : ''}
                    {formatCurrency(
                      activeTab === 'combined' ? totalCombinedGainLoss : 
                      activeTab === 'simulation' ? totalGainLoss : brokerageGainLoss, 
                      user?.country || 'US'
                    )}
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="text-blue-400" size={24} />
                    <span className="text-blue-400 font-medium">Simulation</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(totalValue, user?.country || 'US')}
                  </p>
                  <p className="text-sm text-gray-400">{portfolio.length} positions</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="text-purple-400" size={24} />
                    <span className="text-purple-400 font-medium">Real Trading</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(brokerageValue, user?.country || 'US')}
                  </p>
                  <p className="text-sm text-gray-400">{brokeragePositions.length} positions</p>
                </motion.div>
              </div>

              <div className="text-center mb-6">
                <p className="text-xs text-gray-400">
                  Last updated: {lastUpdateTime.toLocaleTimeString()}
                </p>
              </div>
            </>
          )}

          {connectedAccounts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center gap-3 bg-green-600/20 border border-green-600/30 text-green-400 px-4 py-2 rounded-full text-sm"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>{account.provider} Connected</span>
                  <span className="font-semibold">{formatCurrency(account.balance, user?.country || 'US')}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {hasAnyData && (
          <PortfolioSummary
            simulationPortfolio={portfolio}
            realPortfolio={brokeragePositions}
            totalValue={totalCombinedValue}
            totalGainLoss={totalCombinedGainLoss}
          />
        )}

        {showAIChat && hasAnyData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EnhancedAIChat
              mode="portfolio"
              portfolio={portfolio}
              realPortfolio={brokeragePositions}
              onClose={() => setShowAIChat(false)}
            />
          </motion.div>
        )}

        {!hasAnyData ? (
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
              <PieChart className="text-gray-500" size={64} />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Investment Journey</h2>
            <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
              Build your portfolio by exploring stocks or connecting your brokerage account for real-time tracking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/'} 
                size="lg"
                className="bg-green-600 hover:bg-green-500 text-black font-bold"
              >
                <BarChart3 size={20} />
                Explore Stocks
              </Button>
              <Button 
                onClick={() => setShowBrokerageModal(true)} 
                variant="secondary" 
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
              >
                <Link size={20} />
                Connect Broker
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Simulation Portfolio */}
            {(activeTab === 'combined' || activeTab === 'simulation') && hasSimulationData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-white">Simulation Portfolio</h3>
                    <span className="text-sm text-gray-400">({portfolio.length} positions)</span>
                  </div>
                  
                  <div className="h-80 relative mb-6">
                    {simulationChartData && <Doughnut data={simulationChartData} options={chartOptions} />}
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Total Value</p>
                        <motion.p 
                          key={totalValue}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-xl font-bold text-white"
                        >
                          {formatCurrency(totalValue, user?.country || 'US')}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {portfolio.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -300 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PortfolioCard
                          item={item}
                          onSell={handleSellStock}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Real Portfolio */}
            {(activeTab === 'combined' || activeTab === 'real') && hasRealData && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-bold text-white">Real Portfolio</h3>
                    <span className="text-sm text-gray-400">({brokeragePositions.length} positions)</span>
                    {loadingBrokerageData && <LoadingSpinner size="sm" color="light" />}
                  </div>
                  
                  <div className="h-80 relative mb-6">
                    {realChartData && <Doughnut data={realChartData} options={chartOptions} />}
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <p className="text-gray-400 text-sm">Total Value</p>
                        <motion.p 
                          key={brokerageValue}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-xl font-bold text-white"
                        >
                          {formatCurrency(brokerageValue, user?.country || 'US')}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {brokeragePositions.map((position, index) => (
                    <motion.div
                      key={`${position.symbol}-real`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-600/20 border border-green-600/30 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{position.symbol}</h4>
                            <p className="text-gray-400 text-sm">{position.quantity} shares @ {formatCurrency(position.averagePrice, user?.country || 'US')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <motion.p 
                            key={position.marketValue}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="font-bold text-white"
                          >
                            {formatCurrency(position.marketValue, user?.country || 'US')}
                          </motion.p>
                          <motion.div 
                            key={position.unrealizedPnL}
                            initial={{ scale: 1.05 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center gap-2 justify-end ${position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}
                          >
                            {position.unrealizedPnL >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            <span className="text-sm font-semibold">
                              {position.unrealizedPnL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPnL, user?.country || 'US')} ({position.unrealizedPnLPercent.toFixed(2)}%)
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <BrokerageConnection
        isOpen={showBrokerageModal}
        onClose={() => setShowBrokerageModal(false)}
        onAccountConnected={handleBrokerageAccountConnected}
      />

      <div className="h-24" />
    </div>
  );
};