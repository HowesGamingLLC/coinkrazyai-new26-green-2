import { useState, useEffect } from 'react';
import { Wallet } from '@shared/api';
import { io } from 'socket.io-client';

const socket = io();

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [currency, setCurrency] = useState<'GC' | 'SC'>('SC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch('/api/wallet');
        if (!response.ok) throw new Error('Network response was not ok');
        const res = await response.json();
        if (res.success) {
          setWallet(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallet();

    // Listen for real-time wallet updates
    socket.on('wallet:update', (updatedWallet: Wallet) => {
      setWallet(updatedWallet);
    });

    return () => {
      socket.off('wallet:update');
    };
  }, []);

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'GC' ? 'SC' : 'GC');
  };

  return {
    wallet,
    currency,
    toggleCurrency,
    isLoading
  };
}
