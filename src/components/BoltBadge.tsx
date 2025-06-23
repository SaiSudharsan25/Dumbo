import React from 'react';
import { motion } from 'framer-motion';

interface BoltBadgeProps {
  variant?: 'white' | 'black' | 'text';
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
  className?: string;
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  variant = 'white', 
  position = 'bottom-right',
  className = '' 
}) => {
  const handleClick = () => {
    window.open('https://bolt.new/', '_blank', 'noopener,noreferrer');
  };

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-right': 'fixed bottom-20 right-4 z-40',
    'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40'
  };

  if (variant === 'text') {
    return (
      <motion.button
        onClick={handleClick}
        className={`${positionClasses[position]} ${className} group`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        aria-label="Built with Bolt.new"
      >
        <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-black/90 transition-all duration-300 border border-white/20">
          Built with Bolt.new
        </div>
        
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Built with Bolt.new
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className={`${positionClasses[position]} ${className} group`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      aria-label="Built with Bolt.new"
    >
      <div className="relative">
        {/* Custom Image Badge */}
        <img
          src={variant === 'white' ? '/bolt-white-circle.png' : '/bolt-black-circle.png'}
          alt="Built with Bolt.new"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 group-hover:shadow-xl"
          style={{
            filter: variant === 'white' 
              ? 'drop-shadow(0 4px 8px rgba(255,255,255,0.25))' 
              : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
          }}
          onError={(e) => {
            // Fallback to SVG if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        
        {/* SVG Fallback */}
        <div 
          className={`hidden w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-lg ${
            variant === 'white' 
              ? 'bg-white text-black shadow-lg' 
              : 'bg-black text-white shadow-lg'
          }`}
          style={{
            filter: variant === 'white' ? 'drop-shadow(0 4px 8px rgba(255,255,255,0.25))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))'
          }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Built with Bolt.new
      </div>
    </motion.button>
  );
};