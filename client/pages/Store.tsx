import React, { useEffect, useState } from 'react';
import { GCPack } from '@shared/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CoinAnimation } from '@/components/CoinAnimation';

const Store = () => {
  const [packs, setPacks] = useState<GCPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    fetch('/api/store/packs')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPacks(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handlePurchase = async (packId: string) => {
    try {
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 2000);

      const response = await fetch('/api/store/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId })
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Redirecting to Square",
          description: "You are being redirected to our secure payment gateway.",
        });
        // Simulate redirect
        setTimeout(() => {
          window.open(data.data.checkoutUrl, '_blank');
        }, 1000);
      }
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    }
  };

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
        {packs.map((pack) => (
          <Card key={pack.id} className="relative overflow-hidden border-2 border-border/50 hover:border-primary transition-all group flex flex-col">
            {pack.price > 20 && (
              <div className="absolute top-0 right-0">
                <Badge className="rounded-tr-none rounded-bl-lg bg-primary text-primary-foreground font-bold px-3 py-1">BEST VALUE</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pt-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-10 h-10 text-secondary" />
              </div>
              <CardTitle className="text-2xl font-bold">{pack.title}</CardTitle>
              <CardDescription className="text-primary font-bold text-lg">
                +{pack.sweepsCoinsBonus} FREE SC
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center flex-1">
              <div className="space-y-2">
                <p className="text-4xl font-black">{pack.goldCoins.toLocaleString()}</p>
                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Gold Coins</p>
              </div>
              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Secure Square Payment</span>
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
                className="w-full h-14 text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90"
              >
                ${pack.price}
              </Button>
            </CardFooter>
          </Card>
        ))}
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
