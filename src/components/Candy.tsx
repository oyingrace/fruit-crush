// app/components/Candy.tsx
'use client';

import React, { memo } from 'react';
import { CandyType, Position } from '@/types/game';

interface CandyProps {
  candy: CandyType;
  position: Position;
  isSelected: boolean;
  isAnimating: boolean;
  onClick: () => void;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

const candyColors: Record<CandyType, string> = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-400 to-yellow-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
  empty: 'from-gray-200 to-gray-300'
};

const candyEmojis: Record<CandyType, string> = {
  red: '🍓',
  blue: '🫐',
  green: '🍏',
  yellow: '🍋',
  purple: '🍇',
  orange: '🍊',
  empty: ''
};

const Candy: React.FC<CandyProps> = ({
  candy,
  position,
  isSelected,
  isAnimating,
  onClick,
  isDragging,
  dragOffset
}) => {
  if (candy === 'empty') {
    return <div className="aspect-square rounded-xl" />;
  }

  const transform = isDragging && isSelected 
    ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.15)`
    : isSelected 
    ? 'scale(1.1)'
    : 'scale(1)';

  const boxShadow = isDragging && isSelected
    ? '0 8px 25px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)'
    : isSelected
    ? '0 4px 15px rgba(0,0,0,0.2)'
    : '0 2px 8px rgba(0,0,0,0.15)';

  return (
    <div
      className={`
        aspect-square rounded-xl cursor-pointer select-none
        bg-gradient-to-br ${candyColors[candy]}
        transition-all duration-150 ease-out
        flex items-center justify-center
        text-2xl sm:text-3xl
        ${isSelected ? 'ring-2 ring-white ring-opacity-80 z-10' : ''}
        ${isDragging ? 'z-20' : ''}
        ${isAnimating ? 'pointer-events-none' : 'hover:scale-105 active:scale-95'}
      `}
      style={{
        transform,
        boxShadow,
        willChange: 'transform, box-shadow',
        touchAction: 'manipulation',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
      onClick={onClick}
    >
      <span
        className="drop-shadow-sm"
        style={{
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))'
        }}
      >
        {candyEmojis[candy]}
      </span>
    </div>
  );
};

export default memo(Candy);