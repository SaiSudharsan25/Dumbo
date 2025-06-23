# Dumbo AI - Complete Setup Guide

## 🚀 Quick Start

Dumbo AI is your intelligent stock analysis companion powered by DeepSeek AI, providing real-time market data, portfolio tracking, and AI-driven investment insights.

## 📰 News API Setup

### Required API Keys

To get real-time financial news, you'll need to set up these free API keys:

#### 1. NewsAPI (Primary News Source)
- **Website**: [https://newsapi.org/](https://newsapi.org/)
- **Steps**:
  1. Create a free account
  2. Get your API key from the dashboard
  3. Free tier: 1,000 requests/day
  4. Replace `YOUR_NEWS_API_KEY_HERE` in `src/services/newsApi.ts`

#### 2. Alpha Vantage (Financial News & Data)
- **Website**: [https://www.alphavantage.co/](https://www.alphavantage.co/)
- **Steps**:
  1. Sign up for free account
  2. Get API key from dashboard
  3. Free tier: 5 calls/minute, 500 calls/day
  4. Already configured: `CWH24EN1156BH710`

#### 3. Finnhub (Market News)
- **Website**: [https://finnhub.io/](https://finnhub.io/)
- **Steps**:
  1. Create free account
  2. Get API token
  3. Free tier: 60 calls/minute
  4. Already configured: `ctbr9j1r01qnhqhqhqd0ctbr9j1r01qnhqhqe0`

### API Configuration

Update these files with your API keys:

```javascript
// src/services/newsApi.ts
private newsApiKey: string = 'YOUR_NEWS_API_KEY_HERE'; // Replace this
private backupApiKey: string = 'YOUR_BACKUP_NEWS_API_KEY'; // Optional
```

### News API Features

✅ **Real-time Market News** - Latest financial news from multiple sources
✅ **Stock-Specific News** - Company-specific news and analysis  
✅ **Multiple Sources** - NewsAPI, Alpha Vantage, Finnhub integration
✅ **Smart Filtering** - Finance-focused content filtering
✅ **Fallback System** - Enhanced mock news when APIs are unavailable
✅ **Source Attribution** - Clear labeling of news sources

## 🤖 DeepSeek AI Setup

### API Configuration

1. **Get DeepSeek API Key**:
   - Visit [https://platform.deepseek.com/](https://platform.deepseek.com/)
   - Create account and get API key
   - Replace in `src/services/deepseekApi.ts`:

```javascript
private apiKey: string = 'YOUR_DEEPSEEK_API_KEY_HERE';
```

2. **Features**:
   - Advanced stock analysis
   - Real-time chat assistance
   - Portfolio insights
   - Risk assessment
   - Price predictions

## 🔥 Firebase Configuration

Your Firebase project is already configured:
- **Project ID**: `dumbo-7dcd6`
- **Auth Domain**: `dumbo-7dcd6.firebaseapp.com`

### Firebase Setup Steps

1. **Authorized Domains** (Important!):
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `dumbo-7dcd6`
   - Navigate to **Authentication** → **Settings** → **Authorized domains**
   - Add: `localhost` (for development)
   - Add your production domain when deploying

## 💱 Currency & Market Data

### Real-time Features

✅ **Live Exchange Rates** - Automatic currency conversion
✅ **Market Hours Detection** - Real market status by country
✅ **Multi-Currency Support** - USD, INR, GBP, CAD, AUD, EUR, JPY
✅ **Real Stock Prices** - Alpha Vantage & Finnhub integration
✅ **Brokerage Integration** - Live portfolio data with currency conversion

### Supported Markets

- 🇺🇸 **United States** - NYSE, NASDAQ
- 🇮🇳 **India** - NSE, BSE  
- 🇬🇧 **United Kingdom** - LSE
- 🇨🇦 **Canada** - TSX
- 🇦🇺 **Australia** - ASX
- 🇩🇪 **Germany** - XETRA
- 🇯🇵 **Japan** - TSE

## 🏦 Brokerage Integration

### Supported Brokers by Country

#### 🇺🇸 United States
- **Alpaca Markets** - Commission-free trading
- **TD Ameritrade** - Professional platform
- **Interactive Brokers** - Global markets

#### 🇮🇳 India  
- **Zerodha Kite** - Largest discount broker
- **Upstox** - Technology-first platform
- **Angel One** - Full-service broker

#### 🇬🇧 United Kingdom
- **Trading 212** - Commission-free trading
- **Freetrade** - Mobile-first investing

### Setup Instructions

1. **Create Brokerage Account**
2. **Enable API Access** in your broker dashboard
3. **Generate API Keys** (API Key + Secret Key)
4. **Connect in App**: Portfolio → Connect Broker
5. **Enter Credentials** and start live tracking

## 🚀 Deployment

### Environment Variables

For production deployment, set these environment variables:

```bash
# Firebase (already configured)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=dumbo-7dcd6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dumbo-7dcd6

# News APIs
VITE_NEWS_API_KEY=your_newsapi_key
VITE_ALPHA_VANTAGE_KEY=CWH24EN1156BH710
VITE_FINNHUB_KEY=ctbr9j1r01qnhqhqhqd0ctbr9j1r01qnhqhqe0

# DeepSeek AI
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features

### ✅ Completed Features

- **Real-time Stock Data** with currency conversion
- **AI-Powered Analysis** using DeepSeek AI
- **Portfolio Management** (simulation + real brokerage)
- **Watchlist** with add/remove functionality
- **Market News** from multiple sources
- **Brokerage Integration** with live data
- **Multi-Currency Support** with live exchange rates
- **Market Hours Detection** by country
- **Responsive Design** for all devices

### 🎯 Key Highlights

- **Real Currency Conversion** - All prices in local currency
- **Live Market Data** - Real-time stock prices and news
- **AI Chat Assistant** - DeepSeek-powered stock analysis
- **Brokerage Integration** - Connect real trading accounts
- **Multi-Country Support** - 7 countries with local markets
- **Professional UI** - Apple-level design aesthetics

## 🔧 Troubleshooting

### Common Issues

1. **News not loading**: Check API keys in `newsApi.ts`
2. **Authentication issues**: Verify Firebase authorized domains
3. **Currency not converting**: Check exchange rate API limits
4. **AI not responding**: Verify DeepSeek API key

### Support

For technical support or questions:
- Check the browser console for error messages
- Verify all API keys are correctly configured
- Ensure Firebase authorized domains include your domain

---

**Dumbo AI** - Your intelligent investment companion 🐘📈