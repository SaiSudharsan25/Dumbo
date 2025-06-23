import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, X, BarChart3 } from 'lucide-react';
import { PortfolioItem } from '../types';
import { Button } from './Button';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface PortfolioCardProps {
  item: PortfolioItem;
  onSell: (id: string) => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ item, onSell }) => {
  const { user } = useAuth();
  const isProfit = item.gainLoss >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Animated background */}
      <motion.div
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
          isProfit ? 'bg-green-400' : 'bg-red-400'
        }`}
        initial={false}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="font-bold text-white">{item.symbol}</h3>
              <p className="text-gray-400 text-sm">{item.name}</p>
            </div>
          </div>
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSell(item.id)}
              className="p-2 hover:bg-red-600/20 hover:text-red-400 border-red-600/30"
            >
              <X size={16} />
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <motion.div 
            className="bg-white/10 rounded-xl p-3"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-400 text-xs mb-1">Buy Price</p>
            <p className="font-bold text-white">
              {formatCurrency(item.buyPrice, user?.country || 'US')}
            </p>
          </motion.div>
          <motion.div 
            className="bg-white/10 rounded-xl p-3"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-400 text-xs mb-1">Current Price</p>
            <p className="font-bold text-white">
              {formatCurrency(item.currentPrice, user?.country || 'US')}
            </p>
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-gray-400 text-xs mb-1">Quantity</p>
            <p className="font-bold text-white">{item.quantity}</p>
          </div>
          
          <motion.div 
            className="text-right"
            whileHover={{ scale: 1.05 }}
          >
            <p className={`font-bold text-xl ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{formatCurrency(Math.abs(item.gainLoss), user?.country || 'US')}
            </p>
            <motion.div 
              className={`flex items-center gap-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              <motion.div
                animate={{ rotate: isProfit ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </motion.div>
              <span className="text-sm font-semibold">
                {isProfit ? '+' : ''}{item.gainLossPercent.toFixed(2)}%
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};