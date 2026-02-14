import { useState, useEffect, useCallback } from 'react';
import { Wallet } from '@shared/api';
import { io } from 'socket.io-client';

let socket: ReturnType<typeof io> | null = null;

function getSocket() {
  if (!socket) {
    socket = io();
  }
  return socket;
}

interface WalletState {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    wallet: null,
    isLoading: true,
    error: null
  });
  const [currency, setCurrency] = useState<'GC' | 'SC'>('SC');

  // Fetch wallet data
  const fetchWallet = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          setState(prev => ({ ...prev, error: 'Session expired', isLoading: false }));
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (res.success && res.data) {
        setState(prev => ({
          ...prev,
          wallet: {
            goldCoins: res.data.goldCoins,
            sweepsCoins: res.data.sweepsCoins
          },
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: res.error || 'Failed to fetch wallet',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet',
        isLoading: false
      }));
    }
  }, []);

  // Setup wallet polling and socket listener
  useEffect(() => {
    fetchWallet();

    // Poll wallet every 30 seconds
    const interval = setInterval(fetchWallet, 30000);

    // Listen for real-time wallet updates
    const sock = getSocket();
    const handleWalletUpdate = (updatedWallet: Wallet) => {
      setState(prev => ({ ...prev, wallet: updatedWallet }));
    };

    sock.on('wallet:update', handleWalletUpdate);

    return () => {
      clearInterval(interval);
      sock.off('wallet:update', handleWalletUpdate);
    };
  }, [fetchWallet]);

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => prev === 'GC' ? 'SC' : 'GC');
  }, []);

  const refreshWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          setState(prev => ({
            ...prev,
            wallet: {
              goldCoins: res.data.goldCoins,
              sweepsCoins: res.data.sweepsCoins
            },
            isLoading: false
          }));
        }
      }
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return {
    wallet: state.wallet,
    currency,
    toggleCurrency,
    isLoading: state.isLoading,
    error: state.error,
    refreshWallet
  };
}
