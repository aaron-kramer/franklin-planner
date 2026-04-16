import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative bg-[#1a1210] md:rounded-xl rounded-t-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[92dvh] md:max-h-[90vh] flex flex-col border border-[#5a2a18]`}
        style={{ boxShadow: '0 0 30px rgba(139, 21, 21, 0.3), 0 20px 60px rgba(0,0,0,0.8)' }}
      >
        {/* Drag handle — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#4a2a18]" />
        </div>
        {/* Rune accent bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8b1515] to-transparent opacity-80" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3a1e10]">
          <h2 className="text-lg font-semibold text-[#e8d4a0] font-['Cinzel',serif] tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#3a1e10] text-[#6a4828] hover:text-[#e8d4a0] transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
