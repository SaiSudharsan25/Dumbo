import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, DollarSign, PieChart, Target, AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { PortfolioItem } from '../types';
import { BrokeragePosition } from '../services/brokerageApi';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface PortfolioSummaryProps {
  simulationPortfolio: PortfolioItem[];
  realPortfolio: BrokeragePosition[];
  totalValue: number;
  totalGainLoss: number;
}

interface PortfolioAnalysis {
  overallRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  diversificationScore: number;
  recommendations: string[];
  topPerformers: string[];
  underperformers: string[];
  sectorAllocation: { [key: string]: number };
  summary: string;
  actionItems: string[];
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  simulationPortfolio,
  realPortfolio,
  totalValue,
  totalGainLoss
}) => {
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { user } = useAuth();

  const generatePortfolioAnalysis = async () => {
    setLoading(true);
    try {
      // Combine both portfolios for analysis
      const allHoldings = [
        ...simulationPortfolio.map(item => ({
          symbol: item.symbol,
          name: item.name,
          value: item.currentPrice * item.quantity,
          gainLoss: item.gainLoss,
          gainLossPercent: item.gainLossPercent,
          type: 'simulation' as const
        })),
        ...realPortfolio.map(pos => ({
          symbol: pos.symbol,
          name: pos.symbol, // In real scenario, we'd fetch company names
          value: pos.marketValue,
          gainLoss: pos.unrealizedPnL,
          gainLossPercent: pos.unrealizedPnLPercent,
          type: 'real' as const
        }))
      ];

      // Generate comprehensive analysis
      const portfolioAnalysis = await analyzePortfolio(allHoldings);
      setAnalysis(portfolioAnalysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Failed to generate portfolio analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzePortfolio = async (holdings: any[]): Promise<PortfolioAnalysis> => {
    // Calculate metrics
    const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const totalGainLossAmount = holdings.reduce((sum, holding) => sum + holding.gainLoss, 0);
    const gainLossPercent = totalPortfolioValue > 0 ? (totalGainLossAmount / totalPortfolioValue) * 100 : 0;
    
    // Diversification analysis
    const uniqueStocks = new Set(holdings.map(h => h.symbol)).size;
    const diversificationScore = Math.min(uniqueStocks * 10, 100); // Max 100 for 10+ stocks
    
    // Sector allocation (simplified)
    const sectorAllocation = holdings.reduce((acc, holding) => {
      const sector = getSectorFromSymbol(holding.symbol);
      acc[sector] = (acc[sector] || 0) + holding.value;
      return acc;
    }, {} as { [key: string]: number });

    // Performance analysis
    const performers = holdings.sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    const topPerformers = performers.slice(0, 3).map(p => `${p.symbol} (+${p.gainLossPercent.toFixed(1)}%)`);
    const underperformers = performers.slice(-3).map(p => `${p.symbol} (${p.gainLossPercent.toFixed(1)}%)`);

    // Overall rating
    let overallRating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    if (gainLossPercent > 10) overallRating = 'EXCELLENT';
    else if (gainLossPercent > 5) overallRating = 'GOOD';
    else if (gainLossPercent > -5) overallRating = 'FAIR';
    else overallRating = 'POOR';

    // Risk level
    const volatility = calculatePortfolioVolatility(holdings);
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = volatility > 15 ? 'HIGH' : volatility > 8 ? 'MEDIUM' : 'LOW';

    // Generate AI-powered recommendations
    const recommendations = await generateRecommendations(holdings, diversificationScore, riskLevel);

    return {
      overallRating,
      riskLevel,
      diversificationScore,
      recommendations,
      topPerformers,
      underperformers,
      sectorAllocation,
      summary: generateSummary(overallRating, gainLossPercent, diversificationScore, riskLevel),
      actionItems: generateActionItems(holdings, diversificationScore, riskLevel)
    };
  };

  const generateRecommendations = async (holdings: any[], diversificationScore: number, riskLevel: string): Promise<string[]> => {
    const recommendations = [];

    if (diversificationScore < 50) {
      recommendations.push("Consider diversifying across more sectors and asset classes");
    }

    if (riskLevel === 'HIGH') {
      recommendations.push("Portfolio shows high volatility - consider adding stable dividend stocks");
    }

    if (holdings.length < 5) {
      recommendations.push("Increase portfolio size to reduce concentration risk");
    }

    const techExposure = holdings.filter(h => getSectorFromSymbol(h.symbol) === 'Technology').length;
    if (techExposure > holdings.length * 0.5) {
      recommendations.push("High tech exposure detected - consider adding defensive sectors");
    }

    return recommendations;
  };

  const generateSummary = (rating: string, gainLoss: number, diversification: number, risk: string): string => {
    return `Your portfolio is rated ${rating} with a ${gainLoss >= 0 ? 'gain' : 'loss'} of ${Math.abs(gainLoss).toFixed(1)}%. 
    Diversification score is ${diversification}/100 with ${risk.toLowerCase()} risk profile. 
    ${gainLoss > 0 ? 'Strong performance indicates good stock selection.' : 'Consider reviewing underperforming positions.'} 
    ${diversification < 70 ? 'Improving diversification could reduce overall portfolio risk.' : 'Good diversification across holdings.'}`;
  };

  const generateActionItems = (holdings: any[], diversification: number, risk: string): string[] => {
    const actions = [];

    if (diversification < 60) {
      actions.push("Add 2-3 stocks from different sectors");
    }

    if (risk === 'HIGH') {
      actions.push("Consider adding bonds or dividend stocks for stability");
    }

    const losers = holdings.filter(h => h.gainLossPercent < -10);
    if (losers.length > 0) {
      actions.push(`Review ${losers.length} underperforming position(s)`);
    }

    actions.push("Set stop-loss orders for risk management");
    actions.push("Review and rebalance quarterly");

    return actions;
  };

  const getSectorFromSymbol = (symbol: string): string => {
    const sectors: { [key: string]: string } = {
      'AAPL': 'Technology', 'GOOGL': 'Technology', 'MSFT': 'Technology',
      'TSLA': 'Automotive', 'AMZN': 'Consumer', 'META': 'Technology',
      'NVDA': 'Technology', 'NFLX': 'Entertainment'
    };
    return sectors[symbol] || 'Other';
  };

  const calculatePortfolioVolatility = (holdings: any[]): number => {
    const volatilities = holdings.map(h => Math.abs(h.gainLossPercent));
    return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'EXCELLENT': return 'text-green-600 dark:text-green-400';
      case 'GOOD': return 'text-blue-600 dark:text-blue-400';
      case 'FAIR': return 'text-yellow-600 dark:text-yellow-400';
      case 'POOR': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600 dark:text-green-400';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400';
      case 'HIGH': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const hasPortfolio = simulationPortfolio.length > 0 || realPortfolio.length > 0;

  if (!hasPortfolio) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="bg-purple-100 dark:bg-purple-900 rounded-xl p-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Brain className="text-purple-600 dark:text-purple-400" size={20} />
          </motion.div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Portfolio Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Get insights on your investment strategy</p>
          </div>
        </div>
        
        <Button
          onClick={generatePortfolioAnalysis}
          loading={loading}
          disabled={!hasPortfolio}
          size="sm"
        >
          <Brain size={16} />
          Analyze
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Value</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalValue, user?.country || 'US')}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            {totalGainLoss >= 0 ? 
              <TrendingUp size={16} className="text-green-600 dark:text-green-400" /> :
              <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
            }
            <span className="text-xs text-gray-500 dark:text-gray-400">P&L</span>
          </div>
          <p className={`font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss, user?.country || 'US')}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <PieChart size={16} className="text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Holdings</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white">
            {simulationPortfolio.length + realPortfolio.length}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Return</span>
          </div>
          <p className={`font-bold ${totalGainLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalValue > 0 ? `${((totalGainLoss / totalValue) * 100).toFixed(1)}%` : '0.0%'}
          </p>
        </div>
      </div>

      {/* Analysis Results */}
      {showAnalysis && analysis && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          {/* Overall Rating */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Portfolio Rating</h4>
              <span className={`font-bold text-lg ${getRatingColor(analysis.overallRating)}`}>
                {analysis.overallRating}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Risk Assessment</h5>
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={getRiskColor(analysis.riskLevel)} />
                <span className={`font-medium ${getRiskColor(analysis.riskLevel)}`}>
                  {analysis.riskLevel} RISK
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Diversification: {analysis.diversificationScore}/100
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Top Performers</h5>
              <div className="space-y-1">
                {analysis.topPerformers.slice(0, 2).map((performer, index) => (
                  <p key={index} className="text-green-600 dark:text-green-400 text-sm font-medium">
                    {performer}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">AI Recommendations</h5>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Action Items</h5>
            <div className="space-y-2">
              {analysis.actionItems.map((action, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600 dark:bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <LoadingSpinner size="md" color="dark" />
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              Analyzing your portfolio with AI...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};