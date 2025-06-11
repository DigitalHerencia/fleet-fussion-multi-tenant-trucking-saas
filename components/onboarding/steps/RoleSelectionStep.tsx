'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UserCog, 
  Users, 
  Truck, 
  ClipboardCheck, 
  Radio,
  Eye,
  ArrowRight,
  ArrowLeft,
  Crown
} from 'lucide-react';
import { SystemRoles } from '@/types/abac';
import type { SystemRole } from '@/types/abac';
import type { OnboardingFormData } from '../OnboardingStepper';

interface RoleSelectionStepProps {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const roleOptions = [
  {
    value: SystemRoles.ADMIN,
    label: 'Admin / Owner',
    description: 'Full access to manage the company and all operations',
    icon: Crown,
    color: 'text-purple-600 bg-purple-100',
  },
  {
    value: SystemRoles.DISPATCHER,
    label: 'Dispatcher',
    description: 'Manage loads, assign drivers, coordinate operations',
    icon: Radio,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    value: SystemRoles.DRIVER,
    label: 'Driver',
    description: 'View assigned loads, update status, log hours',
    icon: Truck,
    color: 'text-green-600 bg-green-100',
  },
  {
    value: SystemRoles.COMPLIANCE,
    label: 'Compliance Officer',
    description: 'Manage compliance documents, audit logs, safety records',
    icon: ClipboardCheck,
    color: 'text-orange-600 bg-orange-100',
  },
  {
    value: SystemRoles.MEMBER,
    label: 'Member / Employee',
    description: 'Basic access to view organization information',
    icon: UserCog,
    color: 'text-teal-600 bg-teal-100',
  },
];

export function RoleSelectionStep({ formData, updateFormData, onNext, onPrev }: RoleSelectionStepProps) {
  const selectedRole = roleOptions.find(role => role.value === formData.role);
  const isValid = formData.role !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What's your role?
        </h2>
        <p className="text-gray-600">
          This helps us customize your experience and set the right permissions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label htmlFor="role">Select Your Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value: SystemRole) => updateFormData({ role: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose your role in the organization" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded ${role.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Role Preview */}
        {selectedRole && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${selectedRole.color}`}>
                <selectedRole.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedRole.label}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedRole.description}</p>
                
                {formData.role === SystemRoles.ADMIN && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium">
                      👑 Admin Path Ahead!
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      As an admin, you'll set up your company information, DOT numbers, and initial settings.
                    </p>
                  </div>
                )}
                
                {formData.role !== SystemRoles.ADMIN && formData.role !== '' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 font-medium">
                      🎯 Employee Path
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      You'll need an organization ID from your admin to join your company.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
