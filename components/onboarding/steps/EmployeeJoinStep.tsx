'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Building, 
  Key,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Phone
} from 'lucide-react';
import type { OnboardingFormData } from '../OnboardingStepper';

interface EmployeeJoinStepProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function EmployeeJoinStep({ formData, updateFormData, onNext, onPrev }: EmployeeJoinStepProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const isValid = formData.organizationId.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsValidating(true);
    setValidationError('');

    try {
      // TODO: Validate organization ID exists
      // For now, we'll just proceed
      setTimeout(() => {
        setIsValidating(false);
        onNext();
      }, 1000);
      
    } catch (error) {
      setValidationError('Organization not found. Please check the ID and try again.');
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Join your organization
        </h2>
        <p className="text-gray-600">
          Your admin should have provided you with an organization ID to join your company's FleetFusion account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organizationId">Organization ID *</Label>
            <Input
              id="organizationId"
              type="text"
              placeholder="acme-trucking-llc"
              value={formData.organizationId}
              onChange={(e) => updateFormData({ organizationId: e.target.value.toLowerCase() })}
              required
            />
            <p className="text-xs text-gray-500">
              This is usually your company name in lowercase with dashes (e.g., "acme-trucking-llc")
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite Code (Optional)</Label>
            <Input
              id="inviteCode"
              type="text"
              placeholder="ABC123"
              value={formData.inviteCode}
              onChange={(e) => updateFormData({ inviteCode: e.target.value.toUpperCase() })}
            />
            <p className="text-xs text-gray-500">
              Some organizations require an invite code for additional security
            </p>
          </div>
        </div>

        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Help Section */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Don't have an Organization ID?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Your admin/owner needs to:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Complete their company setup first</li>
              <li>Go to Settings → User Management</li>
              <li>Generate an invite link or provide the Organization ID</li>
              <li>Share this information with you</li>
            </ol>
          </div>
        </div>

        {/* Contact Admin */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Phone className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Need help?</p>
              <p className="text-xs text-blue-600 mt-1">
                Contact your system administrator or the person who invited you to join. 
                They can provide the correct Organization ID and any required invite codes.
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
            disabled={isValidating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="w-full"
            disabled={!isValid || isValidating}
          >
            {isValidating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Validating...
              </>
            ) : (
              <>
                Join Organization
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
