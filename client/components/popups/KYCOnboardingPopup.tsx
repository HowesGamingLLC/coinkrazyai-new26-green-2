import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileText,
  Phone,
  MapPin,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';

interface KYCOnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

const KYC_STEPS = [
  {
    step: 1,
    title: 'Identity Verification',
    description: 'Verify your identity with a government-issued ID',
    icon: FileText,
    fields: ['document_type', 'document_url'],
  },
  {
    step: 2,
    title: 'Address Verification',
    description: 'Confirm your residential address',
    icon: MapPin,
    fields: ['address', 'city', 'state', 'zip'],
  },
  {
    step: 3,
    title: 'Phone Verification',
    description: 'Verify your phone number',
    icon: Phone,
    fields: ['phone'],
  },
];

export function KYCOnboardingPopup({
  isOpen,
  onClose,
  onCompleted,
}: KYCOnboardingPopupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!isOpen) return null;

  const step = KYC_STEPS.find(s => s.step === currentStep);
  const Icon = step?.icon || AlertCircle;
  const progressPercent = (completedSteps.length / KYC_STEPS.length) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    if (!step) return;

    try {
      setIsLoading(true);

      // Submit KYC data
      await apiCall('/kyc/submit', {
        method: 'POST',
        body: JSON.stringify({
          step: currentStep,
          data: formData,
        }),
      });

      setCompletedSteps([...completedSteps, currentStep]);

      if (currentStep < KYC_STEPS.length) {
        setCurrentStep(currentStep + 1);
        setFormData({});
      } else {
        toast.success('KYC verification completed!');
        onCompleted?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit KYC');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skipping for now, but remind user
    if (currentStep < KYC_STEPS.length) {
      setCurrentStep(currentStep + 1);
      setFormData({});
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">LuckyAI Verification</h2>
              <p className="text-purple-100 text-sm">Complete your KYC to unlock rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <CardContent className="pt-6 space-y-6">
          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {KYC_STEPS.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Steps Indicator */}
          <div className="grid grid-cols-3 gap-2">
            {KYC_STEPS.map(s => {
              const StepIcon = s.icon;
              const isCompleted = completedSteps.includes(s.step);
              const isCurrent = s.step === currentStep;

              return (
                <button
                  key={s.step}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(s.step);
                  }}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${isCurrent
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/50'
                      : isCompleted
                      ? 'border-green-500/30 bg-green-500/10 cursor-pointer hover:bg-green-500/20'
                      : 'border-border bg-muted/50'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                    <span className="text-xs font-semibold">{s.step}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Step Content */}
          {step && (
            <div className="space-y-6 bg-muted/30 p-6 rounded-lg border border-border">
              {/* LuckyAI Message */}
              <div className="bg-white/50 border border-purple-200 p-4 rounded-lg space-y-2">
                <p className="text-sm font-semibold text-purple-900">
                  👋 Hi! I'm LuckyAI, your personal casino assistant
                </p>
                <p className="text-sm text-purple-800">
                  {step.description}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {step.step === 1 && (
                  <>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Document Type
                      </label>
                      <select
                        value={formData.document_type || ''}
                        onChange={e => handleInputChange('document_type', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      >
                        <option value="">Select document</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="national_id">National ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Upload Document
                      </label>
                      <input
                        type="file"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              handleInputChange('document_url', event.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg"
                      />
                    </div>
                  </>
                )}

                {step.step === 2 && (
                  <>
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Address
                      </label>
                      <Input
                        type="text"
                        placeholder="Street address"
                        value={formData.address || ''}
                        onChange={e => handleInputChange('address', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        type="text"
                        placeholder="City"
                        value={formData.city || ''}
                        onChange={e => handleInputChange('city', e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="State"
                        value={formData.state || ''}
                        onChange={e => handleInputChange('state', e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder="ZIP"
                        value={formData.zip || ''}
                        onChange={e => handleInputChange('zip', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {step.step === 3 && (
                  <div>
                    <label className="text-sm font-semibold mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone || ''}
                      onChange={e => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Info Alert */}
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-sm text-blue-700 flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>All your information is encrypted and protected</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <Button onClick={handleSkip} variant="ghost">
              Skip for Now
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : currentStep === KYC_STEPS.length ? (
                'Complete Verification'
              ) : (
                'Next Step'
              )}
            </Button>
          </div>

          {/* Completion Info */}
          {completedSteps.length === KYC_STEPS.length && (
            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg text-center">
              <p className="text-green-700 font-bold">✓ All steps completed!</p>
              <p className="text-sm text-green-600 mt-1">You can now enjoy all features</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
