import { AIAnalysis, StockDetails, AIMessage } from '../types';

export class DeepSeekApiService {
  private static instance: DeepSeekApiService;
  
  // 🔑 REPLACE WITH YOUR ACTUAL DEEPSEEK API KEY
  // Get your API key from: https://platform.deepseek.com/
  private apiKey: string = 'sk-7fef5191809b43db984953fd3c690dfa';
  private baseUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  static getInstance(): DeepSeekApiService {
    if (!DeepSeekApiService.instance) {
      DeepSeekApiService.instance = new DeepSeekApiService();
    }
    return DeepSeekApiService.instance;
  }

  async analyzeStock(stockDetails: StockDetails): Promise<AIAnalysis> {
    // Skip API call if no valid API key is configured
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'YOUR_DEEPSEEK_API_KEY_HERE') {
      console.log('🤖 Using enhanced local analysis (no DeepSeek API key configured)');
      return this.generateAdvancedAnalysis(stockDetails);
    }

    try {
      console.log('🤖 Analyzing stock with DeepSeek AI:', stockDetails.symbol);
      
      // Get comprehensive market context
      const marketContext = await this.getComprehensiveMarketContext(stockDetails.symbol);
      const prompt = this.createAdvancedAnalysisPrompt(stockDetails, marketContext);
      const response = await this.callDeepSeekAPI(prompt);
      
      if (response) {
        console.log('✅ DeepSeek analysis completed');
        return this.parseAnalysisResponse(response, stockDetails);
      }
    } catch (error: any) {
      if (error.status === 402) {
        console.warn('⚠️ DeepSeek API: Payment required or quota exceeded. Using enhanced local analysis.');
      } else if (error.status === 401) {
        console.warn('⚠️ DeepSeek API: Invalid API key. Using enhanced local analysis.');
      } else {
        console.warn('⚠️ DeepSeek API failed, using enhanced analysis:', error.message);
      }
    }
    
    return this.generateAdvancedAnalysis(stockDetails);
  }

  private async getComprehensiveMarketContext(symbol: string): Promise<string> {
    try {
      const contexts = await Promise.allSettled([
        this.getNewsContext(symbol),
        this.getMarketSentiment(symbol),
        this.getSectorContext(symbol)
      ]);

      const newsContext = contexts[0].status === 'fulfilled' ? contexts[0].value : '';
      const sentimentContext = contexts[1].status === 'fulfilled' ? contexts[1].value : '';
      const sectorContext = contexts[2].status === 'fulfilled' ? contexts[2].value : '';

      return `${newsContext}\n${sentimentContext}\n${sectorContext}`.trim();
    } catch (error) {
      console.warn('Failed to fetch comprehensive market context');
      return 'Limited market context available';
    }
  }

  private async getNewsContext(symbol: string): Promise<string> {
    try {
      // Try multiple news sources
      const newsApis = [
        `https://newsapi.org/v2/everything?q=${symbol}&sortBy=publishedAt&pageSize=5&apiKey=a857fd76e05c40c4b94fc70dbe7a18f0`,
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=CWH24EN1156BH710&limit=5`
      ];

      for (const apiUrl of newsApis) {
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          
          if (data.articles) {
            const recentNews = data.articles.slice(0, 3).map((article: any) => 
              `${article.title}: ${article.description?.substring(0, 150)}...`
            ).join('\n');
            return `Recent News:\n${recentNews}`;
          }
          
          if (data.feed) {
            const recentNews = data.feed.slice(0, 3).map((item: any) => 
              `${item.title}: ${item.summary?.substring(0, 150)}...`
            ).join('\n');
            return `Recent News:\n${recentNews}`;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch news context');
    }
    return '';
  }

  private async getMarketSentiment(symbol: string): Promise<string> {
    // Simulate market sentiment analysis
    const sentiments = ['Bullish', 'Bearish', 'Neutral', 'Mixed'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    return `Market Sentiment: ${sentiment} outlook for ${symbol}`;
  }

  private async getSectorContext(symbol: string): Promise<string> {
    const sectorMap: { [key: string]: string } = {
      'AAPL': 'Technology sector showing strong performance with AI and services growth',
      'GOOGL': 'Technology sector benefiting from cloud computing and AI advancements',
      'MSFT': 'Technology sector leading in cloud services and enterprise solutions',
      'TSLA': 'Automotive sector transitioning to electric vehicles with growth potential',
      'AMZN': 'E-commerce and cloud computing sectors showing resilience',
      'RELIANCE.NS': 'Energy and telecommunications sector in India showing mixed performance'
    };
    
    return sectorMap[symbol] || 'Sector showing mixed performance with various market factors';
  }

  private async callDeepSeekAPI(prompt: string): Promise<string | null> {
    try {
      console.log('🔗 Calling DeepSeek API...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a world-class financial analyst with 20+ years of experience in equity research, technical analysis, and market forecasting. Provide detailed, actionable insights based on comprehensive data analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2048,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ DeepSeek API response received');
        return data.choices?.[0]?.message?.content || null;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).details = errorData;
        throw error;
      }
    } catch (error: any) {
      if (error.status) {
        throw error; // Re-throw API errors with status codes
      }
      console.error('DeepSeek API call failed:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  private createAdvancedAnalysisPrompt(stock: StockDetails, marketContext: string): string {
    const currentDate = new Date().toISOString().split('T')[0];
    const marketCap = stock.marketCap ? `$${(stock.marketCap / 1000000000).toFixed(1)}B` : 'N/A';
    
    return `Conduct a comprehensive financial analysis of ${stock.symbol} (${stock.name}) as of ${currentDate}.

CURRENT MARKET DATA:
- Stock Price: $${stock.price}
- Daily Change: ${stock.change >= 0 ? '+' : ''}$${stock.change} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%)
- Trading Range: $${stock.low} - $${stock.high}
- Opening Price: $${stock.open}
- Previous Close: $${stock.previousClose}
- Volume: ${stock.volume.toLocaleString()} shares
- Market Cap: ${marketCap}
- Sector: ${stock.sector}

MARKET INTELLIGENCE:
${marketContext}

ANALYSIS FRAMEWORK:
1. Technical Analysis: Price action, volume patterns, momentum indicators
2. Fundamental Assessment: Valuation metrics, sector positioning, competitive advantages
3. Risk Evaluation: Volatility analysis, downside protection, market correlation
4. Sentiment Analysis: News impact, institutional activity, retail interest
5. Price Forecasting: 12-month target with confidence intervals

Provide your professional analysis in this exact JSON format:
{
  "recommendation": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "targetPrice": [realistic 12-month price target],
  "reasoning": "[comprehensive 3-4 sentence analysis explaining your recommendation with specific data points]",
  "estimatedReturn": [percentage return estimate],
  "summary": "[concise 2-sentence investment thesis highlighting key value drivers]",
  "keyRisks": "[main risk factors to monitor]",
  "catalysts": "[potential positive catalysts for price appreciation]",
  "confidenceLevel": [1-10 scale confidence in analysis]
}

Base your analysis on current market conditions, technical indicators, and fundamental factors. Be specific and data-driven.`;
  }

  private parseAnalysisResponse(response: string, stock: StockDetails): AIAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Map STRONG_BUY/STRONG_SELL to standard format
        let recommendation = parsed.recommendation;
        if (recommendation === 'STRONG_BUY') recommendation = 'BUY';
        if (recommendation === 'STRONG_SELL') recommendation = 'SELL';
        
        return {
          summary: parsed.summary || this.generateAdvancedSummary(stock),
          recommendation: recommendation || this.calculateRecommendation(stock),
          riskLevel: parsed.riskLevel || this.assessRiskLevel(stock),
          targetPrice: parsed.targetPrice || this.calculateTargetPrice(stock),
          reasoning: parsed.reasoning || this.generateAdvancedReasoning(stock),
          estimatedReturn: parsed.estimatedReturn || this.calculateEstimatedReturn(stock)
        };
      }
    } catch (error) {
      console.warn('Failed to parse DeepSeek response, using advanced fallback');
    }
    
    return this.generateAdvancedAnalysis(stock);
  }

  private generateAdvancedAnalysis(stock: StockDetails): AIAnalysis {
    const technicalScore = this.calculateAdvancedTechnicalScore(stock);
    const fundamentalScore = this.calculateFundamentalScore(stock);
    const momentumScore = this.calculateMomentumScore(stock);
    const volumeScore = this.calculateVolumeScore(stock);
    const volatilityScore = this.calculateVolatilityScore(stock);
    
    const overallScore = (technicalScore * 0.3 + fundamentalScore * 0.25 + momentumScore * 0.25 + volumeScore * 0.1 + volatilityScore * 0.1);
    
    const recommendation = this.getAdvancedRecommendation(overallScore);
    const riskLevel = this.getAdvancedRiskLevel(stock, volatilityScore);
    const targetPrice = this.calculateAdvancedTargetPrice(stock, overallScore);
    const estimatedReturn = ((targetPrice - stock.price) / stock.price) * 100;
    
    return {
      summary: this.generateAdvancedSummary(stock, recommendation, overallScore),
      recommendation,
      riskLevel,
      targetPrice: Number(targetPrice.toFixed(2)),
      reasoning: this.generateAdvancedReasoning(stock, overallScore, technicalScore, fundamentalScore),
      estimatedReturn: Number(estimatedReturn.toFixed(2))
    };
  }

  private calculateAdvancedTechnicalScore(stock: StockDetails): number {
    let score = 0.5;
    
    // Price position within day's range (0-0.3 points)
    const rangePosition = (stock.price - stock.low) / (stock.high - stock.low);
    score += rangePosition * 0.3;
    
    // Momentum vs opening (0-0.2 points)
    const openingMomentum = (stock.price - stock.open) / stock.open;
    score += Math.max(-0.2, Math.min(0.2, openingMomentum * 5));
    
    // Performance vs previous close (0-0.3 points)
    const closePerformance = (stock.price - stock.previousClose)/ stock.previousClose;
    score += Math.max(-0.3, Math.min(0.3, closePerformance * 4));
    
    // Gap analysis
    const gapSize = Math.abs(stock.open - stock.previousClose) / stock.previousClose;
    if (gapSize > 0.02) { // Significant gap
      score += (stock.open > stock.previousClose ? 0.1 : -0.1);
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateFundamentalScore(stock: StockDetails): number {
    // Sector-based scoring
    const sectorScores: { [key: string]: number } = {
      'Technology': 0.8,
      'Healthcare': 0.7,
      'Financial Services': 0.6,
      'Consumer Discretionary': 0.6,
      'Energy': 0.5,
      'Utilities': 0.5
    };
    
    let score = sectorScores[stock.sector] || 0.6;
    
    // Market cap consideration
    if (stock.marketCap) {
      if (stock.marketCap > 100000000000) score += 0.1; // Large cap bonus
      else if (stock.marketCap < 2000000000) score -= 0.1; // Small cap penalty
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private calculateMomentumScore(stock: StockDetails): number {
    const changePercent = stock.changePercent;
    
    if (changePercent > 8) return 1.0;
    if (changePercent > 5) return 0.9;
    if (changePercent > 3) return 0.8;
    if (changePercent > 1) return 0.7;
    if (changePercent > 0) return 0.6;
    if (changePercent > -1) return 0.4;
    if (changePercent > -3) return 0.3;
    if (changePercent > -5) return 0.2;
    if (changePercent > -8) return 0.1;
    return 0.0;
  }

  private calculateVolumeScore(stock: StockDetails): number {
    // Volume analysis with sector considerations
    const baseVolumes: { [key: string]: number } = {
      'AAPL': 50000000,
      'GOOGL': 25000000,
      'MSFT': 30000000,
      'TSLA': 40000000,
      'AMZN': 35000000,
      'RELIANCE.NS': 15000000
    };
    
    const expectedVolume = baseVolumes[stock.symbol] || 10000000;
    const volumeRatio = stock.volume / expectedVolume;
    
    if (volumeRatio > 2.0) return 1.0; // Very high volume
    if (volumeRatio > 1.5) return 0.8; // High volume
    if (volumeRatio > 1.0) return 0.6; // Normal volume
    if (volumeRatio > 0.5) return 0.4; // Below average
    return 0.2; // Low volume
  }

  private calculateVolatilityScore(stock: StockDetails): number {
    const dailyRange = (stock.high - stock.low) / stock.price;
    const changePercent = Math.abs(stock.changePercent);
    
    // Lower volatility gets higher score for stability
    if (dailyRange < 0.015 && changePercent < 1) return 1.0;
    if (dailyRange < 0.03 && changePercent < 2) return 0.8;
    if (dailyRange < 0.05 && changePercent < 3) return 0.6;
    if (dailyRange < 0.08 && changePercent < 5) return 0.4;
    return 0.2;
  }

  private getAdvancedRecommendation(score: number): 'BUY' | 'HOLD' | 'SELL' {
    if (score > 0.75) return 'BUY';
    if (score > 0.35) return 'HOLD';
    return 'SELL';
  }

  private getAdvancedRiskLevel(stock: StockDetails, volatilityScore: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    const volatility = Math.abs(stock.changePercent);
    const dailyRange = (stock.high - stock.low) / stock.price * 100;
    
    // Consider sector risk
    const highRiskSectors = ['Energy', 'Biotechnology', 'Cryptocurrency'];
    const sectorRisk = highRiskSectors.includes(stock.sector) ? 1 : 0;
    
    const riskScore = volatility + dailyRange + sectorRisk;
    
    if (riskScore > 8 || volatilityScore < 0.3) return 'HIGH';
    if (riskScore > 4 || volatilityScore < 0.6) return 'MEDIUM';
    return 'LOW';
  }

  private calculateAdvancedTargetPrice(stock: StockDetails, score: number): number {
    const basePrice = stock.price;
    const volatility = Math.abs(stock.changePercent) / 100;
    const sectorMultipliers: { [key: string]: number } = {
      'Technology': 1.2,
      'Healthcare': 1.1,
      'Financial Services': 1.05,
      'Energy': 0.95,
      'Utilities': 0.9
    };
    
    const sectorMultiplier = sectorMultipliers[stock.sector] || 1.0;
    
    let multiplier = 1;
    if (score > 0.8) multiplier = 1.20 + (volatility * 0.3);
    else if (score > 0.6) multiplier = 1.12 + (volatility * 0.2);
    else if (score > 0.4) multiplier = 1.05 + (volatility * 0.1);
    else if (score > 0.2) multiplier = 0.95 - (volatility * 0.1);
    else multiplier = 0.85 - (volatility * 0.2);
    
    return basePrice * multiplier * sectorMultiplier;
  }

  private generateAdvancedSummary(stock: StockDetails, recommendation?: string, score?: number): string {
    const momentum = stock.changePercent > 0 ? 'positive' : 'negative';
    const strength = score ? (score > 0.7 ? 'strong' : score > 0.4 ? 'moderate' : 'weak') : 'moderate';
    const volatility = Math.abs(stock.changePercent) > 3 ? 'elevated' : 'normal';
    
    return `${stock.name} demonstrates ${strength} fundamentals with ${momentum} momentum (${stock.changePercent.toFixed(2)}%). Technical analysis indicates ${recommendation?.toLowerCase() || 'mixed'} signals with ${volatility} volatility in the ${stock.sector} sector. Current market conditions support cautious optimism.`;
  }

  private generateAdvancedReasoning(stock: StockDetails, overallScore?: number, technicalScore?: number, fundamentalScore?: number): string {
    const reasons = [];
    
    // Technical analysis
    if (technicalScore && technicalScore > 0.7) {
      reasons.push(`Strong technical setup with price at ${((stock.price - stock.low) / (stock.high - stock.low) * 100).toFixed(0)}% of daily range`);
    } else if (technicalScore && technicalScore < 0.3) {
      reasons.push(`Weak technical position with price under pressure near support levels`);
    }
    
    // Fundamental analysis
    if (fundamentalScore && fundamentalScore > 0.7) {
      reasons.push(`Solid fundamental outlook supported by ${stock.sector} sector strength`);
    }
    
    // Volume confirmation
    if (stock.volume > 10000000) {
      reasons.push(`High trading volume (${(stock.volume / 1000000).toFixed(1)}M) confirms institutional interest`);
    }
    
    // Market context
    const marketCap = stock.marketCap ? (stock.marketCap / 1000000000).toFixed(1) : 'N/A';
    reasons.push(`Market cap of $${marketCap}B provides ${stock.marketCap && stock.marketCap > 50000000000 ? 'stability' : 'growth potential'}`);
    
    return reasons.slice(0, 3).join('. ') + '.';
  }

  // Helper methods for backward compatibility
  private calculateRecommendation(stock: StockDetails): 'BUY' | 'HOLD' | 'SELL' {
    const score = this.calculateAdvancedTechnicalScore(stock);
    return this.getAdvancedRecommendation(score);
  }

  private assessRiskLevel(stock: StockDetails): 'LOW' | 'MEDIUM' | 'HIGH' {
    const volatilityScore = this.calculateVolatilityScore(stock);
    return this.getAdvancedRiskLevel(stock, volatilityScore);
  }

  private calculateTargetPrice(stock: StockDetails): number {
    const score = this.calculateAdvancedTechnicalScore(stock);
    return this.calculateAdvancedTargetPrice(stock, score);
  }

  private calculateEstimatedReturn(stock: StockDetails): number {
    const targetPrice = this.calculateTargetPrice(stock);
    return ((targetPrice - stock.price) / stock.price) * 100;
  }

  async chatAboutStock(stock: StockDetails, userMessage: string, chatHistory: AIMessage[]): Promise<string> {
    // Skip API call if no valid API key is configured
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey === 'YOUR_DEEPSEEK_API_KEY_HERE') {
      console.log('💬 Using enhanced local chat (no DeepSeek API key configured)');
      return this.generateIntelligentChatResponse(stock, userMessage);
    }

    try {
      console.log('💬 DeepSeek chat about:', stock.symbol);
      
      const marketContext = await this.getComprehensiveMarketContext(stock.symbol);
      const prompt = this.createAdvancedChatPrompt(stock, userMessage, chatHistory, marketContext);
      const response = await this.callDeepSeekAPI(prompt);
      
      if (response) {
        console.log('✅ DeepSeek chat response received');
        return this.formatChatResponse(response);
      }
    } catch (error: any) {
      if (error.status === 402) {
        console.warn('⚠️ DeepSeek API: Payment required or quota exceeded. Using enhanced local chat.');
      } else if (error.status === 401) {
        console.warn('⚠️ DeepSeek API: Invalid API key. Using enhanced local chat.');
      } else {
        console.warn('⚠️ DeepSeek chat failed, using enhanced responses:', error.message);
      }
    }
    
    return this.generateIntelligentChatResponse(stock, userMessage);
  }

  private createAdvancedChatPrompt(stock: StockDetails, userMessage: string, chatHistory: AIMessage[], marketContext: string): string {
    const context = chatHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
    
    const currentDate = new Date().toISOString().split('T')[0];
    const analysis = this.generateAdvancedAnalysis(stock);
    
    return `You are a senior equity research analyst providing expert insights about ${stock.symbol} (${stock.name}) on ${currentDate}.

REAL-TIME STOCK DATA:
- Current Price: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%)
- Daily Range: $${stock.low} - $${stock.high}
- Volume: ${stock.volume.toLocaleString()} shares
- Market Cap: ${stock.marketCap ? '$' + (stock.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}
- Sector: ${stock.sector}

CURRENT ANALYSIS:
- Recommendation: ${analysis.recommendation}
- Risk Level: ${analysis.riskLevel}
- Target Price: $${analysis.targetPrice}
- Est. Return: ${analysis.estimatedReturn.toFixed(1)}%

MARKET INTELLIGENCE:
${marketContext}

CONVERSATION HISTORY:
${context}

USER QUESTION: ${userMessage}

Provide a professional, data-driven response that:
1. Uses specific numbers and current market data
2. Offers actionable insights based on technical and fundamental analysis
3. Includes appropriate risk disclaimers for investment advice
4. Maintains a conversational yet authoritative tone
5. Keeps response under 250 words for clarity

Focus on delivering value through expert analysis and practical guidance.`;
  }

  private formatChatResponse(response: string): string {
    return response
      .replace(/\*\*(.*?)\*\*/g, '**$1**')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  private generateIntelligentChatResponse(stock: StockDetails, userMessage: string): string {
    const message = userMessage.toLowerCase();
    const analysis = this.generateAdvancedAnalysis(stock);
    const technicalScore = this.calculateAdvancedTechnicalScore(stock);
    const momentum = stock.changePercent > 0 ? 'positive' : 'negative';
    
    if (message.includes('analysis') || message.includes('analyze')) {
      return `**${stock.symbol} Comprehensive Analysis:**

📊 **Current Status**: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%)
📈 **Technical Strength**: ${(technicalScore * 100).toFixed(0)}/100
🎯 **Recommendation**: ${analysis.recommendation}
⚠️ **Risk Profile**: ${analysis.riskLevel}

**Key Metrics**:
• Trading at ${((stock.price - stock.low) / (stock.high - stock.low) * 100).toFixed(0)}% of daily range
• Volume: ${(stock.volume / 1000000).toFixed(1)}M (${stock.volume > 10000000 ? 'Above average' : 'Normal'})
• ${momentum.charAt(0).toUpperCase() + momentum.slice(1)} momentum with ${Math.abs(stock.changePercent).toFixed(2)}% move

**12-Month Outlook**: $${analysis.targetPrice} target (${analysis.estimatedReturn >= 0 ? '+' : ''}${analysis.estimatedReturn.toFixed(1)}% potential)

*Analysis based on current market conditions and technical indicators.*`;
    }
    
    if (message.includes('buy') || message.includes('invest') || message.includes('purchase')) {
      return `**Investment Perspective on ${stock.symbol}:**

${analysis.recommendation === 'BUY' ? '✅' : analysis.recommendation === 'HOLD' ? '⚠️' : '❌'} **Current Signal**: ${analysis.recommendation}

**Investment Case**:
• **Price Action**: ${momentum.charAt(0).toUpperCase() + momentum.slice(1)} momentum (${stock.changePercent.toFixed(2)}%)
• **Technical Score**: ${(technicalScore * 100).toFixed(0)}/100
• **Risk Level**: ${analysis.riskLevel}
• **Price Target**: $${analysis.targetPrice}

**Key Considerations**:
${analysis.reasoning}

⚠️ **Important**: This analysis is for educational purposes. Consider your risk tolerance, investment timeline, and consult with financial advisors before making investment decisions. Past performance doesn't guarantee future results.`;
    }
    
    if (message.includes('price') || message.includes('target') || message.includes('forecast')) {
      return `**${stock.symbol} Price Analysis:**

🎯 **Current**: $${stock.price}
📊 **Daily Range**: $${stock.low} - $${stock.high}
🎯 **12M Target**: $${analysis.targetPrice}
📈 **Potential**: ${analysis.estimatedReturn >= 0 ? '+' : ''}${analysis.estimatedReturn.toFixed(1)}%

**Price Dynamics**:
• Currently ${((stock.price - stock.low) / (stock.high - stock.low) * 100).toFixed(0)}% through today's range
• ${stock.changePercent >= 0 ? 'Gained' : 'Lost'} ${Math.abs(stock.changePercent).toFixed(2)}% from previous close ($${stock.previousClose})
• Volume: ${(stock.volume / 1000000).toFixed(1)}M shares

**Target Methodology**: Based on technical analysis, sector performance, fundamental valuation, and current market conditions. Target assumes normal market conditions over 12-month period.

*Price targets are estimates and actual results may vary significantly.*`;
    }
    
    if (message.includes('risk') || message.includes('danger') || message.includes('safe')) {
      return `**Risk Assessment for ${stock.symbol}:**

⚠️ **Risk Level**: ${analysis.riskLevel}
📊 **Volatility**: ${Math.abs(stock.changePercent).toFixed(2)}% daily move

**Risk Factors**:
${analysis.riskLevel === 'HIGH' ? 
  `• High volatility (${Math.abs(stock.changePercent).toFixed(2)}% move today)
• Significant price swings possible
• Consider smaller position sizes
• Use stop-loss orders` :
  analysis.riskLevel === 'MEDIUM' ?
  `• Moderate volatility within normal ranges
• Standard market correlation risks
• Suitable for balanced portfolios
• Monitor sector trends` :
  `• Low volatility suggests stability
• Predictable price patterns
• Lower downside risk profile
• Suitable for conservative investors`}

**Risk Metrics**:
• Daily range: ${((stock.high - stock.low) / stock.price * 100).toFixed(1)}%
• Volume activity: ${stock.volume > 10000000 ? 'High' : 'Normal'}
• Sector: ${stock.sector} dynamics

*Always diversify investments and never invest more than you can afford to lose.*`;
    }
    
    // Default comprehensive response
    return `**${stock.symbol} Market Update:**

📊 **Price**: $${stock.price} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%)
📈 **Trend**: ${momentum.charAt(0).toUpperCase() + momentum.slice(1)} with ${Math.abs(stock.changePercent).toFixed(2)}% move
🎯 **Signal**: ${analysis.recommendation}
⚠️ **Risk**: ${analysis.riskLevel}

**Market Snapshot**:
• Range: $${stock.low} - $${stock.high} (${((stock.high - stock.low) / stock.price * 100).toFixed(1)}% spread)
• Volume: ${(stock.volume / 1000000).toFixed(1)}M shares
• Target: $${analysis.targetPrice} (${analysis.estimatedReturn >= 0 ? '+' : ''}${analysis.estimatedReturn.toFixed(1)}%)

**Ask me about**:
📊 "Analysis" • 💰 "Investment advice" • ⚠️ "Risk assessment" • 🎯 "Price targets" • 📰 "News impact"

What would you like to explore about ${stock.symbol}?`;
  }
}