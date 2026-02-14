import React, { useEffect, useState } from 'react';
import { StorePack } from '@shared/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, ShieldCheck, Sparkles, Loader } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CoinAnimation } from '@/components/CoinAnimation';
import { ApiClient } from '@/lib/api';

const Store = () => {
  const [packs, setPacks] = useState<StorePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchPacks = async () => {
      try {
        const res = await ApiClient.getStorePacks();
        if (res.success && res.data) {
          setPacks(res.data);
        } else {
          toast({
            title: "Error",
            description: "Failed to load coin packs",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to fetch packs:', error);
        toast({
          title: "Error",
          description: "Failed to load coin packs",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const handlePurchase = async (packId: number) => {
    try {
      setIsProcessing(packId);
      setShowAnimation(true);

      const response = await ApiClient.purchasePack(packId, 'stripe');
      const data = response;

      if (data.success) {
        toast({
          title: "Checkout Session Created!",
          description: "Redirecting to payment...",
          className: "bg-primary text-primary-foreground font-bold"
        });

        // Redirect to Stripe checkout
        if (data.data?.checkoutUrl) {
          setTimeout(() => {
            window.location.href = data.data.checkoutUrl;
          }, 1500);
        } else {
          toast({
            title: "Info",
            description: "Session created. Check your email for payment link.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create checkout session",
          variant: "destructive"
        });
        setShowAnimation(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: "Failed to process purchase",
        variant: "destructive"
      });
      setShowAnimation(false);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading coin packs...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <CoinAnimation trigger={showAnimation} />
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter sm:text-6xl">GET <span className="text-primary">GOLD COINS</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose a Gold Coin pack below. Every purchase includes a <span className="text-primary font-bold">FREE Sweeps Coin bonus</span>!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packs.length > 0 ? (
          packs.map((pack) => (
            <Card
              key={pack.id}
              className="relative overflow-hidden border-2 border-border/50 hover:border-primary transition-all group flex flex-col"
            >
              {pack.is_best_value && (
                <div className="absolute top-0 right-0 z-10">
                  <Badge className="rounded-tr-none rounded-bl-lg bg-primary text-primary-foreground font-bold px-3 py-1">
                    BEST VALUE
                  </Badge>
                </div>
              )}
              {pack.is_popular && !pack.is_best_value && (
                <div className="absolute top-0 right-0 z-10">
                  <Badge className="rounded-tr-none rounded-bl-lg bg-green-500 text-white font-bold px-3 py-1">
                    POPULAR
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Coins className="w-10 h-10 text-secondary" />
                </div>
                <CardTitle className="text-2xl font-bold">{pack.title}</CardTitle>
                <CardDescription className="text-primary font-bold text-lg">
                  +{pack.sweeps_coins} FREE SC
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center flex-1">
                <div className="space-y-2">
                  <p className="text-4xl font-black">{pack.gold_coins.toLocaleString()}</p>
                  <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">
                    Gold Coins
                  </p>
                </div>
                {pack.bonus_percentage > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Badge className="bg-green-500/10 text-green-500 border-none">
                      {pack.bonus_percentage}% Bonus
                    </Badge>
                  </div>
                )}
                <div className="mt-8 pt-8 border-t border-border space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure Stripe Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                    <Zap className="w-4 h-4 text-primary" />
                    <span>Instant Credit</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6">
                <Button
                  onClick={() => handlePurchase(pack.id)}
                  disabled={isProcessing === pack.id}
                  className="w-full h-14 text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isProcessing === pack.id ? (
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  ${pack.price_usd.toFixed(2)}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No coin packs available</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trust Section */}
      <section className="bg-muted/50 rounded-3xl p-8 border border-border grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold">PCI Compliant</h3>
          <p className="text-sm text-muted-foreground">Payments are handled securely by Square. We never store your card details.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold">Instant Bonus</h3>
          <p className="text-sm text-muted-foreground">Your free Sweeps Coins are automatically credited to your wallet upon successful purchase.</p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold">KYC Verified</h3>
          <p className="text-sm text-muted-foreground">Fast and secure KYC process for all redemptions over 100 SC.</p>
        </div>
      </section>
    </div>
  );
};

export default Store;
