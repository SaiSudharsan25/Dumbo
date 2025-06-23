import { useState, useEffect, useRef } from 'react';
import { Stock, StockDetails } from '../types';
import { StockApiService } from '../services/stockApi';
import { useAuth } from './useAuth';

export const useRealTimeStocks = (symbols?: string[]) => {
  const [stocks, setStocks] = useState<{ [symbol: string]: Stock }>({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockApi = StockApiService.getInstance();

  // Update interval - 30 seconds for real-time feel
  const UPDATE_INTERVAL = 30000;

  useEffect(() => {
    if (symbols && symbols.length > 0 && user?.country) {
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [symbols, user?.country]);

  const startRealTimeUpdates = async () => {
    if (!symbols || !user?.country) return;

    console.log('🔄 Starting real-time updates for:', symbols);
    
    // Initial load
    await updateStockPrices();
    
    // Set up interval for continuous updates
    intervalRef.current = setInterval(updateStockPrices, UPDATE_INTERVAL);
  };

  const stopRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Stopped real-time updates');
    }
  };

  const updateStockPrices = async () => {
    if (!symbols || !user?.country) return;

    try {
      setLoading(true);
      console.log('📈 Updating stock prices...');

      const updatedStocks: { [symbol: string]: Stock } = {};
      
      // Update each stock
      for (const symbol of symbols) {
        try {
          const stockData = await stockApi.getRealTimeStock(symbol, user.country);
          updatedStocks[symbol] = stockData;
        } catch (error) {
          console.warn(`Failed to update ${symbol}, keeping previous data`);
          // Keep previous data if update fails
          if (stocks[symbol]) {
            updatedStocks[symbol] = stocks[symbol];
          }
        }
      }

      setStocks(prev => ({ ...prev, ...updatedStocks }));
      console.log('✅ Stock prices updated successfully');
      
    } catch (error) {
      console.error('❌ Error updating stock prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStock = (symbol: string): Stock | null => {
    return stocks[symbol] || null;
  };

  const forceUpdate = async () => {
    await updateStockPrices();
  };

  return {
    stocks,
    loading,
    getStock,
    forceUpdate,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};

// Hook for single stock real-time updates
export const useRealTimeStock = (symbol: string) => {
  const [stock, setStock] = useState<StockDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stockApi = StockApiService.getInstance();

  const UPDATE_INTERVAL = 15000; // 15 seconds for single stock

  useEffect(() => {
    if (symbol && user?.country) {
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [symbol, user?.country]);

  const startRealTimeUpdates = async () => {
    if (!symbol || !user?.country) return;

    console.log('🔄 Starting real-time updates for stock:', symbol);
    
    // Initial load
    await updateStockData();
    
    // Set up interval for continuous updates
    intervalRef.current = setInterval(updateStockData, UPDATE_INTERVAL);
  };

  const stopRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Stopped real-time updates for:', symbol);
    }
  };

  const updateStockData = async () => {
    if (!symbol || !user?.country) return;

    try {
      setLoading(true);
      console.log('📊 Updating stock details for:', symbol);

      const stockDetails = await stockApi.getStockDetails(symbol);
      setStock(stockDetails);
      
      console.log('✅ Stock details updated:', symbol, stockDetails.price);
      
    } catch (error) {
      console.error('❌ Error updating stock details:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceUpdate = async () => {
    await updateStockData();
  };

  return {
    stock,
    loading,
    forceUpdate,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
};