// app/components/CandyCrushGame.tsx
'use client';

import React, { useReducer, useCallback, useEffect } from 'react';
import GameBoard from './GameBoard';
import ClaimButton from './ClaimButton';
import { gameReducer, initialGameState } from '@/lib/gameLogic';
import { GameState, CandyType, Position, SwipeDirection } from '@/types/game';

const BOARD_SIZE = 8;

const CandyCrushGame: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialGameState(BOARD_SIZE));

  const handleSwipe = useCallback((from: Position, direction: SwipeDirection) => {
    dispatch({
      type: 'ATTEMPT_SWAP',
      payload: { from, direction }
    });
  }, []);

  const handleCandySelect = useCallback((position: Position) => {
    dispatch({
      type: 'SELECT_CANDY',
      payload: { position }
    });
  }, []);

  const handleClaim = useCallback(() => {
    // Here you would typically handle the claim logic
    // For now, we'll just show an alert
    const tokenReward = gameState.movesMade * 10;
    alert(`Claimed ${tokenReward} tokens!`);
    
    // Reset moves made after claiming
    dispatch({ type: 'RESTART_GAME' });
  }, [gameState.movesMade]);

  // Optimized match detection and animation flow
  useEffect(() => {
    if (gameState.isAnimating) return;
    
    // Use requestAnimationFrame for smoother timing
    const rafId = requestAnimationFrame(() => {
      dispatch({ type: 'CHECK_MATCHES' });
    });

    return () => cancelAnimationFrame(rafId);
  }, [gameState.board, gameState.isAnimating]);

  // Handle drop animation after matches are cleared
  useEffect(() => {
    if (gameState.matches.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DROP_CANDIES' });
      }, 200); // Optimized timing

      return () => clearTimeout(timer);
    }
  }, [gameState.matches]);

  return (
    <div className="min-h-screen bg-purple-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Fruit Crush</h1>
          <div className="flex justify-center gap-6 sm:gap-8 text-white">
            <div>
              <span className="text-sm opacity-80">Score</span>
              <div className="text-2xl font-bold">{gameState.score.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-sm opacity-80">Moves</span>
              <div className="text-2xl font-bold">{gameState.movesMade}</div>
            </div>
          </div>
        </div>
        
        <GameBoard
          board={gameState.board}
          selectedCandy={gameState.selectedCandy}
          isAnimating={gameState.isAnimating}
          onSwipe={handleSwipe}
          onCandySelect={handleCandySelect}
        />
        
        <ClaimButton
          movesMade={gameState.movesMade}
          onClaim={handleClaim}
        />
        
        {gameState.movesLeft <= 0 && (
          <div className="text-center mt-6">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
              <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-white/80 mb-4">Final Score: {gameState.score.toLocaleString()}</p>
              <button
                onClick={() => dispatch({ type: 'RESTART_GAME' })}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandyCrushGame;