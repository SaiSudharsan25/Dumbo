import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, TrendingUp, Calculator } from 'lucide-react';
import { Button } from './Button';
import { StockDetails } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface BuyStockModalProps {
  stock: StockDetails;
  isOpen: boolean;
  onClose: () => void;
  onBuy: (quantity: number) => Promise<void>;
}

export const BuyStockModal: React.FC<BuyStockModalProps> = ({
  stock,
  isOpen,
  onClose,
  onBuy
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const totalCost = stock.price * quantity;

  const handleBuy = async () => {
    if (quantity <= 0) return;
    
    setLoading(true);
    try {
      await onBuy(quantity);
      onClose();
      setQuantity(1);
    } catch (error) {
      console.error('Error buying stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value) || 0;
    if (num >= 0 && num <= 1000) {
      setQuantity(num);
    }
  };

  const quickQuantities = [1, 5, 10, 25, 50, 100];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <motion.div 
                className="bg-green-100 dark:bg-green-900 rounded-xl p-2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <ShoppingCart className="text-green-600 dark:text-green-400" size={20} />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Buy {stock.symbol}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{stock.name}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Price */}
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stock.price, user?.country || 'US')}
                  </p>
                </div>
                <div className={`flex items-center gap-2 ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  <TrendingUp size={20} className={stock.changePercent < 0 ? 'rotate-180' : ''} />
                  <span className="font-semibold">
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quantity
              </label>
              
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickQuantities.map((qty) => (
                  <motion.button
                    key={qty}
                    onClick={() => setQuantity(qty)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      quantity === qty
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {qty}
                  </motion.button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent text-gray-900 dark:text-white text-center text-lg font-semibold"
                  placeholder="Enter quantity"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Calculator size={18} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <motion.div 
              className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Cost</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalCost, user?.country || 'US')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">{quantity} shares</p>
                  <p className="text-sm">
                    {formatCurrency(stock.price, user?.country || 'US')} × {quantity}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={handleBuy}
                loading={loading}
                disabled={quantity <= 0}
                className="flex-1"
              >
                <ShoppingCart size={20} />
                Buy {quantity} Share{quantity !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};