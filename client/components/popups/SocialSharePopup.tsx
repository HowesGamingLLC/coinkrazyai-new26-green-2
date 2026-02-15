import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Share2, Facebook, Twitter, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

interface SocialSharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  winAmount: number;
  gameName: string;
  gameId?: number;
}

export function SocialSharePopup({
  isOpen,
  onClose,
  winAmount,
  gameName,
  gameId,
}: SocialSharePopupProps) {
  const [sharedPlatforms, setSharedPlatforms] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://coinkrazy.ai';

  const preTypedMessage = `I just won ${winAmount.toFixed(2)} SC playing ${gameName} on CoinKrazy Social Casino! 🎰 Join me for free: ${appUrl}`;

  if (!isOpen) return null;

  const handleShareFacebook = async () => {
    try {
      setIsSharing(true);
      // Open Facebook share dialog
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(preTypedMessage)}`;
      
      window.open(facebookShareUrl, 'facebook-share-dialog', 'width=800,height=600');

      // Log the share
      await apiCall('/social-sharing/share', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gameId,
          game_name: gameName,
          win_amount: winAmount,
          platform: 'facebook',
          message: preTypedMessage,
        }),
      });

      setSharedPlatforms([...sharedPlatforms, 'facebook']);
      toast.success('Shared to Facebook!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareTwitter = async () => {
    try {
      setIsSharing(true);
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(preTypedMessage)}`;
      
      window.open(twitterShareUrl, 'twitter-share-dialog', 'width=550,height=420');

      await apiCall('/social-sharing/share', {
        method: 'POST',
        body: JSON.stringify({
          game_id: gameId,
          game_name: gameName,
          win_amount: winAmount,
          platform: 'twitter',
          message: preTypedMessage,
        }),
      });

      setSharedPlatforms([...sharedPlatforms, 'twitter']);
      toast.success('Shared to Twitter!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(preTypedMessage);
    setCopied(true);
    toast.success('Message copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-2xl">🎉 You Won!</CardTitle>
            <CardDescription>Share your win with friends</CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Win Amount */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 rounded-lg text-center">
            <p className="text-muted-foreground text-sm mb-1">You won</p>
            <p className="text-4xl font-black text-green-600">
              {winAmount.toFixed(2)} SC
            </p>
            <p className="text-muted-foreground text-sm mt-1">playing {gameName}</p>
          </div>

          {/* Pre-typed Message */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Share your win:</label>
            <div className="bg-muted p-3 rounded-lg border border-border">
              <p className="text-sm text-foreground leading-relaxed">
                {preTypedMessage}
              </p>
            </div>
            <Button
              onClick={handleCopyMessage}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Message
                </>
              )}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">Share on social media:</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleShareFacebook}
                disabled={isSharing || sharedPlatforms.includes('facebook')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sharedPlatforms.includes('facebook') ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Shared
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </>
                )}
              </Button>

              <Button
                onClick={handleShareTwitter}
                disabled={isSharing || sharedPlatforms.includes('twitter')}
                className="bg-sky-500 hover:bg-sky-600"
              >
                {sharedPlatforms.includes('twitter') ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Shared
                  </>
                ) : (
                  <>
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Badges for shares */}
          {sharedPlatforms.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Shared on:</p>
              <div className="flex gap-2 flex-wrap">
                {sharedPlatforms.map(platform => (
                  <Badge key={platform} variant="secondary">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button onClick={onClose} className="w-full" variant="outline">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
