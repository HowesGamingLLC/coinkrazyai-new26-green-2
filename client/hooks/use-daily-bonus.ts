import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface DailyBonus {
  day: number;
  sc: number;
  gc: number;
}

export const useDailyBonus = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [bonusData, setBonusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !sessionStorage.getItem('daily_bonus_checked')) {
      checkDailyBonus();
      sessionStorage.setItem('daily_bonus_checked', 'true');
    }
  }, [isAuthenticated]);

  const checkDailyBonus = async () => {
    try {
      const response = await fetch('/api/daily-bonus');
      const result = await response.json();
      
      if (result.success && result.data && result.data.canClaim) {
        setBonusData(result.data);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Failed to check daily bonus:', error);
    }
  };

  const claimBonus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/daily-bonus/claim', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Claimed ${result.data.gc} GC and ${result.data.sc} SC! 🎁`);
        await refreshProfile();
        setShowPopup(false);
      } else {
        toast.error(result.message || 'Failed to claim bonus');
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      toast.error('An error occurred while claiming your bonus');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    showPopup,
    setShowPopup,
    bonusData,
    claimBonus,
    isLoading
  };
};
