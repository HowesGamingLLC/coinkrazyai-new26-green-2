import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share2, Facebook } from 'lucide-react';
import { toast } from 'sonner';

interface GameResultPopupProps {
  gameName: string;
  betAmount: number;
  winnings: number;
  isWin: boolean;
  newBalance: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

export function GameResultPopup({
  gameName,
  betAmount,
  winnings,
  isWin,
  newBalance,
  onClose,
  onPlayAgain
}: GameResultPopupProps) {
  const [isSharing, setIsSharing] = useState(false);

  const netResult = winnings - betAmount;
  const resultIcon = isWin ? '🎉' : '😅';
  const resultColor = isWin ? 'from-green-600 to-green-500' : 'from-orange-600 to-orange-500';
  const resultBorder = isWin ? 'border-green-400' : 'border-orange-400';

  // Create Facebook share message
  const handleFacebookShare = () => {
    setIsSharing(true);
    
    const message = isWin 
      ? `I just won ${winnings.toFixed(2)} SC playing ${gameName} on CoinKrazy casino! 🎰 Join me!`
      : `I just played ${gameName} on CoinKrazy casino! Give it a try! 🎰`;
    
    // Copy to clipboard for sharing
    const shareText = `${message}\n\nPlay now at CoinKrazy!`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        // Open Facebook share dialog
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(message)}`;
        
        window.open(facebookShareUrl, 'facebook-share-dialog', 'width=626,height=436');
        
        toast.success('Share message copied! You can paste it on Facebook.');
        setIsSharing(false);
      })
      .catch(() => {
        // Fallback: just show the message
        toast.info(shareText);
        setIsSharing(false);
      });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br ${resultColor} rounded-xl w-full max-w-md shadow-2xl overflow-hidden border-2 ${resultBorder}`}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="text-5xl">{resultIcon}</div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-100 transition-colors p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Result */}
        <div className="bg-gray-900/95 px-6 py-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">
              {isWin ? 'YOU WON!' : 'SPIN COMPLETE'}
            </h2>
            <p className="text-gray-400 text-sm">{gameName}</p>
          </div>

          {/* Bet Amount */}
          <div className="space-y-2 bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">You wagered</p>
            <p className="text-2xl font-bold text-gray-300">{betAmount.toFixed(2)} SC</p>
          </div>

          {/* Result Amount */}
          {isWin && (
            <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-4 space-y-2">
              <p className="text-gray-400 text-sm">You won</p>
              <p className="text-4xl font-bold text-green-400">{winnings.toFixed(2)} SC</p>
              <div className="pt-2 border-t border-green-500/30">
                <p className="text-xs text-gray-400">Net result</p>
                <p className={`text-lg font-bold ${netResult > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netResult > 0 ? '+' : ''}{netResult.toFixed(2)} SC
                </p>
              </div>
            </div>
          )}

          {!isWin && (
            <div className="bg-orange-900/40 border border-orange-500/50 rounded-lg p-4 space-y-2">
              <p className="text-gray-400 text-sm">Amount lost</p>
              <p className="text-2xl font-bold text-red-400">{betAmount.toFixed(2)} SC</p>
            </div>
          )}

          {/* New Balance */}
          <div className="bg-gray-800 rounded-lg p-4 border border-amber-500/20">
            <p className="text-gray-400 text-xs mb-1">Current Balance</p>
            <p className="text-3xl font-bold text-amber-400">{newBalance.toFixed(2)} SC</p>
          </div>

          {/* Share on Facebook Button */}
          {isWin && (
            <button
              onClick={handleFacebookShare}
              disabled={isSharing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Facebook className="h-5 w-5" />
              {isSharing ? 'Preparing...' : 'Share on Facebook'}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
            >
              Play Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
