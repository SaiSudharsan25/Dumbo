import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Star } from 'lucide-react';
import { Stock } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import { useWatchlist } from '../hooks/useWatchlist';
import toast from 'react-hot-toast';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const { user } = useAuth();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const isPositive = stock.changePercent >= 0;
  const inWatchlist = isInWatchlist(stock.symbol);
  
  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    try {
      if (inWatchlist) {
        await removeFromWatchlist(stock.symbol);
        toast.success(`Removed ${stock.symbol} from watchlist`);
      } else {
        await addToWatchlist(stock.symbol, stock.name);
        toast.success(`Added ${stock.symbol} to watchlist`);
      }
    } catch (error) {
      toast.error('Failed to update watchlist');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <motion.div 
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-lg truncate">{stock.symbol}</h3>
              <p className="text-gray-400 text-sm truncate">{stock.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Watchlist Button */}
            <motion.button
              onClick={handleWatchlistToggle}
              className={`p-2 rounded-full transition-colors ${
                inWatchlist 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-white/10 text-gray-400 hover:text-yellow-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star size={16} className={inWatchlist ? 'fill-current' : ''} />
            </motion.button>
            
            {/* Price */}
            <div className="text-right flex-shrink-0">
              <motion.p 
                className="font-bold text-2xl text-white"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                {formatCurrency(stock.price, user?.country || 'US')}
              </motion.p>
              <motion.div 
                className={`flex items-center gap-2 justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
              >
                <motion.div
                  animate={{ rotate: isPositive ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </motion.div>
                <span className="text-sm font-semibold">
                  {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400 bg-white/10 px-3 py-1 rounded-full truncate max-w-[120px]">
            {stock.sector}
          </span>
          <span className="text-gray-400 ml-2 flex-shrink-0">
            Vol: {(stock.volume / 1000000).toFixed(1)}M
          </span>
        </div>
      </div>
      
      {/* Hover effect line */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-blue-400"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};