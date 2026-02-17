import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BetSelectorProps {
  minBet: number;
  maxBet: number;
  currentBalance: number;
  onBetSelect: (amount: number) => void;
  isProcessing?: boolean;
}

export const BetSelector: React.FC<BetSelectorProps> = ({
  minBet,
  maxBet,
  currentBalance,
  onBetSelect,
  isProcessing = false
}) => {
  const [betAmount, setBetAmount] = useState<string>(minBet.toFixed(2));
  
  // Quick bet buttons
  const quickBets = [0.01, 0.05, 0.10, 0.50, 1.00, 5.00].filter(
    bet => bet >= minBet && bet <= maxBet && bet <= currentBalance
  );

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove non-numeric characters except decimal
    value = value.replace(/[^\d.]/g, '');
    
    // Allow only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimals to 2 places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setBetAmount(value);
  };

  const handleQuickBet = (amount: number) => {
    setBetAmount(amount.toFixed(2));
  };

  const handleSpin = () => {
    const amount = parseFloat(betAmount);
    
    // Validate
    if (isNaN(amount)) {
      alert('Please enter a valid bet amount');
      return;
    }
    
    if (amount < minBet) {
      alert(`Minimum bet is ${minBet.toFixed(2)} SC`);
      return;
    }
    
    if (amount > maxBet) {
      alert(`Maximum bet is ${maxBet.toFixed(2)} SC`);
      return;
    }
    
    if (amount > currentBalance) {
      alert(`Insufficient balance. You have ${currentBalance.toFixed(2)} SC`);
      return;
    }
    
    onBetSelect(amount);
  };

  const isValidBet = () => {
    const amount = parseFloat(betAmount);
    return (
      !isNaN(amount) &&
      amount >= minBet &&
      amount <= maxBet &&
      amount <= currentBalance
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bet-amount">Bet Amount (SC)</Label>
        <Input
          id="bet-amount"
          type="text"
          inputMode="decimal"
          value={betAmount}
          onChange={handleBetChange}
          disabled={isProcessing}
          placeholder={minBet.toFixed(2)}
          className="text-lg font-bold text-center"
        />
        <div className="text-xs text-muted-foreground text-center">
          Balance: {currentBalance.toFixed(2)} SC | Min: {minBet.toFixed(2)} SC | Max: {maxBet.toFixed(2)} SC
        </div>
      </div>

      {/* Quick bet buttons */}
      <div className="space-y-2">
        <Label className="text-xs">Quick Bets</Label>
        <div className="grid grid-cols-3 gap-2">
          {quickBets.map((bet) => (
            <Button
              key={bet}
              variant={parseFloat(betAmount) === bet ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleQuickBet(bet)}
              disabled={isProcessing}
              className="text-xs"
            >
              {bet.toFixed(2)} SC
            </Button>
          ))}
        </div>
      </div>

      {/* Spin button */}
      <Button
        onClick={handleSpin}
        disabled={!isValidBet() || isProcessing}
        className="w-full text-lg font-bold py-6"
        size="lg"
      >
        {isProcessing ? 'Spinning...' : 'SPIN'}
      </Button>

      {/* Balance warning */}
      {currentBalance < minBet && (
        <div className="bg-destructive/20 border border-destructive/50 rounded text-destructive text-sm p-3">
          Insufficient balance. You need at least {minBet.toFixed(2)} SC to play.
        </div>
      )}
    </div>
  );
};
