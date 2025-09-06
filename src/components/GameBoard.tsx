// app/components/GameBoard.tsx
'use client';

import React, { useRef, useCallback } from 'react';
import CandyComponent from '@/components/Candy';
import { CandyType, Position, SwipeDirection } from '@/types/game';
import { useTouchHandler } from '../hooks/useTouchHandler';

interface GameBoardProps {
  board: CandyType[][];
  selectedCandy: Position | null;
  isAnimating: boolean;
  onSwipe: (from: Position, direction: SwipeDirection) => void;
  onCandySelect: (position: Position) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedCandy,
  isAnimating,
  onSwipe,
  onCandySelect
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const boardSize = board.length;

  // Calculate position from touch/mouse coordinates
  const getPositionFromCoordinates = useCallback((clientX: number, clientY: number): Position | null => {
    if (!boardRef.current) return null;

    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const cellWidth = rect.width / boardSize;
    const cellHeight = rect.height / boardSize;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (row >= 0 && row < boardSize && col >= 0 && col < boardSize) {
      return { row, col };
    }

    return null;
  }, [boardSize]);

  // Custom touch handler for smooth swiping
  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    dragOffset
  } = useTouchHandler({
    onSwipe,
    getPositionFromCoordinates,
    minSwipeDistance: 12, // Even more responsive
    maxSwipeTime: 800     // More generous time window
  });

  return (
    <div className="relative flex justify-center">
      <div
        ref={boardRef}
        className="grid gap-1 p-2 sm:p-4 bg-white/5 rounded-2xl backdrop-blur-sm"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          aspectRatio: '1',
          width: 'min(90vw, min(60vh, 450px))',
          height: 'min(90vw, min(60vh, 450px))'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {board.map((row, rowIndex) =>
          row.map((candy, colIndex) => (
            <CandyComponent
              key={`${rowIndex}-${colIndex}`}
              candy={candy}
              position={{ row: rowIndex, col: colIndex }}
              isSelected={
                selectedCandy?.row === rowIndex && selectedCandy?.col === colIndex
              }
              isAnimating={isAnimating}
              onClick={() => onCandySelect({ row: rowIndex, col: colIndex })}
              isDragging={isDragging}
              dragOffset={dragOffset}
            />
          ))
        )}
      </div>

      {/* Enhanced touch feedback overlay */}
      {isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 border-2 border-white/30 rounded-2xl animate-ping" />
        </div>
      )}
    </div>
  );
};

export default GameBoard;