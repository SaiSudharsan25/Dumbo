import { useState, useEffect } from 'react';
import { Stock } from '../types';
import { FirebaseService } from '../services/firebase';
import { StockApiService } from '../services/stockApi';
import { useAuth } from './useAuth';

interface WatchlistItem {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  addedAt: Date;
}

export const useWatchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [watchlist, setWatchlist] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const firebaseService = FirebaseService.getInstance();
  const stockApi = StockApiService.getInstance();

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const items = await firebaseService.getWatchlist(user.uid);
      setWatchlistItems(items);
      
      // Load current stock data for watchlist items with proper currency conversion
      if (items.length > 0 && user.country) {
        const stockPromises = items.map(item => 
          stockApi.getRealTimeStock(item.symbol, user.country!)
        );
        
        const stocks = await Promise.allSettled(stockPromises);
        const validStocks = stocks
          .filter((result): result is PromiseFulfilledResult<Stock> => result.status === 'fulfilled')
          .map(result => result.value);
        
        setWatchlist(validStocks);
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWatchlist = async (symbol: string, name: string) => {
    if (!user) return;

    try {
      const watchlistItem = {
        userId: user.uid,
        symbol,
        name,
        addedAt: new Date()
      };
      
      const id = await firebaseService.addToWatchlist(watchlistItem);
      const newItem = { ...watchlistItem, id };
      setWatchlistItems([newItem, ...watchlistItems]);
      
      // Add to current watchlist if we have stock data
      if (user.country) {
        const stockData = await stockApi.getRealTimeStock(symbol, user.country);
        setWatchlist([stockData, ...watchlist]);
      }
      
      return id;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    if (!user) return;

    try {
      const item = watchlistItems.find(item => item.symbol === symbol);
      if (item) {
        await firebaseService.removeFromWatchlist(item.id);
        setWatchlistItems(watchlistItems.filter(item => item.symbol !== symbol));
        setWatchlist(watchlist.filter(stock => stock.symbol !== symbol));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  };

  const isInWatchlist = (symbol: string): boolean => {
    return watchlistItems.some(item => item.symbol === symbol);
  };

  const refresh = async () => {
    await loadWatchlist();
  };

  return {
    watchlist,
    watchlistItems,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refresh
  };
};