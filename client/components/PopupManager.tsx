import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dailyBonus, apiCall } from '@/lib/api';
import { DailyLoginBonusPopup } from './popups/DailyLoginBonusPopup';
import { KYCOnboardingPopup } from './popups/KYCOnboardingPopup';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from 'sonner';

export const PopupManager = () => {
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { refreshWallet } = useWallet();
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [bonusData, setBonusData] = useState<any>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkPopups();
    }
  }, [isAuthenticated, user?.id]);

  const checkPopups = async () => {
    setIsLoading(true);
    try {
      // 1. Check KYC first
      if (!user?.kyc_verified) {
        const kycProgress = await apiCall<any>('/kyc/progress');
        if (kycProgress.success && !kycProgress.data?.is_completed) {
          setKycData(kycProgress.data);
          setShowKYC(true);
          setIsLoading(false);
          return; // Show KYC first, don't show daily bonus yet
        }
      }

      // 2. Check Daily Bonus
      const bonusStatus = await dailyBonus.getStatus();
      if (bonusStatus.success && bonusStatus.data?.can_claim) {
        setBonusData(bonusStatus.data);
        setShowDailyBonus(true);
      }
    } catch (error) {
      console.error('[PopupManager] Error checking popups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    try {
      const result = await dailyBonus.claim();
      if (result.success) {
        toast.success(`Claimed ${result.data.sc_amount} SC and ${result.data.gc_amount} GC!`);
        await refreshWallet();
        setShowDailyBonus(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim bonus');
    }
  };

  const handleKYCComplete = async () => {
    try {
      const result = await apiCall<any>('/kyc/complete', { method: 'POST' });
      if (result.success) {
        toast.success('KYC Verification submitted for review!');
        await refreshProfile();
        setShowKYC(false);
        // After KYC, check for daily bonus
        checkPopups();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete KYC');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {showKYC && kycData && (
        <KYCOnboardingPopup
          currentStep={kycData.current_step || 1}
          onComplete={handleKYCComplete}
          onSkip={() => setShowKYC(false)}
        />
      )}

      {showDailyBonus && bonusData && (
        <DailyLoginBonusPopup
          currentDay={bonusData.streak_days || 1}
          currentBonus={{
            day: bonusData.streak_days || 1,
            sc: bonusData.sc_amount || 0.5,
            gc: bonusData.gc_amount || 100
          }}
          nextBonus={{
            day: (bonusData.streak_days % 7) + 1,
            sc: bonusData.next_sc_amount || 1.0,
            gc: bonusData.next_gc_amount || 200
          }}
          onClaim={handleClaimBonus}
          onSkip={() => setShowDailyBonus(false)}
        />
      )}
    </>
  );
};
