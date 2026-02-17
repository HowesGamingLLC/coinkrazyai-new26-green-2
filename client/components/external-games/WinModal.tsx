import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Facebook, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameName: string;
  winAmount: number;
  playerUsername: string;
  referralLink: string;
  onShare: (platform: string) => Promise<void>;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  onClose,
  gameName,
  winAmount,
  playerUsername,
  referralLink,
  onShare
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shareMessage = `I just won ${winAmount.toFixed(2)} SC playing ${gameName} on CoinKrazy! 🎉 You could too! Join with my link: `;

  const handleFacebookShare = async () => {
    try {
      setIsSharing(true);
      await onShare('facebook');
      setShared('facebook');
      toast.success('Shared to Facebook!');
      
      // Open Facebook share dialog
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(shareMessage + referralLink)}`;
      window.open(url, '_blank', 'width=600,height=400');
    } catch (error) {
      toast.error('Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyMessage = () => {
    const fullMessage = shareMessage + referralLink;
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">🎉 You Won!</DialogTitle>
          <DialogDescription className="text-center">
            Congratulations on your win!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Win Details */}
          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 text-center space-y-2">
            <div className="text-sm text-muted-foreground">Game</div>
            <div className="text-lg font-bold">{gameName}</div>
            
            <div className="text-sm text-muted-foreground mt-4">You Won</div>
            <div className="text-4xl font-black text-primary">
              {winAmount.toFixed(2)}
              <span className="text-xl ml-2">SC</span>
            </div>
          </div>

          {/* Share Section */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold text-center flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Your Win
            </h3>

            {/* Facebook Share */}
            <Button
              onClick={handleFacebookShare}
              disabled={isSharing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Facebook className="w-4 h-4 mr-2" />
              {isSharing ? 'Sharing...' : 'Share to Facebook'}
            </Button>

            {/* Copy Message */}
            <Button
              onClick={handleCopyMessage}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Message
                </>
              )}
            </Button>

            {/* Copy Link */}
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Referral Link
                </>
              )}
            </Button>

            {/* Referral Link Display */}
            <div className="bg-muted rounded p-3 text-xs break-all text-center text-muted-foreground">
              {referralLink}
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="secondary"
            className="w-full"
          >
            Continue Playing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
