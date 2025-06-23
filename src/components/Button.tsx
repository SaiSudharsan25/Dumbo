import React from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group whitespace-nowrap';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-xl border border-blue-500',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg hover:shadow-xl',
    success: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl border border-blue-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-xl border border-red-500',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300 border border-gray-600 hover:border-gray-500'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {/* Animated background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="relative z-10 flex items-center justify-center gap-3">
        {loading && <LoadingSpinner size="sm" color={variant === 'primary' || variant === 'success' ? 'light' : 'light'} />}
        {children}
      </div>
    </motion.button>
  );
};