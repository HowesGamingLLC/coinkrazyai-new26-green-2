import { useState, useEffect } from 'react';
import { Wallet } from '@shared/api';
import { io } from 'socket.io-client';

const socket = io();

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [currency, setCurrency] = useState<'GC' | 'SC'>('SC');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('auth_token');

        if (!token) {
          setIsLoading(false);
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
            setError('Session expired');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const res = await response.json();
        if (res.success && res.data) {
          setWallet({
            goldCoins: res.data.goldCoins,
            sweepsCoins: res.data.sweepsCoins
          });
        } else {
          setError(res.error || 'Failed to fetch wallet');
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch wallet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();

    // Poll wallet every 30 seconds
    const interval = setInterval(fetchWallet, 30000);

    // Listen for real-time wallet updates
    socket.on('wallet:update', (updatedWallet: Wallet) => {
      setWallet(updatedWallet);
    });

    return () => {
      clearInterval(interval);
      socket.off('wallet:update');
    };
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'GC' ? 'SC' : 'GC');
  };

  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const res = await response.json();
        if (res.success) {
          setWallet({
            goldCoins: res.data.goldCoins,
            sweepsCoins: res.data.sweepsCoins
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    wallet,
    currency,
    toggleCurrency,
    isLoading,
    error,
    refreshWallet
  };
}
