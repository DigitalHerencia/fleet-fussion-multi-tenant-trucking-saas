'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowLeft,
  User,
  Building,
  Users,
  Crown,
  Sparkles,
  Rocket
} from 'lucide-react';
import type { OnboardingFormData } from '../OnboardingStepper';

interface ReviewSubmitStepProps {
  formData: OnboardingFormData;
  isAdmin: boolean;
  onSubmit: () => void;
  onPrev: () => void;
  isLoading: boolean;
}

export function ReviewSubmitStep({ 
  formData, 
  isAdmin, 
  onSubmit, 
  onPrev, 
  isLoading 
}: ReviewSubmitStepProps) {
    const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-900/30 text-purple-300 border-purple-700/30';
      case 'dispatcher': return 'bg-blue-900/30 text-blue-300 border-blue-700/30';
      case 'driver': return 'bg-green-900/30 text-green-300 border-green-700/30';
      case 'compliance_officer': return 'bg-orange-900/30 text-orange-300 border-orange-700/30';
      case 'accountant': return 'bg-teal-900/30 text-teal-300 border-teal-700/30';
      default: return 'bg-neutral-800 text-gray-300 border-neutral-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin / Owner';
      case 'dispatcher': return 'Dispatcher';
      case 'driver': return 'Driver';
      case 'compliance_officer': return 'Compliance Officer';
      case 'accountant': return 'Accountant';
      case 'viewer': return 'Viewer';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Almost there! 🎉
        </h2>
        <p className="text-gray-600">
          Please review your information before we complete your setup.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{formData.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Role:</span>
              <Badge className={getRoleBadgeColor(formData.role)}>
                {getRoleDisplayName(formData.role)}
                {formData.role === 'admin' && <Crown className="ml-1 h-3 w-3" />}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Company Information (Admin only) */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Company Name:</span>
                <span className="font-medium">{formData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right">
                  {formData.address}<br />
                  {formData.city}, {formData.state} {formData.zip}
                </span>
              </div>
              {formData.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{formData.phone}</span>
                </div>
              )}
              {formData.dotNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">DOT Number:</span>
                  <span className="font-medium">{formData.dotNumber}</span>
                </div>
              )}
              {formData.mcNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">MC Number:</span>
                  <span className="font-medium">{formData.mcNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Organization Join (Employee only) */}
        {!isAdmin && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Organization ID:</span>
                <span className="font-medium">{formData.organizationId}</span>
              </div>
              {formData.inviteCode && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invite Code:</span>
                  <span className="font-medium">{formData.inviteCode}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Sparkles className="h-5 w-5" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {isAdmin ? (
                <>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Your organization will be created
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    You'll get full admin access to manage everything
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    You can invite team members from Settings
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Add vehicles, drivers, and start managing loads
                  </p>
                </>
              ) : (
                <>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    You'll join your organization
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Access will be configured based on your role
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    You'll see your personalized dashboard
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Start collaborating with your team
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fun Message */}
        <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 font-medium">
            🌴 While we can't offer that trip to Tahiti... 
          </p>
          <p className="text-yellow-600 text-sm mt-1">
            ...we promise your new dashboard is going to be pretty awesome! 
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4 max-w-md mx-auto">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrev}
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={onSubmit}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Setting up...
            </>
          ) : (
            <>
              Complete Setup
              <Rocket className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
