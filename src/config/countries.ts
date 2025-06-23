import { Country } from '../types';

export const COUNTRIES: Country[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    flag: '🇺🇸',
    exchanges: ['NASDAQ', 'NYSE']
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    flag: '🇮🇳',
    exchanges: ['NSE', 'BSE']
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    flag: '🇬🇧',
    exchanges: ['LSE']
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    flag: '🇨🇦',
    exchanges: ['TSX']
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    flag: '🇦🇺',
    exchanges: ['ASX']
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    flag: '🇩🇪',
    exchanges: ['XETRA']
  },
  {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    flag: '🇯🇵',
    exchanges: ['TSE']
  }
];