import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, DollarSign, TrendingUp, TrendingDown, RotateCcw, Target } from 'lucide-react';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

interface SimulationGame {
  id: string;
  startingBalance: number;
  currentBalance: number;
  trades: Trade[];
  duration: number; // in minutes
  timeLeft: number;
  isActive: boolean;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  profit?: number;
}

const GAME_MODES = [
  {
    id: 'EASY',
    name: 'Beginner',
    description: 'Start with $10,000, 30 minutes',
    startingBalance: 10000,
    duration: 30,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'MEDIUM',
    name: 'Intermediate',
    description: 'Start with $25,000, 20 minutes',
    startingBalance: 25000,
    duration: 20,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'HARD',
    name: 'Expert',
    description: 'Start with $50,000, 15 minutes',
    startingBalance: 50000,
    duration: 15,
    color: 'from-red-500 to-red-600'
  }
];

export const TradingSimulator: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<SimulationGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentGame && currentGame.isActive && currentGame.timeLeft > 0) {
      interval = setInterval(() => {
        setCurrentGame(prev => {
          if (!prev) return null;
          
          const newTimeLeft = prev.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            endGame(prev);
            return { ...prev, timeLeft: 0, isActive: false };
          }
          
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentGame]);

  const loadLeaderboard = async () => {
    // Mock leaderboard data
    const mockLeaderboard = [
      { rank: 1, name: 'TradingPro', profit: 15420, accuracy: 85 },
      { rank: 2, name: 'StockMaster', profit: 12350, accuracy: 78 },
      { rank: 3, name: 'BullRunner', profit: 9870, accuracy: 72 },
      { rank: 4, name: 'MarketWiz', profit: 8540, accuracy: 69 },
      { rank: 5, name: 'InvestorX', profit: 7230, accuracy: 65 }
    ];
    setLeaderboard(mockLeaderboard);
  };

  const startGame = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    const gameMode = GAME_MODES.find(mode => mode.id === difficulty)!;
    
    const newGame: SimulationGame = {
      id: Date.now().toString(),
      startingBalance: gameMode.startingBalance,
      currentBalance: gameMode.startingBalance,
      trades: [],
      duration: gameMode.duration,
      timeLeft: gameMode.duration * 60, // Convert to seconds
      isActive: true,
      difficulty
    };

    setCurrentGame(newGame);
    toast.success(`${gameMode.name} simulation started!`);
  };

  const endGame = (game: SimulationGame) => {
    const profit = game.currentBalance - game.startingBalance;
    const profitPercent = (profit / game.startingBalance) * 100;
    
    toast.success(
      `Game ended! ${profit >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(Math.abs(profit), user?.country || 'US')} (${profitPercent.toFixed(2)}%)`
    );
    
    // Save to leaderboard (mock)
    console.log('Game results:', { profit, profitPercent, trades: game.trades.length });
  };

  const resetGame = () => {
    setCurrentGame(null);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = (profit: number) => {
    if (profit > 0) return 'text-green-400';
    if (profit < 0) return 'text-red-400';
    return 'text-gray-400';
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Play className="text-white" size={28} />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">Trading Simulator</h1>
                <p className="text-gray-400">Practice trading with virtual money</p>
              </div>
            </div>
            
            {currentGame && (
              <Button
                onClick={resetGame}
                variant="danger"
                className="bg-red-600/20 hover:bg-red-600/30 border-red-600/30 text-red-400"
              >
                <RotateCcw size={20} />
                Reset Game
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentGame ? (
          /* Game Selection */
          <div className="space-y-8">
            {/* Game Modes */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Choose Your Challenge</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {GAME_MODES.map((mode, index) => (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gradient-to-br ${mode.color} rounded-2xl p-6 text-center cursor-pointer hover:scale-105 transition-transform`}
                    onClick={() => startGame(mode.id as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">{mode.name}</h3>
                    <p className="text-white/80 mb-4">{mode.description}</p>
                    <div className="bg-white/20 rounded-lg p-3 mb-4">
                      <p className="text-white font-bold">
                        {formatCurrency(mode.startingBalance, user?.country || 'US')}
                      </p>
                      <p className="text-white/80 text-sm">{mode.duration} minutes</p>
                    </div>
                    <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                      <Play size={20} />
                      Start Game
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={24} />
                Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <motion.div
                    key={player.rank}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        player.rank === 1 ? 'bg-yellow-500 text-black' :
                        player.rank === 2 ? 'bg-gray-400 text-black' :
                        player.rank === 3 ? 'bg-orange-500 text-black' :
                        'bg-gray-700 text-white'
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <p className="font-bold text-white">{player.name}</p>
                        <p className="text-gray-400 text-sm">{player.accuracy}% accuracy</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(player.profit)}`}>
                        +{formatCurrency(player.profit, user?.country || 'US')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Game */
          <div className="space-y-8">
            {/* Game Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div
                className="bg-white/5 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <DollarSign className="mx-auto text-green-400 mb-2" size={32} />
                <p className="text-gray-400 text-sm">Current Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(currentGame.currentBalance, user?.country || 'US')}
                </p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <Target className="mx-auto text-blue-400 mb-2" size={32} />
                <p className="text-gray-400 text-sm">P&L</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(currentGame.currentBalance - currentGame.startingBalance)}`}>
                  {currentGame.currentBalance - currentGame.startingBalance >= 0 ? '+' : ''}
                  {formatCurrency(currentGame.currentBalance - currentGame.startingBalance, user?.country || 'US')}
                </p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <Play className="mx-auto text-purple-400 mb-2" size={32} />
                <p className="text-gray-400 text-sm">Trades</p>
                <p className="text-2xl font-bold text-white">{currentGame.trades.length}</p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ scale: currentGame.timeLeft <= 60 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 1, repeat: currentGame.timeLeft <= 60 ? Infinity : 0 }}
                >
                  <Trophy className={`mx-auto mb-2 ${currentGame.timeLeft <= 60 ? 'text-red-400' : 'text-yellow-400'}`} size={32} />
                </motion.div>
                <p className="text-gray-400 text-sm">Time Left</p>
                <p className={`text-2xl font-bold ${currentGame.timeLeft <= 60 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(currentGame.timeLeft)}
                </p>
              </motion.div>
            </div>

            {/* Game Over */}
            {!currentGame.isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-600/30 rounded-2xl p-8 text-center"
              >
                <Trophy className="mx-auto text-yellow-400 mb-4" size={64} />
                <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-gray-400">Final Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(currentGame.currentBalance, user?.country || 'US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total P&L</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(currentGame.currentBalance - currentGame.startingBalance)}`}>
                      {currentGame.currentBalance - currentGame.startingBalance >= 0 ? '+' : ''}
                      {formatCurrency(currentGame.currentBalance - currentGame.startingBalance, user?.country || 'US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Return %</p>
                    <p className={`text-2xl font-bold ${getPerformanceColor(currentGame.currentBalance - currentGame.startingBalance)}`}>
                      {((currentGame.currentBalance - currentGame.startingBalance) / currentGame.startingBalance * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={resetGame} variant="secondary">
                    Play Again
                  </Button>
                  <Button onClick={() => toast.success('Results saved to leaderboard!')}>
                    Save Results
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Mock Trading Interface */}
            {currentGame.isActive && (
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Quick Trade</h3>
                <p className="text-gray-400 mb-4">
                  This is a simplified trading interface. In a real implementation, you would integrate with live market data and trading APIs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      const profit = Math.random() * 1000 - 500;
                      setCurrentGame(prev => prev ? {
                        ...prev,
                        currentBalance: prev.currentBalance + profit,
                        trades: [...prev.trades, {
                          id: Date.now().toString(),
                          symbol: 'DEMO',
                          type: 'BUY',
                          quantity: 10,
                          price: 100,
                          timestamp: new Date(),
                          profit
                        }]
                      } : null);
                      toast.success(`Trade executed! ${profit >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(Math.abs(profit), user?.country || 'US')}`);
                    }}
                    className="bg-green-600 hover:bg-green-500"
                  >
                    <TrendingUp size={20} />
                    Buy Demo Stock
                  </Button>
                  <Button 
                    onClick={() => {
                      const profit = Math.random() * 1000 - 500;
                      setCurrentGame(prev => prev ? {
                        ...prev,
                        currentBalance: prev.currentBalance + profit,
                        trades: [...prev.trades, {
                          id: Date.now().toString(),
                          symbol: 'DEMO',
                          type: 'SELL',
                          quantity: 10,
                          price: 100,
                          timestamp: new Date(),
                          profit
                        }]
                      } : null);
                      toast.success(`Trade executed! ${profit >= 0 ? 'Profit' : 'Loss'}: ${formatCurrency(Math.abs(profit), user?.country || 'US')}`);
                    }}
                    className="bg-red-600 hover:bg-red-500"
                  >
                    <TrendingDown size={20} />
                    Sell Demo Stock
                  </Button>
                </div>
              </div>
            )}

            {/* Trade History */}
            {currentGame.trades.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Trade History</h3>
                <div className="space-y-3">
                  {currentGame.trades.slice(-5).reverse().map((trade) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trade.type === 'BUY' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                          {trade.type === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-white">{trade.type} {trade.symbol}</p>
                          <p className="text-gray-400 text-sm">{trade.quantity} shares @ {formatCurrency(trade.price, user?.country || 'US')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getPerformanceColor(trade.profit || 0)}`}>
                          {(trade.profit || 0) >= 0 ? '+' : ''}{formatCurrency(trade.profit || 0, user?.country || 'US')}
                        </p>
                        <p className="text-gray-400 text-sm">{trade.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Spacer */}
      <div className="h-24" />
    </div>
  );
};