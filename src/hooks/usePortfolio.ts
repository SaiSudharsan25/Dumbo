import { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import { FirebaseService } from '../services/firebase';
import { StockApiService } from '../services/stockApi';
import { useAuth } from './useAuth';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const firebaseService = FirebaseService.getInstance();
  const stockApi = StockApiService.getInstance();

  useEffect(() => {
    if (user) {
      loadPortfolio();
      // Start real-time price updates for portfolio
      startPortfolioPriceUpdates();
    }
  }, [user]);

  const loadPortfolio = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const portfolioData = await firebaseService.getPortfolio(user.uid);
      
      // Update current prices for all portfolio items
      const updatedPortfolio = await updatePortfolioPrices(portfolioData);
      setPortfolio(updatedPortfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioPrices = async (portfolioItems: PortfolioItem[]): Promise<PortfolioItem[]> => {
    if (!user?.country) return portfolioItems;

    const updatedItems = await Promise.all(
      portfolioItems.map(async (item) => {
        try {
          // Get current stock price
          const currentStock = await stockApi.getRealTimeStock(item.symbol, user.country!);
          const currentPrice = currentStock.price;
          
          // Calculate gain/loss
          const gainLoss = (currentPrice - item.buyPrice) * item.quantity;
          const gainLossPercent = ((currentPrice - item.buyPrice) / item.buyPrice) * 100;
          
          const updatedItem = {
            ...item,
            currentPrice,
            gainLoss,
            gainLossPercent
          };

          // Update in Firebase
          await firebaseService.updatePortfolioItem(item.id, {
            currentPrice,
            gainLoss,
            gainLossPercent
          });

          return updatedItem;
        } catch (error) {
          console.warn(`Failed to update price for ${item.symbol}:`, error);
          return item; // Return original item if update fails
        }
      })
    );

    return updatedItems;
  };

  const startPortfolioPriceUpdates = () => {
    // Update portfolio prices every 30 seconds
    const interval = setInterval(async () => {
      if (portfolio.length > 0 && user?.country) {
        console.log('🔄 Updating portfolio prices...');
        const updatedPortfolio = await updatePortfolioPrices(portfolio);
        setPortfolio(updatedPortfolio);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  };

  const addStock = async (stock: Omit<PortfolioItem, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      const portfolioItem = {
        ...stock,
        userId: user.uid
      };
      
      const id = await firebaseService.addToPortfolio(portfolioItem);
      const newItem = { ...portfolioItem, id };
      setPortfolio([newItem, ...portfolio]);
      return id;
    } catch (error) {
      console.error('Error adding stock to portfolio:', error);
      throw error;
    }
  };

  const removeStock = async (portfolioItemId: string) => {
    try {
      await firebaseService.removeFromPortfolio(portfolioItemId);
      setPortfolio(portfolio.filter(item => item.id !== portfolioItemId));
    } catch (error) {
      console.error('Error removing stock from portfolio:', error);
      throw error;
    }
  };

  const updateStock = async (portfolioItemId: string, updates: Partial<PortfolioItem>) => {
    try {
      await firebaseService.updatePortfolioItem(portfolioItemId, updates);
      setPortfolio(portfolio.map(item => 
        item.id === portfolioItemId ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      throw error;
    }
  };

  const clearPortfolio = async () => {
    if (!user) return;

    try {
      await firebaseService.clearPortfolio(user.uid);
      setPortfolio([]);
    } catch (error) {
      console.error('Error clearing portfolio:', error);
      throw error;
    }
  };

  const forceUpdatePrices = async () => {
    if (portfolio.length > 0 && user?.country) {
      console.log('🔄 Force updating portfolio prices...');
      const updatedPortfolio = await updatePortfolioPrices(portfolio);
      setPortfolio(updatedPortfolio);
    }
  };

  const totalValue = portfolio.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + item.gainLoss, 0);
  
  return {
    portfolio,
    loading,
    addStock,
    removeStock,
    updateStock,
    clearPortfolio,
    totalValue,
    totalGainLoss,
    refresh: loadPortfolio,
    forceUpdatePrices
  };
};