import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, TrendingUp, Calculator, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { StockDetails } from '../types';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';
import { useBrokerage } from '../hooks/useBrokerage';
import toast from 'react-hot-toast';

interface RealTradingModalProps {
  stock: StockDetails;
  isOpen: boolean;
  onClose: () => void;
}

export const RealTradingModal: React.FC<RealTradingModalProps> = ({
  stock,
  isOpen,
  onClose
}) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState(stock.price);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { accounts, placeOrder } = useBrokerage();

  const totalCost = orderType === 'MARKET' ? stock.price * quantity : limitPrice * quantity;

  const handleTrade = async () => {
    if (!selectedAccount) {
      toast.error('Please select a brokerage account');
      return;
    }

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await placeOrder(selectedAccount, {
        symbol: stock.symbol,
        side: 'BUY',
        quantity,
        orderType,
        price: orderType === 'LIMIT' ? limitPrice : undefined
      });

      onClose();
      setQuantity(1);
      setOrderType('MARKET');
      setLimitPrice(stock.price);
    } catch (error) {
      console.error('Error placing trade:', error);
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Real Trade: {stock.symbol}</h2>
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
            {/* Warning */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 text-sm">Real Money Trading</h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    This will place a real order with your connected brokerage account. Please review carefully.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Selection */}
            {accounts.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="">Choose brokerage account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.provider} - {account.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">No brokerage accounts connected</p>
                <Button onClick={onClose} variant="secondary" size="sm" className="mt-2">
                  Connect Account First
                </Button>
              </div>
            )}

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Order Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['MARKET', 'LIMIT'].map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setOrderType(type as 'MARKET' | 'LIMIT')}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      orderType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Limit Price (if LIMIT order) */}
            {orderType === 'LIMIT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Limit Price
                </label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter limit price"
                />
              </div>
            )}

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
                        ? 'bg-green-600 text-white'
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white text-center text-lg font-semibold"
                  placeholder="Enter quantity"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Calculator size={18} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Total Cost */}
            <motion.div 
              className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-4 text-white"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Estimated Cost</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totalCost, user?.country || 'US')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm">{quantity} shares</p>
                  <p className="text-sm">
                    {formatCurrency(orderType === 'MARKET' ? stock.price : limitPrice, user?.country || 'US')} × {quantity}
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
                onClick={handleTrade}
                loading={loading}
                disabled={quantity <= 0 || !selectedAccount || accounts.length === 0}
                className="flex-1"
              >
                <ShoppingCart size={20} />
                Place {orderType} Order
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};