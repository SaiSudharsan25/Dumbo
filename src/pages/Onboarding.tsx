import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, Brain, PieChart, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

const slides = [
  {
    icon: TrendingUp,
    title: 'Real-time Stock Prices',
    description: 'Get live stock prices and market data from exchanges around the world. Stay updated with the latest market movements.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Brain,
    title: 'DeepSeek AI Recommendations',
    description: 'Powered by advanced DeepSeek AI, get intelligent stock analysis, risk assessments, and personalized investment recommendations.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: PieChart,
    title: 'Portfolio Tracking',
    description: 'Track your simulated investments, monitor gains and losses, and build your investment knowledge in a risk-free environment.',
    color: 'from-green-500 to-green-600'
  }
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const { markOnboardingComplete, user } = useAuth();

  console.log('📚 Onboarding render:', { 
    userEmail: user?.email, 
    currentSlide,
    userCountry: user?.country,
    userOnboarding: user?.hasCompletedOnboarding
  });

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    console.log('✅ Completing onboarding...');
    setLoading(true);
    
    try {
      await markOnboardingComplete();
      console.log('✅ Onboarding completed - navigation will happen automatically');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
      setLoading(false);
    }
  };

  const { icon: Icon } = slides[currentSlide];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <motion.div 
                className={`bg-gradient-to-br ${slides[currentSlide].color} rounded-xl sm:rounded-2xl p-6 w-24 h-24 mx-auto mb-8 flex items-center justify-center relative overflow-hidden`}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Icon className="text-white" size={48} />
                
                <motion.div
                  className="absolute top-1 right-1"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="text-yellow-300 w-4 h-4" />
                </motion.div>
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed px-4">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white w-8' : 'bg-gray-600 w-2'
                }`}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-4 max-w-md mx-auto">
          {currentSlide > 0 && (
            <Button
              variant="secondary"
              onClick={prevSlide}
              className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              <ArrowLeft size={20} />
              Back
            </Button>
          )}
          
          {currentSlide < slides.length - 1 ? (
            <Button
              onClick={nextSlide}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              Next
              <ArrowRight size={20} />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              loading={loading}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold"
            >
              Get Started
              <ArrowRight size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};