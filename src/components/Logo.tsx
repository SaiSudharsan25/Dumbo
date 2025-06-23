import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  animated = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const LogoComponent = animated ? motion.img : 'img';
  const animationProps = animated ? {
    whileHover: { scale: 1.1, rotate: 5 },
    whileTap: { scale: 0.95 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <LogoComponent
      src="/logo.svg"
      alt="Dumbo AI Logo"
      className={`${sizeClasses[size]} ${className} rounded-xl shadow-lg`}
      {...animationProps}
    />
  );
};