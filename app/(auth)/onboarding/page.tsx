/**
 * Onboarding Welcome Page
 * 
 * Initial onboarding step - user profile setup
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, Truck, Users, Building } from 'lucide-react'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: ''
  })

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full access to all features', icon: Building },
    { id: 'dispatcher', name: 'Dispatcher', description: 'Manage loads and dispatch', icon: Users },
    { id: 'driver', name: 'Driver', description: 'View assignments and logs', icon: Truck },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.role) {
      toast.error('Please select your role')
      return
    }

    setIsLoading(true)
    
    try {
      // Update user profile
      await user?.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Update user metadata with role
      await user?.update({
        unsafeMetadata: {
          role: formData.role,
          onboardingCompleted: false, // Will be completed after organization setup
        }
      })

      toast.success('Profile updated successfully!')
      router.push('/onboarding/organization')
      
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Let&apos;s get you set up with FleetFusion. This will only take a moment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>What&apos;s your role?</Label>
            <div className="grid gap-3">
              {roles.map((role) => (
                <label
                  key={role.id}
                  className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                    formData.role === role.id ? 'border-primary bg-accent' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    className="sr-only"
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  />
                  <div className="flex items-start gap-3">
                    <role.icon className="mt-1 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.id === 'admin' && (
                          <Badge variant="secondary" className="text-xs">Recommended</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to Organization Setup
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
