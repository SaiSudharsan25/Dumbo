import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, TrendingUp, BarChart3, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

// Google Icon Component
const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    console.log('🔐 Login button clicked');
    setLoading(true);
    
    try {
      await signIn();
      console.log('✅ Sign in completed - navigation will happen automatically');
    } catch (error) {
      console.error('❌ Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Market Data',
      description: 'Live stock prices and market insights from global exchanges'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced DeepSeek AI recommendations and portfolio insights'
    },
    {
      icon: BarChart3,
      title: 'Portfolio Management',
      description: 'Track real and simulated investments with detailed analytics'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Main Content - Full width on mobile, left side on desktop */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto lg:mx-0"
          >
            {/* Logo and Brand */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
              <Logo size="xl" animated={true} />
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Dumbo AI
                </h1>
                <p className="text-gray-400 text-base sm:text-lg lg:text-xl mt-2">
                  Your AI-powered investment companion
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-center lg:text-left"
            >
              Invest smarter with{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI insights
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 lg:mb-12 leading-relaxed text-center lg:text-left"
            >
              Get real-time market data, AI-powered recommendations, and manage your portfolio like a pro.
            </motion.p>

            {/* Why Choose Dumbo AI Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8 lg:mb-12"
            >
              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-center lg:text-left">
                Why choose Dumbo AI?
              </h3>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg p-2 flex-shrink-0">
                        <feature.icon className="w-5 h-5 text-black" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-1">{feature.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <Button
                onClick={handleGoogleSignIn}
                loading={loading}
                disabled={loading}
                className="bg-white hover:bg-gray-100 text-black font-bold text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 rounded-full border-0 shadow-2xl hover:shadow-white/25 transition-all duration-300 w-full sm:w-auto"
                size="lg"
              >
                <GoogleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-black font-bold">
                  {loading ? 'Signing in...' : 'Continue with Google'}
                </span>
                {!loading && <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-2 text-black" />}
              </Button>
            </motion.div>

            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500 text-center lg:text-left"
            >
              By continuing, you agree to our{' '}
              <button
                onClick={() => navigate('/terms')}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                onClick={() => navigate('/privacy')}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Privacy Policy
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side - Visual Elements (Desktop Only) */}
        <div className="hidden xl:flex flex-1 flex-col justify-center items-center px-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="relative"
          >
            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-cyan-400/20 rounded-full blur-2xl"
            />
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};