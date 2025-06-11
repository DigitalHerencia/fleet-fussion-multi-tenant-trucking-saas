'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  MapPin, 
  Phone, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Crown,
  Shield
} from 'lucide-react';
import type { OnboardingFormData } from '../OnboardingStepper';

interface CompanySetupStepProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function CompanySetupStep({ formData, updateFormData, onNext, onPrev }: CompanySetupStepProps) {
  const isValid = formData.companyName.trim() && 
                  formData.address.trim() && 
                  formData.city.trim() && 
                  formData.state.trim() && 
                  formData.zip.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Set up your company
        </h2>
        <p className="text-gray-600">
          Let's get your trucking operation configured. We'll need some basic company information to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* Company Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Building className="h-5 w-5" />
            Company Information
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="e.g., Acme Trucking LLC"
              value={formData.companyName}
              onChange={(e) => updateFormData({ companyName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Company Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MapPin className="h-5 w-5" />
            Business Address
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              type="text"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                type="text"
                placeholder="Los Angeles"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                type="text"
                placeholder="CA"
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code *</Label>
            <Input
              id="zip"
              type="text"
              placeholder="90210"
              value={formData.zip}
              onChange={(e) => updateFormData({ zip: e.target.value })}
              required
            />
          </div>
        </div>

        {/* DOT/MC Numbers */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield className="h-5 w-5" />
            DOT & MC Numbers
          </div>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              <strong>Optional but recommended:</strong> These help us provide better compliance tracking and IFTA reporting features.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dotNumber">DOT Number</Label>
              <Input
                id="dotNumber"
                type="text"
                placeholder="1234567"
                value={formData.dotNumber}
                onChange={(e) => updateFormData({ dotNumber: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                US Department of Transportation number
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mcNumber">MC Number</Label>
              <Input
                id="mcNumber"
                type="text"
                placeholder="MC-123456"
                value={formData.mcNumber}
                onChange={(e) => updateFormData({ mcNumber: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Motor Carrier identification number
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Privacy & Security</p>
              <p className="text-xs text-blue-600 mt-1">
                All information is encrypted and stored securely. We comply with industry standards 
                for protecting your business data. No information is shared with third parties without your consent.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrev}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!isValid}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
