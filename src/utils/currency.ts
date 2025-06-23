import { COUNTRIES } from '../config/countries';

export const getCurrencySymbol = (countryCode: string): string => {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'INR': '₹',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'EUR': '€',
    'JPY': '¥'
  };

  const country = COUNTRIES.find(c => c.code === countryCode);
  const currency = country?.currency || 'USD';
  return currencySymbols[currency] || '$';
};

export const formatCurrency = (amount: number, countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const currency = country?.currency || 'USD';
  
  // Use proper locale formatting for each country
  const localeMap: { [key: string]: string } = {
    'US': 'en-US',
    'IN': 'en-IN',
    'GB': 'en-GB',
    'CA': 'en-CA',
    'AU': 'en-AU',
    'DE': 'de-DE',
    'JP': 'ja-JP'
  };
  
  const locale = localeMap[countryCode] || 'en-US';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting
    const symbol = getCurrencySymbol(countryCode);
    const decimals = currency === 'JPY' ? 0 : 2;
    return `${symbol}${amount.toLocaleString(locale, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })}`;
  }
};

export const getCurrencyCode = (countryCode: string): string => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country?.currency || 'USD';
};

export const convertCurrency = async (amount: number, fromCountry: string, toCountry: string): Promise<number> => {
  const fromCurrency = getCurrencyCode(fromCountry);
  const toCurrency = getCurrencyCode(toCountry);
  
  if (fromCurrency === toCurrency) return amount;
  
  try {
    // Try to get real-time exchange rates
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const rate = data.rates[toCurrency];
      if (rate) {
        return amount * rate;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch real-time exchange rates, using fallback');
  }
  
  // Fallback to static rates
  const rates: { [key: string]: number } = {
    'USD': 1,
    'INR': 83.12,
    'GBP': 0.79,
    'CAD': 1.35,
    'AUD': 1.52,
    'EUR': 0.92,
    'JPY': 149.50
  };
  
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

export const isMarketOpen = (countryCode: string): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's weekend
  if (currentDay === 0 || currentDay === 6) {
    return false;
  }
  
  // Market hours by country (simplified - in local time)
  switch (countryCode) {
    case 'US':
      // NYSE/NASDAQ: 9:30 AM - 4:00 PM EST
      return currentHour >= 9 && currentHour < 16;
    case 'IN':
      // NSE/BSE: 9:15 AM - 3:30 PM IST
      return currentHour >= 9 && currentHour < 15;
    case 'GB':
      // LSE: 8:00 AM - 4:30 PM GMT
      return currentHour >= 8 && currentHour < 16;
    case 'CA':
      // TSX: 9:30 AM - 4:00 PM EST
      return currentHour >= 9 && currentHour < 16;
    case 'AU':
      // ASX: 10:00 AM - 4:00 PM AEST
      return currentHour >= 10 && currentHour < 16;
    case 'DE':
      // XETRA: 9:00 AM - 5:30 PM CET
      return currentHour >= 9 && currentHour < 17;
    case 'JP':
      // TSE: 9:00 AM - 3:00 PM JST
      return currentHour >= 9 && currentHour < 15;
    default:
      return currentHour >= 9 && currentHour < 16;
  }
};