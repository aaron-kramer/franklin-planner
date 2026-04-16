import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed font-[\'Cinzel\',serif]';

  const variants = {
    primary: 'bg-[#8b1515] text-[#f0d090] hover:bg-[#a82020] focus:ring-[#8b1515]/40 shadow-sm border border-[#c05808]/30 glow-red-sm',
    secondary: 'bg-[#1a1210] text-[#c8aa78] border border-[#5a2a18] hover:bg-[#2a1810] hover:border-[#8b1515]/60 focus:ring-[#8b1515]/30',
    ghost: 'text-[#c8aa78] hover:bg-[#2a1810] hover:text-[#e8d4a0] focus:ring-[#8b1515]/30',
    danger: 'bg-[#6b0f0f] text-[#f0d090] hover:bg-[#8b1515] focus:ring-[#8b1515]/40 shadow-sm border border-[#8b1515]/50',
    amber: 'bg-[#904008] text-[#f0d090] hover:bg-[#c05808] focus:ring-[#c05808]/40 shadow-sm border border-[#c05808]/40',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
