import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, PieChart, TrendingUp, DollarSign, X } from 'lucide-react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { AIMessage, StockDetails, PortfolioItem } from '../types';
import { BrokeragePosition } from '../services/brokerageApi';
import { DeepSeekApiService } from '../services/deepseekApi';
import { formatCurrency } from '../utils/currency';
import { useAuth } from '../hooks/useAuth';

interface EnhancedAIChatProps {
  stock?: StockDetails;
  portfolio?: PortfolioItem[];
  realPortfolio?: BrokeragePosition[];
  mode: 'stock' | 'portfolio';
  onClose?: () => void;
}

export const EnhancedAIChat: React.FC<EnhancedAIChatProps> = ({ 
  stock, 
  portfolio = [], 
  realPortfolio = [], 
  mode,
  onClose
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const deepseekApi = DeepSeekApiService.getInstance();

  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: '1',
      role: 'assistant',
      content: getWelcomeMessage(),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [mode, stock, portfolio, realPortfolio]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = (): string => {
    if (mode === 'stock' && stock) {
      return `Hello! I'm your DeepSeek AI assistant specialized in ${stock.symbol} (${stock.name}). I can help you with:

📊 **Stock Analysis** - Technical and fundamental insights
💰 **Investment Strategy** - Buy/sell recommendations  
⚠️ **Risk Assessment** - Understanding potential risks
🎯 **Price Targets** - Future price projections
🏢 **Competitor Analysis** - Market positioning
📰 **News Impact** - Recent developments analysis

What would you like to explore about ${stock.symbol}?`;
    } else {
      const totalHoldings = portfolio.length + realPortfolio.length;
      const totalValue = [...portfolio.map(p => p.currentPrice * p.quantity), ...realPortfolio.map(r => r.marketValue)].reduce((sum, val) => sum + val, 0);
      
      return `Hello! I'm your DeepSeek AI portfolio advisor. I can see you have ${totalHoldings} holdings worth ${formatCurrency(totalValue, user?.country || 'US')}.

I can help you with:

📈 **Portfolio Analysis** - Performance and risk assessment
🎯 **Optimization** - Rebalancing recommendations
💡 **Stock Research** - Individual position analysis
⚖️ **Risk Management** - Diversification strategies
📊 **Performance Tracking** - Gains/losses breakdown
🔍 **Market Insights** - Sector and trend analysis

Ask me anything about your portfolio or specific holdings!`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      let response: string;
      
      if (mode === 'stock' && stock) {
        response = await deepseekApi.chatAboutStock(stock, inputMessage.trim(), messages);
      } else {
        response = await generatePortfolioResponse(inputMessage.trim(), messages);
      }
      
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try asking again or rephrase your question.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolioResponse = async (userMessage: string, chatHistory: AIMessage[]): Promise<string> => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('portfolio') || message.includes('overall')) {
      return generatePortfolioOverviewResponse();
    }
    
    if (message.includes('performance') || message.includes('return')) {
      return generatePerformanceResponse();
    }
    
    if (message.includes('risk') || message.includes('diversification')) {
      return generateRiskAnalysisResponse();
    }
    
    if (message.includes('rebalance') || message.includes('optimize')) {
      return generateRebalancingResponse();
    }
    
    if (message.includes('sector') || message.includes('allocation')) {
      return generateSectorAnalysisResponse();
    }
    
    const portfolioSymbols = [...portfolio.map(p => p.symbol), ...realPortfolio.map(r => r.symbol)];
    const mentionedStock = portfolioSymbols.find(symbol => 
      message.includes(symbol.toLowerCase())
    );
    
    if (mentionedStock) {
      return generateSpecificStockResponse(mentionedStock);
    }
    
    return generateDefaultPortfolioResponse(userMessage);
  };

  const generatePortfolioOverviewResponse = (): string => {
    const totalHoldings = portfolio.length + realPortfolio.length;
    const totalValue = [...portfolio.map(p => p.currentPrice * p.quantity), ...realPortfolio.map(r => r.marketValue)].reduce((sum, val) => sum + val, 0);
    const totalGainLoss = [...portfolio.map(p => p.gainLoss), ...realPortfolio.map(r => r.unrealizedPnL)].reduce((sum, val) => sum + val, 0);
    const gainLossPercent = totalValue > 0 ? (totalGainLoss / totalValue) * 100 : 0;
    
    return `**Portfolio Overview:**

📊 **Total Holdings**: ${totalHoldings} positions
💰 **Total Value**: ${formatCurrency(totalValue, user?.country || 'US')}
📈 **Total P&L**: ${totalGainLoss >= 0 ? '+' : ''}${formatCurrency(totalGainLoss, user?.country || 'US')} (${gainLossPercent.toFixed(2)}%)

**Portfolio Breakdown**:
• **Simulation Portfolio**: ${portfolio.length} positions
• **Real Portfolio**: ${realPortfolio.length} positions

**Performance Summary**:
${gainLossPercent > 5 ? '✅ Strong performance! Your portfolio is outperforming.' : 
  gainLossPercent > 0 ? '📈 Positive returns with steady growth.' :
  gainLossPercent > -5 ? '⚠️ Minor losses - consider reviewing strategy.' :
  '❌ Significant losses - immediate review recommended.'}

Would you like me to analyze specific aspects like risk, diversification, or individual positions?`;
  };

  const generatePerformanceResponse = (): string => {
    const allPositions = [
      ...portfolio.map(p => ({ symbol: p.symbol, gainLoss: p.gainLossPercent, value: p.currentPrice * p.quantity })),
      ...realPortfolio.map(r => ({ symbol: r.symbol, gainLoss: r.unrealizedPnLPercent, value: r.marketValue }))
    ];
    
    const winners = allPositions.filter(p => p.gainLoss > 0).sort((a, b) => b.gainLoss - a.gainLoss);
    const losers = allPositions.filter(p => p.gainLoss < 0).sort((a, b) => a.gainLoss - b.gainLoss);
    
    return `**Performance Analysis:**

🏆 **Top Performers**:
${winners.slice(0, 3).map(w => `• ${w.symbol}: +${w.gainLoss.toFixed(2)}%`).join('\n') || 'No positive performers currently'}

📉 **Underperformers**:
${losers.slice(0, 3).map(l => `• ${l.symbol}: ${l.gainLoss.toFixed(2)}%`).join('\n') || 'No underperformers currently'}

**Performance Insights**:
• **Win Rate**: ${((winners.length / allPositions.length) * 100).toFixed(1)}%
• **Best Performer**: ${winners[0]?.symbol || 'N/A'} (${winners[0]?.gainLoss.toFixed(2) || '0'}%)
• **Worst Performer**: ${losers[0]?.symbol || 'N/A'} (${losers[0]?.gainLoss.toFixed(2) || '0'}%)

**Recommendations**:
${winners.length > losers.length ? 
  '✅ Good stock selection! Consider taking profits on overperformers.' :
  '⚠️ Review underperforming positions and consider rebalancing.'}`;
  };

  const generateRiskAnalysisResponse = (): string => {
    const uniqueSectors = new Set([
      ...portfolio.map(p => getSectorFromSymbol(p.symbol)),
      ...realPortfolio.map(r => getSectorFromSymbol(r.symbol))
    ]).size;
    
    const totalPositions = portfolio.length + realPortfolio.length;
    const diversificationScore = Math.min((uniqueSectors / Math.max(totalPositions, 1)) * 100, 100);
    
    return `**Risk Analysis:**

🎯 **Diversification Score**: ${diversificationScore.toFixed(1)}/100
📊 **Sector Spread**: ${uniqueSectors} different sectors
⚖️ **Position Count**: ${totalPositions} holdings

**Risk Assessment**:
${diversificationScore > 70 ? '✅ Well diversified portfolio with good risk distribution' :
  diversificationScore > 50 ? '⚠️ Moderate diversification - consider adding more sectors' :
  '❌ High concentration risk - diversification needed'}

**Risk Factors**:
• **Concentration Risk**: ${totalPositions < 5 ? 'HIGH' : totalPositions < 10 ? 'MEDIUM' : 'LOW'}
• **Sector Risk**: ${uniqueSectors < 3 ? 'HIGH' : uniqueSectors < 5 ? 'MEDIUM' : 'LOW'}
• **Market Risk**: Standard equity market exposure

**Recommendations**:
${diversificationScore < 60 ? '• Add positions in different sectors\n• Consider defensive stocks or bonds' : '• Maintain current diversification\n• Monitor correlation between holdings'}`;
  };

  const generateRebalancingResponse = (): string => {
    return `**Portfolio Rebalancing Analysis:**

🔄 **Current Allocation Review**:
Based on your holdings, here are optimization suggestions:

**Rebalancing Opportunities**:
• **Overweight Positions**: Consider trimming positions >10% of portfolio
• **Underweight Sectors**: Add exposure to defensive sectors
• **Cash Management**: Maintain 5-10% cash for opportunities

**Optimization Strategy**:
1. **Trim Winners**: Take profits from positions up >20%
2. **Add Defensive**: Include utilities, consumer staples
3. **Geographic Diversification**: Consider international exposure
4. **Size Diversification**: Mix of large, mid, small-cap stocks

**Timing Considerations**:
• **Tax Implications**: Consider holding periods for tax efficiency
• **Market Conditions**: Current market volatility suggests gradual rebalancing
• **Dollar-Cost Averaging**: Implement changes over time

Would you like specific recommendations for any particular holding?`;
  };

  const generateSectorAnalysisResponse = (): string => {
    const sectorAllocation = [...portfolio, ...realPortfolio.map(r => ({ symbol: r.symbol, currentPrice: r.currentPrice, quantity: r.quantity }))]
      .reduce((acc, holding) => {
        const sector = getSectorFromSymbol(holding.symbol);
        const value = holding.currentPrice * holding.quantity;
        acc[sector] = (acc[sector] || 0) + value;
        return acc;
      }, {} as { [key: string]: number });

    const totalValue = Object.values(sectorAllocation).reduce((sum, val) => sum + val, 0);
    
    return `**Sector Allocation Analysis:**

📊 **Current Allocation**:
${Object.entries(sectorAllocation)
  .sort(([,a], [,b]) => b - a)
  .map(([sector, value]) => `• ${sector}: ${((value / totalValue) * 100).toFixed(1)}%`)
  .join('\n')}

**Sector Insights**:
• **Largest Exposure**: ${Object.entries(sectorAllocation).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
• **Sector Count**: ${Object.keys(sectorAllocation).length} sectors
• **Concentration**: ${Object.values(sectorAllocation).some(val => (val / totalValue) > 0.4) ? 'HIGH' : 'BALANCED'}

**Sector Outlook**:
• **Technology**: Strong growth potential with AI trends
• **Healthcare**: Defensive with demographic tailwinds  
• **Financial**: Interest rate sensitive, mixed outlook
• **Energy**: Volatile but transition opportunities

**Recommendations**:
${Object.keys(sectorAllocation).length < 4 ? '• Add exposure to defensive sectors\n• Consider REITs or utilities' : '• Well-diversified sector allocation\n• Monitor sector rotation trends'}`;
  };

  const generateSpecificStockResponse = (symbol: string): string => {
    const simPosition = portfolio.find(p => p.symbol === symbol);
    const realPosition = realPortfolio.find(r => r.symbol === symbol);
    
    if (simPosition) {
      return `**${symbol} Analysis (Simulation Portfolio):**

📊 **Position Details**:
• **Quantity**: ${simPosition.quantity} shares
• **Buy Price**: ${formatCurrency(simPosition.buyPrice, user?.country || 'US')}
• **Current Price**: ${formatCurrency(simPosition.currentPrice, user?.country || 'US')}
• **Market Value**: ${formatCurrency(simPosition.currentPrice * simPosition.quantity, user?.country || 'US')}

📈 **Performance**:
• **P&L**: ${simPosition.gainLoss >= 0 ? '+' : ''}${formatCurrency(simPosition.gainLoss, user?.country || 'US')}
• **Return**: ${simPosition.gainLossPercent.toFixed(2)}%
• **Days Held**: ${Math.floor((Date.now() - simPosition.buyDate.getTime()) / (1000 * 60 * 60 * 24))} days

**Position Assessment**:
${simPosition.gainLossPercent > 10 ? '✅ Strong performer - consider taking profits' :
  simPosition.gainLossPercent > 0 ? '📈 Positive position - monitor for exit signals' :
  simPosition.gainLossPercent > -10 ? '⚠️ Minor loss - hold or average down' :
  '❌ Significant loss - review thesis and consider exit'}

Would you like specific analysis on this stock's fundamentals or technical outlook?`;
    }
    
    if (realPosition) {
      return `**${symbol} Analysis (Real Portfolio):**

📊 **Position Details**:
• **Quantity**: ${realPosition.quantity} shares
• **Average Price**: ${formatCurrency(realPosition.averagePrice, user?.country || 'US')}
• **Current Price**: ${formatCurrency(realPosition.currentPrice, user?.country || 'US')}
• **Market Value**: ${formatCurrency(realPosition.marketValue, user?.country || 'US')}

📈 **Performance**:
• **Unrealized P&L**: ${realPosition.unrealizedPnL >= 0 ? '+' : ''}${formatCurrency(realPosition.unrealizedPnL, user?.country || 'US')}
• **Return**: ${realPosition.unrealizedPnLPercent.toFixed(2)}%

**Real Position Assessment**:
${realPosition.unrealizedPnLPercent > 10 ? '✅ Excellent performance - consider profit-taking strategy' :
  realPosition.unrealizedPnLPercent > 0 ? '📈 Profitable position - monitor for optimal exit' :
  realPosition.unrealizedPnLPercent > -10 ? '⚠️ Small loss - evaluate fundamentals' :
  '❌ Significant loss - urgent review recommended'}

This is a real money position. Consider tax implications and your overall portfolio allocation before making changes.`;
    }
    
    return `I don't see ${symbol} in your current portfolio. Would you like me to analyze this stock for potential investment or provide general information about it?`;
  };

  const generateDefaultPortfolioResponse = (userMessage: string): string => {
    return `I'm here to help with your portfolio! I can assist with:

📊 **Portfolio Analysis**: "How is my portfolio performing?"
⚖️ **Risk Assessment**: "What's my portfolio risk level?"
🔄 **Rebalancing**: "Should I rebalance my portfolio?"
📈 **Performance**: "Show me my best and worst performers"
🏢 **Sector Analysis**: "How is my sector allocation?"
💡 **Stock Research**: Ask about any specific stock like "Tell me about AAPL"

You asked: "${userMessage}"

Could you be more specific about what aspect of your portfolio you'd like me to analyze? I have access to all your holdings and can provide detailed insights.`;
  };

  const getSectorFromSymbol = (symbol: string): string => {
    const sectors: { [key: string]: string } = {
      'AAPL': 'Technology', 'GOOGL': 'Technology', 'MSFT': 'Technology',
      'TSLA': 'Automotive', 'AMZN': 'Consumer', 'META': 'Technology',
      'NVDA': 'Technology', 'NFLX': 'Entertainment'
    };
    return sectors[symbol] || 'Other';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSuggestedQuestions = (): string[] => {
    if (mode === 'stock' && stock) {
      return [
        "What's your analysis of this stock?",
        "Should I buy this stock now?",
        "What are the risks involved?",
        "How does this compare to competitors?",
        "What's the price target?"
      ];
    } else {
      return [
        "How is my portfolio performing?",
        "What's my risk level?",
        "Should I rebalance my portfolio?",
        "Which are my best performers?",
        "How's my sector allocation?"
      ];
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="bg-white/20 rounded-full p-2"
          >
            <Bot className="text-white" size={20} />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-white font-bold">
              {mode === 'stock' ? 'DeepSeek AI Stock Assistant' : 'DeepSeek AI Portfolio Advisor'}
            </h3>
            <p className="text-white/80 text-sm">
              {mode === 'stock' && stock ? `Ask me about ${stock.symbol}` : 'Your personal investment advisor'}
            </p>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="text-yellow-300" size={20} />
          </motion.div>
          {onClose && (
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="text-white" size={20} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100% - 200px)' }}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 flex-shrink-0">
                  <Bot size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <motion.div
                  className={`p-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-line">{message.content}</div>
                </motion.div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-3">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2 flex-shrink-0 order-2">
                  <User size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="bg-purple-100 dark:bg-purple-900 rounded-full p-2 flex-shrink-0">
              <Bot size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" color="dark" />
                <span className="text-sm text-gray-600 dark:text-gray-400">DeepSeek AI is analyzing...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-4 flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {getSuggestedQuestions().map((question, index) => (
              <motion.button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {question}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input - Fixed at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={mode === 'stock' ? "Ask me about this stock..." : "Ask me about your portfolio..."}
            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            rows={1}
            disabled={loading}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className="p-2 bg-purple-600 hover:bg-purple-500 text-white"
              size="sm"
            >
              <Send size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};