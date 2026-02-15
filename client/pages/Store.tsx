import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { store } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Gift, TrendingUp, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { StorePack } from '@shared/api';
import { ReceiptModal } from '@/components/ui/ReceiptModal';
import { useLocation } from 'react-router-dom';
import { GOOGLE_PAY_MERCHANT_ID } from '@shared/constants';

interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  is_active: boolean;
}

const Store = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<StorePack[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);
  const [selectedPack, setSelectedPack] = useState<StorePack | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [googlePayReady, setGooglePayReady] = useState(false);
  const googlePayButtonRef = useRef<HTMLDivElement>(null);

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    title: string;
    description: string;
    amount: string;
    currency: 'GC' | 'SC';
  } | null>(null);

  const location = useLocation();

  // Initialize Google Pay
  useEffect(() => {
    const initializeGooglePay = async () => {
      if ((window as any).google?.payments) {
        try {
          const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
            environment: 'PRODUCTION'
          });

          const isReadyToPayRequest = {
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: 'CARD',
                parameters: {
                  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                  allowedCardNetworks: ['MASTERCARD', 'VISA']
                }
              }
            ]
          };

          const isReady = await paymentsClient.isReadyToPay(isReadyToPayRequest);
          setGooglePayReady(isReady.result);
        } catch (error) {
          console.warn('[GooglePay] Initialization error:', error);
          setGooglePayReady(false);
        }
      }
    };

    // Load Google Pay script
    if (document.getElementById('google-pay-script')) {
      initializeGooglePay();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-pay-script';
    script.src = 'https://pay.google.com/gstatic/gc/gstatic/loader.js';
    script.async = true;
    script.onload = initializeGooglePay;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    // Check for success URL params
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      setReceiptData({
        title: 'Coin Pack Purchase',
        description: 'Coins added to your wallet',
        amount: 'Varies', // We don't have the pack info here easily unless we fetch by session_id
        currency: 'GC'
      });
      setShowReceipt(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [packsRes, methodsRes] = await Promise.all([
          store.getPacks(),
          store.getPaymentMethods()
        ]);
        const packsData = packsRes.data || [];
        // Sort packs by price or position
        const sortedPacks = Array.isArray(packsData)
          ? packsData.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
          : [];
        setPacks(sortedPacks);

        const methodsData = methodsRes.data || [];
        const activeMethods = Array.isArray(methodsData) ? methodsData.filter((m: any) => m.is_active) : [];
        setPaymentMethods(activeMethods);

        // Set default payment method to Stripe if available
        const defaultMethod = activeMethods.find((m: any) => m.provider === 'stripe') || activeMethods[0];
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod);
        }
      } catch (error: any) {
        console.error('Failed to fetch store data:', error);
        toast.error('Failed to load store data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handlePurchase = async (pack: StorePack) => {
    setSelectedPack(pack);
    if (paymentMethods.length === 0) {
      toast.error('No payment methods available');
      return;
    }
    if (paymentMethods.length === 1) {
      setSelectedPaymentMethod(paymentMethods[0]);
    }
  };

  const processGooglePayPayment = async () => {
    if (!selectedPack) {
      toast.error('No package selected');
      return;
    }

    try {
      setIsPurchasing(selectedPack.id);
      const paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: 'PRODUCTION'
      });

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA', 'AMEX', 'DISCOVER']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                'stripe:version': '2020-08',
                'stripe:publishableKey': import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_default'
              }
            }
          }
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: Number(selectedPack.price_usd || 0).toFixed(2),
          currencyCode: 'USD'
        },
        merchantInfo: {
          merchantId: GOOGLE_PAY_MERCHANT_ID,
          merchantName: 'Coinkrazy'
        }
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      if (paymentData) {
        // Use Stripe payment token from Google Pay
        const token = paymentData.paymentMethodData.tokenizationData.token;

        // Send to backend for Stripe processing
        const response = await store.purchase(selectedPack.id, 'google_pay', token);
        if (response.success && response.data?.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
          return;
        }

        toast.success(`Purchase of ${selectedPack.title} completed! Coins added to your wallet.`);
        setSelectedPack(null);
        setSelectedPaymentMethod(null);
        setTimeout(() => navigate('/wallet'), 2000);
      }
    } catch (error: any) {
      // Handle Google Pay cancellation gracefully
      if (error.statusCode === 'CANCELED') {
        toast.info('Google Pay payment cancelled');
      } else {
        console.error('[GooglePay] Payment error:', error);
        toast.error(error.statusMessage || 'Google Pay payment failed');
      }
    } finally {
      setIsPurchasing(null);
    }
  };

  const processPurchase = async () => {
    if (!selectedPack || !selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Handle Google Pay separately
    if (selectedPaymentMethod.provider === 'google_pay') {
      if (!googlePayReady) {
        toast.error('Google Pay is not available');
        return;
      }
      await processGooglePayPayment();
      return;
    }

    setIsPurchasing(selectedPack.id);
    try {
      const response = await store.purchase(selectedPack.id, selectedPaymentMethod.provider);
      if (response.success && response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        return;
      }
      toast.success(`Purchase of ${selectedPack.title} completed! Check your wallet.`);
      setSelectedPack(null);
      setSelectedPaymentMethod(null);
      // Optionally refresh packs or navigate
      setTimeout(() => navigate('/wallet'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed');
    } finally {
      setIsPurchasing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight">COIN STORE</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Get more Gold Coins and Sweeps Coins to play your favorite games
        </p>
      </div>

      {/* Banner */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Zap className="w-12 h-12 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg">Limited Time Bonus</h3>
              <p className="text-muted-foreground">Get 20% extra coins on your first purchase!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packs Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Your Pack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs && packs.length > 0 ? (
            packs.map((pack) => (
              <Card
                key={pack.id}
                className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${
                  pack.is_best_value
                    ? 'border-primary ring-2 ring-primary/20'
                    : pack.is_popular
                    ? 'border-blue-400 ring-2 ring-blue-400/20'
                    : 'border-border'
                }`}
              >
                {pack.is_best_value && (
                  <div className="absolute -right-12 top-6 bg-primary text-primary-foreground px-20 py-1 rotate-45 text-sm font-bold">
                    BEST VALUE
                  </div>
                )}
                
                {pack.is_popular && !pack.is_best_value && (
                  <Badge className="absolute top-4 right-4 bg-blue-500">Popular</Badge>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">${Number(pack.price_usd ?? 0).toFixed(2)}</CardTitle>
                  <CardDescription>{pack.title}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">{pack.description}</p>

                  {/* Coins */}
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    {pack.gold_coins > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Gold Coins</span>
                        <span className="text-xl font-bold text-secondary">
                          {Number(pack.gold_coins ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {pack.sweeps_coins > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sweeps Coins</span>
                        <span className="text-xl font-bold text-primary">
                          {Number(pack.sweeps_coins ?? 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {pack.bonus_percentage > 0 && (
                      <div className="border-t border-border pt-3 flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Gift className="w-4 h-4" /> Bonus
                        </span>
                        <span className="font-bold text-green-600">+{pack.bonus_percentage}%</span>
                      </div>
                    )}
                  </div>

                  {/* Buy Button */}
                  <Button
                    onClick={() => handlePurchase(pack)}
                    disabled={isPurchasing === pack.id}
                    className={`w-full font-bold text-base ${
                      pack.is_best_value ? '' : ''
                    }`}
                    variant={pack.is_best_value ? 'default' : 'outline'}
                  >
                    {isPurchasing === pack.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Buy Now
                      </>
                    )}
                  </Button>

                  {pack.is_best_value && (
                    <p className="text-xs text-center text-primary font-semibold">
                      Save ${(Number(pack.price_usd ?? 0) * 0.15).toFixed(2)} vs Starter
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No packs available</p>
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">What's the difference between Gold Coins and Sweeps Coins?</h4>
            <p className="text-sm text-muted-foreground">
              Gold Coins are for fun play, while Sweeps Coins can be redeemed for real value. All games support both currencies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Are my coins safe?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! All transactions are encrypted and secured by industry-standard SSL technology.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I get a refund?</h4>
            <p className="text-sm text-muted-foreground">
              Refunds are available within 30 days of purchase. Contact our support team for details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection Modal */}
      {selectedPack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
              <CardDescription>
                Choose how you want to pay for {selectedPack.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Summary */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Package:</span>
                  <span className="font-semibold">{selectedPack.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-bold text-primary">${Number(selectedPack.price_usd).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between">
                  <span className="text-sm font-semibold">You'll receive:</span>
                  <div className="text-right">
                    <div className="text-secondary font-bold">{Number(selectedPack.gold_coins).toLocaleString()} GC</div>
                    <div className="text-primary font-bold">{Number(selectedPack.sweeps_coins).toFixed(2)} SC</div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">Select Payment Method</label>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-2">
                    {paymentMethods.map((method) => (
                      <div key={method.id}>
                        <button
                          onClick={() => setSelectedPaymentMethod(method)}
                          className={`w-full p-3 border rounded-lg cursor-pointer transition-all text-left ${
                            selectedPaymentMethod?.id === method.id
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {method.provider === 'google_pay' ? (
                                <div className="w-5 h-5 bg-[#4285f4] rounded-sm flex items-center justify-center text-xs font-bold text-white">
                                  G
                                </div>
                              ) : (
                                <CreditCard className="w-4 h-4" />
                              )}
                              <div>
                                <p className="font-semibold text-sm">{method.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {method.provider === 'google_pay'
                                    ? 'Fast and secure'
                                    : method.provider.replace('_', ' ').toUpperCase()}
                                </p>
                              </div>
                            </div>
                            {selectedPaymentMethod?.id === method.id && (
                              <Check className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </button>

                        {/* Google Pay Button - show when this method is selected */}
                        {method.provider === 'google_pay' && selectedPaymentMethod?.id === method.id && googlePayReady && (
                          <div
                            ref={googlePayButtonRef}
                            className="mt-2 bg-white rounded p-2"
                            id="google-pay-button"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No payment methods available</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPack(null);
                    setSelectedPaymentMethod(null);
                  }}
                  className="flex-1"
                  disabled={isPurchasing === selectedPack.id}
                >
                  Cancel
                </Button>
                {selectedPaymentMethod && (
                  <Button
                    onClick={selectedPaymentMethod.provider === 'google_pay' ? processGooglePayPayment : processPurchase}
                    disabled={isPurchasing === selectedPack.id}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  >
                    {isPurchasing === selectedPack.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        {selectedPaymentMethod.provider === 'google_pay' ? 'Pay with Google' : 'Pay'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {receiptData && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          title={receiptData.title}
          description={receiptData.description}
          amount={receiptData.amount}
          currency={receiptData.currency}
        />
      )}
    </div>
  );
};

export default Store;
