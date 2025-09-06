// app/components/ClaimButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTokenClaiming } from '@/hooks/useTokenClaiming';
import { useActiveAccount } from 'thirdweb/react';

interface ClaimButtonProps {
  movesMade: number;
  onClaim: () => void;
}

const ClaimButton: React.FC<ClaimButtonProps> = ({ movesMade, onClaim }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousMovesMade, setPreviousMovesMade] = useState(movesMade);
  const account = useActiveAccount();
  const { claimState, claimTokens, resetClaimState } = useTokenClaiming();
  
  const isDisabled = movesMade === 0 || !account;
  const tokenReward = movesMade * 10;

  // Reset claim state when user makes a new move
  useEffect(() => {
    if (movesMade > previousMovesMade && claimState.success) {
      resetClaimState();
      setShowConfetti(false);
    }
    setPreviousMovesMade(movesMade);
  }, [movesMade, previousMovesMade, claimState.success, resetClaimState]);

  const handleClaim = async () => {
    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await claimTokens(movesMade);
      if (claimState.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
        onClaim(); // Call the original onClaim to reset moves
      }
    } catch (error) {
      console.error('Claim error:', error);
    }
  };

  const getButtonText = () => {
    if (!account) return 'Connect Wallet to Claim';
    if (claimState.isProcessing) return 'Processing Transaction...';
    if (claimState.success) return 'Tokens Claimed! 🎉';
    if (isDisabled) return 'No moves made';
    return `Claim +${tokenReward} tokens`;
  };

  const getButtonClass = () => {
    const baseClass = 'px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 min-w-[200px] flex items-center justify-center gap-2';
    
    if (!account) {
      return `${baseClass} bg-blue-500/30 text-blue-400 cursor-not-allowed`;
    }
    
    if (claimState.isProcessing) {
      return `${baseClass} bg-yellow-500 text-white shadow-lg`;
    }
    
    if (claimState.success) {
      return `${baseClass} bg-green-500 text-white shadow-lg`;
    }
    
    if (isDisabled) {
      return `${baseClass} bg-gray-500/30 text-gray-400 cursor-not-allowed`;
    }
    
    return `${baseClass} bg-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`;
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <button
        onClick={handleClaim}
        disabled={isDisabled || claimState.isProcessing}
        className={getButtonClass()}
      >
        <span>{getButtonText()}</span>
        {claimState.isProcessing && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        )}
      </button>

      {/* Error Message */}
      {claimState.error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 max-w-md text-center">
          <p className="text-red-200 text-sm">{claimState.error}</p>
          <button
            onClick={resetClaimState}
            className="mt-2 text-red-300 hover:text-red-100 text-xs underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Success Message */}
      {claimState.success && claimState.transactionHash && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 max-w-md text-center">
          <p className="text-green-200 text-sm mb-2">Tokens claimed successfully!</p>
          <a
            href={`https://celoscan.io/tx/${claimState.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-300 hover:text-green-100 text-xs underline"
          >
            View on Celoscan
          </a>
        </div>
      )}

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimButton;
