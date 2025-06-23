import { useState, useEffect } from 'react';
import { BrokerageAccount, BrokeragePosition, BrokerageOrder, BrokerageApiService } from '../services/brokerageApi';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useBrokerage = () => {
  const [accounts, setAccounts] = useState<BrokerageAccount[]>([]);
  const [positions, setPositions] = useState<BrokeragePosition[]>([]);
  const [orders, setOrders] = useState<BrokerageOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const brokerageApi = BrokerageApiService.getInstance();

  useEffect(() => {
    // Load saved accounts from localStorage
    const savedAccounts = localStorage.getItem('brokerageAccounts');
    if (savedAccounts) {
      try {
        const parsedAccounts = JSON.parse(savedAccounts);
        setAccounts(parsedAccounts);
        
        // Load positions for connected accounts
        if (parsedAccounts.length > 0) {
          loadAllPositions(parsedAccounts);
        }
      } catch (error) {
        console.error('Failed to load saved brokerage accounts:', error);
      }
    }
  }, []);

  const connectAccount = async (
    provider: string,
    credentials: { apiKey: string; secretKey: string; accountId?: string }
  ): Promise<BrokerageAccount> => {
    try {
      setLoading(true);
      const account = await brokerageApi.connectBrokerageAccount(provider, credentials);
      
      const updatedAccounts = [...accounts, account];
      setAccounts(updatedAccounts);
      
      // Save to localStorage
      localStorage.setItem('brokerageAccounts', JSON.stringify(updatedAccounts));
      
      // Load positions for the new account
      await loadPositions(account);
      
      toast.success(`Connected to ${account.provider} successfully!`);
      return account;
    } catch (error) {
      console.error('Failed to connect brokerage account:', error);
      toast.error('Failed to connect brokerage account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      setLoading(true);
      await brokerageApi.disconnectBrokerageAccount(accountId);
      
      const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
      setAccounts(updatedAccounts);
      
      // Update localStorage
      localStorage.setItem('brokerageAccounts', JSON.stringify(updatedAccounts));
      
      // Remove positions for this account
      setPositions(positions.filter(pos => !pos.symbol.includes(accountId)));
      
      toast.success('Brokerage account disconnected');
    } catch (error) {
      console.error('Failed to disconnect brokerage account:', error);
      toast.error('Failed to disconnect brokerage account');
    } finally {
      setLoading(false);
    }
  };

  const loadPositions = async (account: BrokerageAccount) => {
    try {
      const accountPositions = await brokerageApi.getPortfolioPositions(account);
      
      // Update positions, replacing any existing positions for this account
      setPositions(prev => [
        ...prev.filter(pos => !pos.symbol.includes(account.id)),
        ...accountPositions
      ]);
    } catch (error) {
      console.error('Failed to load positions for account:', account.provider, error);
      toast.error(`Failed to load positions for ${account.provider}`);
    }
  };

  const loadAllPositions = async (accountList: BrokerageAccount[]) => {
    try {
      setLoading(true);
      const allPositions: BrokeragePosition[] = [];
      
      for (const account of accountList) {
        try {
          const accountPositions = await brokerageApi.getPortfolioPositions(account);
          allPositions.push(...accountPositions);
        } catch (error) {
          console.warn(`Failed to load positions for ${account.provider}:`, error);
        }
      }
      
      setPositions(allPositions);
    } catch (error) {
      console.error('Failed to load all positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (
    accountId: string,
    order: {
      symbol: string;
      side: 'BUY' | 'SELL';
      quantity: number;
      orderType: 'MARKET' | 'LIMIT';
      price?: number;
    }
  ): Promise<BrokerageOrder> => {
    try {
      setLoading(true);
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      
      const placedOrder = await brokerageApi.placeOrder(account, order);
      setOrders(prev => [placedOrder, ...prev]);
      
      // Refresh positions after order
      await loadPositions(account);
      
      toast.success(`${order.side} order for ${order.quantity} ${order.symbol} placed successfully!`);
      return placedOrder;
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (accounts.length === 0) return;
    
    try {
      setLoading(true);
      await loadAllPositions(accounts);
      
      // Load order history for all accounts
      const allOrders: BrokerageOrder[] = [];
      for (const account of accounts) {
        try {
          const accountOrders = await brokerageApi.getOrderHistory(account);
          allOrders.push(...accountOrders);
        } catch (error) {
          console.warn(`Failed to load orders for ${account.provider}:`, error);
        }
      }
      
      setOrders(allOrders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      toast.success('Brokerage data refreshed!');
    } catch (error) {
      console.error('Failed to refresh brokerage data:', error);
      toast.error('Failed to refresh brokerage data');
    } finally {
      setLoading(false);
    }
  };

  const getTotalValue = (): number => {
    return positions.reduce((total, position) => total + position.marketValue, 0);
  };

  const getTotalGainLoss = (): number => {
    return positions.reduce((total, position) => total + position.unrealizedPnL, 0);
  };

  const getTotalGainLossPercent = (): number => {
    const totalCost = positions.reduce((total, position) => total + (position.averagePrice * position.quantity), 0);
    const totalGainLoss = getTotalGainLoss();
    return totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  };

  return {
    accounts,
    positions,
    orders,
    loading,
    connectAccount,
    disconnectAccount,
    placeOrder,
    refreshData,
    getTotalValue,
    getTotalGainLoss,
    getTotalGainLossPercent
  };
};