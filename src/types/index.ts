export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  country?: string;
  createdAt: Date;
  hasCompletedOnboarding: boolean;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
  country: string;
}

export interface StockDetails extends Stock {
  open: number;
  high: number;
  low: number;
  previousClose: number;
  description?: string;
  news?: NewsItem[];
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
}

export interface PortfolioItem {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  buyPrice: number;
  currentPrice: number;
  quantity: number;
  buyDate: Date;
  gainLoss: number;
  gainLossPercent: number;
}

export interface AIAnalysis {
  summary: string;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetPrice: number;
  reasoning: string;
  estimatedReturn: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
  exchanges: string[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}