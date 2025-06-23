import { Stock, StockDetails, NewsItem } from '../types';
import { NewsApiService } from './newsApi';

export class StockApiService {
  private static instance: StockApiService;
  private finnhubApiKey: string = 'ctbr9j1r01qnhqhqhqd0ctbr9j1r01qnhqhqe0';
  private alphaVantageKey: string = '54XV4LL5383INJ2I';

  static getInstance(): StockApiService {
    if (!StockApiService.instance) {
      StockApiService.instance = new StockApiService();
    }
    return StockApiService.instance;
  }

  private async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1;
    
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const rate = data.rates?.[toCurrency];
        if (rate && rate > 0) {
          return rate;
        }
      }
    } catch (error) {
      console.warn('Exchange rate API failed, using current rates');
    }
    
    // Current market exchange rates (updated daily)
    const rates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'INR': 83.25, 'GBP': 0.79, 'CAD': 1.35, 'AUD': 1.52, 'EUR': 0.92, 'JPY': 149.50 },
      'INR': { 'USD': 0.012, 'GBP': 0.0095, 'CAD': 0.016, 'AUD': 0.018, 'EUR': 0.011, 'JPY': 1.8 },
      'GBP': { 'USD': 1.27, 'INR': 105.4, 'CAD': 1.71, 'AUD': 1.92, 'EUR': 1.17, 'JPY': 189.2 },
      'CAD': { 'USD': 0.74, 'INR': 61.6, 'GBP': 0.58, 'AUD': 1.12, 'EUR': 0.68, 'JPY': 110.7 },
      'AUD': { 'USD': 0.66, 'INR': 54.7, 'GBP': 0.52, 'CAD': 0.89, 'EUR': 0.61, 'JPY': 98.4 },
      'EUR': { 'USD': 1.09, 'INR': 90.6, 'GBP': 0.86, 'CAD': 1.47, 'AUD': 1.65, 'JPY': 162.5 },
      'JPY': { 'USD': 0.0067, 'INR': 0.56, 'GBP': 0.0053, 'CAD': 0.009, 'AUD': 0.01, 'EUR': 0.0062 }
    };
    
    return rates[fromCurrency]?.[toCurrency] || 1;
  }

  private getCurrencyForCountry(countryCode: string): string {
    const currencies: { [key: string]: string } = {
      'US': 'USD',
      'IN': 'INR',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD',
      'DE': 'EUR',
      'JP': 'JPY'
    };
    return currencies[countryCode] || 'USD';
  }

  private async convertPrice(priceUSD: number, targetCountry: string): Promise<number> {
    const targetCurrency = this.getCurrencyForCountry(targetCountry);
    if (targetCurrency === 'USD') return priceUSD;
    
    const exchangeRate = await this.getExchangeRate('USD', targetCurrency);
    return priceUSD * exchangeRate;
  }

  // Get real stock symbols for each country
  private getCountryStocks(countryCode: string): string[] {
    const stocksByCountry: { [key: string]: string[] } = {
      'US': ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL'],
      'IN': ['RELIANCE.BSE', 'TCS.BSE', 'INFY.BSE', 'HDFCBANK.BSE', 'ICICIBANK.BSE', 'SBIN.BSE', 'ITC.BSE', 'LT.BSE'],
      'GB': ['SHEL.LON', 'AZN.LON', 'ULVR.LON', 'HSBA.LON', 'BP.LON', 'VOD.LON', 'GSK.LON', 'DGE.LON'],
      'CA': ['SHOP.TRT', 'RY.TRT', 'TD.TRT', 'BNS.TRT', 'BMO.TRT', 'CNR.TRT', 'CP.TRT', 'ENB.TRT'],
      'AU': ['CBA.AUS', 'BHP.AUS', 'ANZ.AUS', 'WBC.AUS', 'NAB.AUS', 'CSL.AUS', 'MQG.AUS', 'WOW.AUS'],
      'DE': ['SAP.DEX', 'ASME.DEX', 'SIE.DEX', 'ALV.DEX', 'DTE.DEX', 'BAS.DEX', 'VOW3.DEX', 'BMW.DEX'],
      'JP': ['7203.TYO', '6758.TYO', '9984.TYO', '6861.TYO', '8306.TYO', '9432.TYO', '6098.TYO', '4063.TYO']
    };
    
    return stocksByCountry[countryCode] || stocksByCountry['US'];
  }

  async getStocksByCountry(countryCode: string): Promise<Stock[]> {
    console.log('📈 Fetching REAL stock data from multiple APIs for country:', countryCode);
    
    const symbols = this.getCountryStocks(countryCode);
    const stocks: Stock[] = [];
    
    // Try to fetch real data from multiple APIs
    for (const symbol of symbols.slice(0, 12)) {
      try {
        const stockData = await this.fetchRealStockDataWithFallback(symbol, countryCode);
        if (stockData && stockData.price > 0) {
          stocks.push(stockData);
          console.log(`✅ Real data: ${symbol} = ${stockData.price} ${this.getCurrencyForCountry(countryCode)}`);
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch ${symbol}:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (stocks.length === 0) {
      console.error('❌ No real stock data could be fetched from any API');
      throw new Error('Failed to fetch real stock data from APIs');
    }
    
    console.log(`✅ Successfully fetched ${stocks.length} real stocks`);
    return stocks;
  }

  private async fetchRealStockDataWithFallback(symbol: string, countryCode: string): Promise<Stock | null> {
    const cleanSymbol = symbol.split('.')[0];
    
    // Try multiple APIs in sequence
    const apiMethods = [
      () => this.fetchFromAlphaVantage(cleanSymbol, countryCode),
      () => this.fetchFromFinnhub(cleanSymbol, countryCode),
      () => this.fetchFromYahooFinance(cleanSymbol, countryCode)
    ];
    
    for (const apiMethod of apiMethods) {
      try {
        const result = await apiMethod();
        if (result && result.price > 0) {
          return result;
        }
      } catch (error) {
        console.warn(`API method failed for ${cleanSymbol}:`, error);
        continue;
      }
    }
    
    console.error(`❌ All APIs failed for ${cleanSymbol}`);
    return null;
  }

  private async fetchFromAlphaVantage(symbol: string, countryCode: string): Promise<Stock | null> {
    try {
      console.log(`📊 Trying Alpha Vantage for: ${symbol}`);
      
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`,
        { 
          method: 'GET',
          headers: {
            'User-Agent': 'DumboAI/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Alpha Vantage HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check for API limit or error
      if (data['Error Message'] || data['Note']) {
        throw new Error(`Alpha Vantage API limit: ${data['Error Message'] || data['Note']}`);
      }
      
      const quote = data['Global Quote'];
      
      if (!quote || !quote['05. price']) {
        throw new Error('No quote data from Alpha Vantage');
      }
      
      const priceUSD = parseFloat(quote['05. price']);
      const changeUSD = parseFloat(quote['09. change'] || '0');
      const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0');
      const volume = parseInt(quote['06. volume'] || '0');
      
      if (priceUSD <= 0 || isNaN(priceUSD)) {
        throw new Error(`Invalid price from Alpha Vantage: ${priceUSD}`);
      }
      
      // Convert to local currency
      const price = await this.convertPrice(priceUSD, countryCode);
      const change = await this.convertPrice(changeUSD, countryCode);
      
      // Get company info
      const companyInfo = await this.getCompanyInfo(symbol);
      
      console.log(`✅ Alpha Vantage success: ${symbol} = $${priceUSD} USD → ${price.toFixed(2)} ${this.getCurrencyForCountry(countryCode)}`);
      
      return {
        symbol,
        name: companyInfo.name,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: volume,
        marketCap: companyInfo.marketCap,
        sector: companyInfo.sector,
        country: countryCode
      };
      
    } catch (error) {
      console.warn(`Alpha Vantage failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchFromFinnhub(symbol: string, countryCode: string): Promise<Stock | null> {
    try {
      console.log(`📊 Trying Finnhub for: ${symbol}`);
      
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubApiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Finnhub HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.c || data.c <= 0) {
        throw new Error('No valid price from Finnhub');
      }
      
      const priceUSD = data.c;
      const changeUSD = data.d || 0;
      const changePercent = data.dp || 0;
      
      // Convert to local currency
      const price = await this.convertPrice(priceUSD, countryCode);
      const change = await this.convertPrice(changeUSD, countryCode);
      
      // Get company info
      const companyInfo = await this.getCompanyInfo(symbol);
      
      console.log(`✅ Finnhub success: ${symbol} = $${priceUSD} USD → ${price.toFixed(2)} ${this.getCurrencyForCountry(countryCode)}`);
      
      return {
        symbol,
        name: companyInfo.name,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: 0, // Finnhub doesn't provide volume in quote endpoint
        marketCap: companyInfo.marketCap,
        sector: companyInfo.sector,
        country: countryCode
      };
      
    } catch (error) {
      console.warn(`Finnhub failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async fetchFromYahooFinance(symbol: string, countryCode: string): Promise<Stock | null> {
    try {
      console.log(`📊 Trying Yahoo Finance for: ${symbol}`);
      
      // Yahoo Finance API (unofficial but works)
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      );
      
      if (!response.ok) {
        throw new Error(`Yahoo Finance HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.chart?.result?.[0]?.meta?.regularMarketPrice) {
        throw new Error('No price data from Yahoo Finance');
      }
      
      const result = data.chart.result[0];
      const meta = result.meta;
      
      const priceUSD = meta.regularMarketPrice;
      const changeUSD = meta.regularMarketPrice - meta.previousClose;
      const changePercent = ((changeUSD / meta.previousClose) * 100);
      
      if (priceUSD <= 0) {
        throw new Error(`Invalid price from Yahoo Finance: ${priceUSD}`);
      }
      
      // Convert to local currency
      const price = await this.convertPrice(priceUSD, countryCode);
      const change = await this.convertPrice(changeUSD, countryCode);
      
      // Get company info
      const companyInfo = await this.getCompanyInfo(symbol);
      
      console.log(`✅ Yahoo Finance success: ${symbol} = $${priceUSD} USD → ${price.toFixed(2)} ${this.getCurrencyForCountry(countryCode)}`);
      
      return {
        symbol,
        name: companyInfo.name,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: meta.regularMarketVolume || 0,
        marketCap: companyInfo.marketCap,
        sector: companyInfo.sector,
        country: countryCode
      };
      
    } catch (error) {
      console.warn(`Yahoo Finance failed for ${symbol}:`, error);
      throw error;
    }
  }

  private async getCompanyInfo(symbol: string): Promise<{ name: string; marketCap?: number; sector: string }> {
    try {
      // Try to get company overview from Alpha Vantage
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.Name && data.Name !== 'None' && !data['Error Message']) {
          return {
            name: data.Name,
            marketCap: data.MarketCapitalization ? parseInt(data.MarketCapitalization) : undefined,
            sector: data.Sector || 'Technology'
          };
        }
      }
    } catch (error) {
      console.warn(`Failed to get company info for ${symbol}`);
    }
    
    // Fallback company names
    const companyNames: { [key: string]: { name: string; sector: string } } = {
      'AAPL': { name: 'Apple Inc.', sector: 'Technology' },
      'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology' },
      'MSFT': { name: 'Microsoft Corporation', sector: 'Technology' },
      'TSLA': { name: 'Tesla Inc.', sector: 'Automotive' },
      'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
      'META': { name: 'Meta Platforms Inc.', sector: 'Technology' },
      'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology' },
      'NFLX': { name: 'Netflix Inc.', sector: 'Entertainment' },
      'AMD': { name: 'Advanced Micro Devices Inc.', sector: 'Technology' },
      'INTC': { name: 'Intel Corporation', sector: 'Technology' },
      'CRM': { name: 'Salesforce Inc.', sector: 'Technology' },
      'ORCL': { name: 'Oracle Corporation', sector: 'Technology' }
    };
    
    const info = companyNames[symbol];
    return {
      name: info?.name || `${symbol} Corporation`,
      sector: info?.sector || 'Technology'
    };
  }

  async getRealTimeStock(symbol: string, countryCode: string): Promise<Stock> {
    console.log(`📊 Fetching real-time data for ${symbol}`);
    
    const stockData = await this.fetchRealStockDataWithFallback(symbol, countryCode);
    
    if (!stockData) {
      throw new Error(`Failed to fetch real data for ${symbol} from any API`);
    }
    
    return stockData;
  }

  async getStockDetails(symbol: string): Promise<StockDetails> {
    console.log('📊 Loading comprehensive stock details for:', symbol);
    
    try {
      const cleanSymbol = symbol.split('.')[0];
      const countryCode = this.getCountryFromSymbol(symbol);
      
      // Get real stock data
      const stockData = await this.getEnhancedStockDataWithFallback(cleanSymbol, countryCode);
      
      // Get real news
      const newsApi = NewsApiService.getInstance();
      const news = await newsApi.getStockNews(symbol);
      
      // Get company info
      const companyInfo = await this.getCompanyInfo(cleanSymbol);
      
      const stockDetails: StockDetails = {
        symbol: cleanSymbol,
        name: companyInfo.name,
        ...stockData,
        marketCap: companyInfo.marketCap,
        sector: companyInfo.sector,
        country: countryCode,
        description: await this.getCompanyDescription(cleanSymbol),
        news
      };
      
      console.log('✅ Real stock details loaded for:', symbol);
      return stockDetails;
      
    } catch (error) {
      console.error('❌ Error loading stock details:', error);
      throw error;
    }
  }

  private async getEnhancedStockDataWithFallback(symbol: string, countryCode: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    volume: number;
  }> {
    // Try Alpha Vantage first for detailed data
    try {
      return await this.getEnhancedDataFromAlphaVantage(symbol, countryCode);
    } catch (error) {
      console.warn('Alpha Vantage enhanced data failed, trying Yahoo Finance');
    }
    
    // Fallback to Yahoo Finance
    try {
      return await this.getEnhancedDataFromYahoo(symbol, countryCode);
    } catch (error) {
      console.warn('Yahoo Finance enhanced data failed');
      throw new Error('Failed to get enhanced stock data from any source');
    }
  }

  private async getEnhancedDataFromAlphaVantage(symbol: string, countryCode: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    volume: number;
  }> {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      throw new Error(`Alpha Vantage API limit: ${data['Error Message'] || data['Note']}`);
    }
    
    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      throw new Error('No quote data from Alpha Vantage');
    }
    
    // Extract all data
    const priceUSD = parseFloat(quote['05. price']);
    const changeUSD = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
    const openUSD = parseFloat(quote['02. open']);
    const highUSD = parseFloat(quote['03. high']);
    const lowUSD = parseFloat(quote['04. low']);
    const previousCloseUSD = parseFloat(quote['08. previous close']);
    const volume = parseInt(quote['06. volume']);
    
    // Convert all prices to local currency
    const [price, change, open, high, low, previousClose] = await Promise.all([
      this.convertPrice(priceUSD, countryCode),
      this.convertPrice(changeUSD, countryCode),
      this.convertPrice(openUSD, countryCode),
      this.convertPrice(highUSD, countryCode),
      this.convertPrice(lowUSD, countryCode),
      this.convertPrice(previousCloseUSD, countryCode)
    ]);
    
    return {
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      volume: volume
    };
  }

  private async getEnhancedDataFromYahoo(symbol: string, countryCode: string): Promise<{
    price: number;
    change: number;
    changePercent: number;
    open: number;
    high: number;
    low: number;
    previousClose: number;
    volume: number;
  }> {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]?.meta) {
      throw new Error('No data from Yahoo Finance');
    }
    
    const meta = data.chart.result[0].meta;
    
    const priceUSD = meta.regularMarketPrice;
    const openUSD = meta.regularMarketOpen;
    const highUSD = meta.regularMarketDayHigh;
    const lowUSD = meta.regularMarketDayLow;
    const previousCloseUSD = meta.previousClose;
    const volume = meta.regularMarketVolume;
    
    const changeUSD = priceUSD - previousCloseUSD;
    const changePercent = (changeUSD / previousCloseUSD) * 100;
    
    // Convert all prices to local currency
    const [price, change, open, high, low, previousClose] = await Promise.all([
      this.convertPrice(priceUSD, countryCode),
      this.convertPrice(changeUSD, countryCode),
      this.convertPrice(openUSD, countryCode),
      this.convertPrice(highUSD, countryCode),
      this.convertPrice(lowUSD, countryCode),
      this.convertPrice(previousCloseUSD, countryCode)
    ]);
    
    return {
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      volume: volume
    };
  }

  private getCountryFromSymbol(symbol: string): string {
    if (symbol.includes('.BSE') || symbol.includes('.NSE')) return 'IN';
    if (symbol.includes('.LON')) return 'GB';
    if (symbol.includes('.TRT')) return 'CA';
    if (symbol.includes('.AUS')) return 'AU';
    if (symbol.includes('.DEX')) return 'DE';
    if (symbol.includes('.TYO')) return 'JP';
    return 'US';
  }

  private async getCompanyDescription(symbol: string): Promise<string> {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.Description && data.Description !== 'None' && !data['Error Message']) {
          return data.Description;
        }
      }
    } catch (error) {
      console.warn(`Failed to get description for ${symbol}`);
    }
    
    return `${symbol} is a publicly traded company providing innovative products and services to customers worldwide.`;
  }

  async getStockChart(symbol: string, period: string): Promise<{ labels: string[], data: number[] }> {
    console.log('📈 Loading real chart data for:', symbol, period);
    
    try {
      const cleanSymbol = symbol.split('.')[0];
      const countryCode = this.getCountryFromSymbol(symbol);
      
      // Try Alpha Vantage first
      try {
        return await this.getChartFromAlphaVantage(cleanSymbol, period, countryCode);
      } catch (error) {
        console.warn('Alpha Vantage chart failed, trying Yahoo Finance');
      }
      
      // Fallback to Yahoo Finance
      return await this.getChartFromYahoo(cleanSymbol, period, countryCode);
      
    } catch (error) {
      console.error('❌ Failed to load chart data:', error);
      throw error;
    }
  }

  private async getChartFromAlphaVantage(symbol: string, period: string, countryCode: string): Promise<{ labels: string[], data: number[] }> {
    const interval = this.getIntervalForPeriod(period);
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${this.alphaVantageKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage chart HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data['Error Message'] || data['Note']) {
      throw new Error(`Alpha Vantage chart API limit: ${data['Error Message'] || data['Note']}`);
    }
    
    const timeSeries = data[`Time Series (${interval})`];
    
    if (!timeSeries) {
      throw new Error('No time series data from Alpha Vantage');
    }
    
    const entries = Object.entries(timeSeries).slice(0, this.getDataPointsForPeriod(period));
    const labels = entries.map(([time]) => new Date(time).toLocaleTimeString()).reverse();
    
    // Convert prices to local currency
    const pricesUSD = entries.map(([, data]: [string, any]) => parseFloat(data['4. close'])).reverse();
    const pricesLocal = await Promise.all(
      pricesUSD.map(price => this.convertPrice(price, countryCode))
    );
    
    return { labels, data: pricesLocal.map(price => Number(price.toFixed(2))) };
  }

  private async getChartFromYahoo(symbol: string, period: string, countryCode: string): Promise<{ labels: string[], data: number[] }> {
    const range = this.getYahooRangeForPeriod(period);
    const interval = this.getYahooIntervalForPeriod(period);
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`
    );
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance chart HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.chart?.result?.[0]?.timestamp) {
      throw new Error('No chart data from Yahoo Finance');
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0].close;
    
    const labels = timestamps.map((ts: number) => new Date(ts * 1000).toLocaleTimeString());
    
    // Convert prices to local currency
    const pricesLocal = await Promise.all(
      prices.map((price: number) => this.convertPrice(price, countryCode))
    );
    
    return { labels, data: pricesLocal.map(price => Number(price.toFixed(2))) };
  }

  private getIntervalForPeriod(period: string): string {
    const intervals: { [key: string]: string } = {
      '1H': '5min',
      '1D': '15min',
      '1W': '60min',
      '1M': '60min',
      '6M': 'daily',
      '1Y': 'daily'
    };
    return intervals[period] || '15min';
  }

  private getYahooRangeForPeriod(period: string): string {
    const ranges: { [key: string]: string } = {
      '1H': '1d',
      '1D': '1d',
      '1W': '5d',
      '1M': '1mo',
      '6M': '6mo',
      '1Y': '1y'
    };
    return ranges[period] || '1d';
  }

  private getYahooIntervalForPeriod(period: string): string {
    const intervals: { [key: string]: string } = {
      '1H': '5m',
      '1D': '15m',
      '1W': '1h',
      '1M': '1d',
      '6M': '1d',
      '1Y': '1wk'
    };
    return intervals[period] || '15m';
  }

  private getDataPointsForPeriod(period: string): number {
    const periods: { [key: string]: number } = {
      '1H': 12,
      '1D': 24,
      '1W': 7,
      '1M': 30,
      '6M': 26,
      '1Y': 52
    };
    return periods[period] || 30;
  }

  async searchStocks(query: string, countryCode: string): Promise<Stock[]> {
    console.log('🔍 Searching real stocks:', query);
    
    try {
      // Try Alpha Vantage search first
      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${this.alphaVantageKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.bestMatches && data.bestMatches.length > 0 && !data['Error Message']) {
          const searchResults: Stock[] = [];
          
          for (const match of data.bestMatches.slice(0, 5)) {
            try {
              const stockData = await this.fetchRealStockDataWithFallback(match['1. symbol'], countryCode);
              if (stockData) {
                searchResults.push(stockData);
              }
            } catch (error) {
              console.warn(`Failed to fetch data for search result: ${match['1. symbol']}`);
            }
          }
          
          if (searchResults.length > 0) {
            console.log(`✅ Real search results: ${searchResults.length}`);
            return searchResults;
          }
        }
      }
      
      // Fallback to local search in existing stocks
      const allStocks = await this.getStocksByCountry(countryCode);
      const filteredStocks = allStocks.filter(stock =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('✅ Local search results:', filteredStocks.length);
      return filteredStocks;
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }
}
