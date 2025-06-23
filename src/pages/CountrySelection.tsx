import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';
import { COUNTRIES } from '../config/countries';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export const CountrySelection: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { updateCountry, user } = useAuth();

  console.log('🌍 CountrySelection render:', { 
    userEmail: user?.email, 
    selectedCountry,
    userCountry: user?.country || 'none'
  });

  const handleContinue = async () => {
    if (!selectedCountry) {
      console.log('⚠️ No country selected');
      return;
    }
    
    console.log('🌍 Updating country to:', selectedCountry);
    setLoading(true);
    
    try {
      await updateCountry(selectedCountry);
      console.log('✅ Country updated - navigation will happen automatically');
    } catch (error) {
      console.error('❌ Error updating country:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-6 sm:mb-8">
          <motion.div 
            className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center relative"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Globe className="text-white" size={32} />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="text-yellow-400 w-4 h-4" />
            </motion.div>
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Select Your Country</h1>
          <p className="text-gray-400">Choose your country to get localized stock data and currency</p>
        </div>

        {/* Country list */}
        <div className="mb-6 sm:mb-8">
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
            {COUNTRIES.map((country, index) => (
              <motion.button
                key={country.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  console.log('🌍 Country selected:', country.code, country.name);
                  setSelectedCountry(country.code);
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedCountry === country.code
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/20 hover:border-white/40 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-white">{country.name}</p>
                      <p className="text-sm text-gray-400">{country.currency}</p>
                    </div>
                  </div>
                  {selectedCountry === country.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedCountry || loading}
          loading={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
          size="lg"
        >
          Continue
          <ArrowRight size={20} />
        </Button>
      </motion.div>
    </div>
  );
};