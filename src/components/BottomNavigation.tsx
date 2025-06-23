import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, PieChart, Settings, Star, Newspaper, Search, TrendingUp } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home'
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Star,
      path: '/watchlist'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: PieChart,
      path: '/portfolio'
    },
    {
      id: 'news',
      label: 'News',
      icon: Newspaper,
      path: '/news'
    },
    {
      id: 'screener',
      label: 'Screener',
      icon: Search,
      path: '/screener'
    }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800 px-2 py-2 z-50 safe-area-pb"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab, index) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-green-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {/* Active background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute inset-0 bg-green-600/20 border border-green-600/30 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <motion.div 
                  className={`p-1.5 rounded-lg transition-all duration-300 relative z-10 ${
                    isActive ? 'bg-green-600/20' : ''
                  }`}
                  whileHover={{ rotate: isActive ? 0 : 5 }}
                >
                  <Icon size={18} />
                </motion.div>
                
                <span className="text-xs font-medium relative z-10">{tab.label}</span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};