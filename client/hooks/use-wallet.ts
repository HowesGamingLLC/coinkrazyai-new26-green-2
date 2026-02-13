import { useState, useEffect } from 'react';
import { Wallet } from '@shared/api';

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [currency, setCurrency] = useState<'GC' | 'SC'>('SC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wallet')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setWallet(res.data);
        }
      })
      .finally(() => setIsLoading(false));
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
