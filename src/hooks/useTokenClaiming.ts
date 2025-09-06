import { useState } from 'react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { prepareContractCall } from 'thirdweb';
import { contract } from '@/lib/contract';

export interface ClaimState {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  transactionHash: string | null;
}

export function useTokenClaiming() {
  const [claimState, setClaimState] = useState<ClaimState>({
    isLoading: false,
    isProcessing: false,
    error: null,
    success: false,
    transactionHash: null,
  });

  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending: isTransactionPending } = useSendTransaction();

  const claimTokens = async (points: number) => {
    if (!account) {
      setClaimState(prev => ({ ...prev, error: 'Please connect your wallet first' }));
      return;
    }

    setClaimState({
      isLoading: false,
      isProcessing: true,
      error: null,
      success: false,
      transactionHash: null,
    });

    try {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setClaimState(prev => ({
          ...prev,
          isProcessing: false,
          error: 'Transaction timeout. Please try again.',
        }));
      }, 60000); // 60 second timeout

      // Direct mint call 
      console.log('Minting tokens directly:', { to: account.address, amount: points });
      
      const preparedTransaction = prepareContractCall({
        contract,
        method: "mintTo",
        params: [account.address, BigInt(points * 1e18)], // Convert points to wei
      });
      
      sendTransaction(preparedTransaction, {
        onSuccess: (result: any) => {
          console.log('Transaction successful:', result);
          clearTimeout(timeoutId);
          setClaimState({
            isLoading: false,
            isProcessing: false,
            error: null,
            success: true,
            transactionHash: result.transactionHash,
          });
        },
        onError: (error: any) => {
          console.error('Transaction error:', error);
          clearTimeout(timeoutId);
          let errorMessage = 'Transaction failed';
          
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error, please try again';
          } else {
            errorMessage = `Transaction failed: ${error.message}`;
          }

          setClaimState(prev => ({
            ...prev,
            isLoading: false,
            isProcessing: false,
            error: errorMessage,
            success: false,
            transactionHash: null,
          }));
        },
      });

    } catch (error) {
      console.error('Claim tokens error:', error);
      setClaimState(prev => ({
        ...prev,
        isLoading: false,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        success: false,
        transactionHash: null,
      }));
    }
  };

  const resetClaimState = () => {
    setClaimState({
      isLoading: false,
      isProcessing: false,
      error: null,
      success: false,
      transactionHash: null,
    });
  };

  return {
    claimState,
    claimTokens,
    resetClaimState,
    isTransactionPending,
  };
}
