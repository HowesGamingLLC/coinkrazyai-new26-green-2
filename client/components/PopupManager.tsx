import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { dailyBonus, apiCall } from '@/lib/api';
import { DailyLoginBonusPopup } from './daily-bonus/DailyLoginBonusPopup';
import { KYCOnboardingPopup } from './kyc/KYCOnboardingPopup';
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
    await refreshWallet();
    setShowDailyBonus(false);
  };

  const handleKYCComplete = async () => {
    await refreshProfile();
    setShowKYC(false);
    // After KYC, check for daily bonus
    checkPopups();
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <KYCOnboardingPopup
        isOpen={showKYC}
        onClose={() => setShowKYC(false)}
        onComplete={handleKYCComplete}
      />

      <DailyLoginBonusPopup
        isOpen={showDailyBonus}
        onClose={() => setShowDailyBonus(false)}
        onBonusClaimed={handleClaimBonus}
      />
    </>
  );
};
