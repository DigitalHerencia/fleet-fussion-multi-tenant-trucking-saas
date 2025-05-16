"use client";

import { useRouter } from "next/navigation";
import { useUser, useOrganizationList } from "@clerk/nextjs";
import { Loader2, Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import logger from "@/lib/utils/logger";
import { getCompanyIdByClerkOrgId } from "@/lib/actions/company-actions"; // Import the action

export default function OrgSelectionPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    userMemberships,
    isLoaded: isOrgLoaded,
    setActive,
  } = useOrganizationList();

  // Show a loading state when checking for organizations
  if (!isUserLoaded || !isOrgLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If there are no organizations, redirect to onboarding
  if (userMemberships.data.length === 0) {
    router.push("/onboarding");
    return null;
  }

  const handleOrgSelect = async (clerkOrgId: string) => {
    try {
      logger.debug("OrgSelection: selecting org", { clerkOrgId });
      // Set the active organization in Clerk
      await setActive({ organization: clerkOrgId });
      logger.info("OrgSelection: org selected", { clerkOrgId });

      // Get the internal company ID
      if (!user?.id) {
        toast.error("User ID not found. Please sign in again.");
        logger.error("OrgSelection: User ID not found after selecting org.");
        router.push("/sign-in");
        return;
      }

      const companyResult = await getCompanyIdByClerkOrgId(clerkOrgId);

      if (companyResult.success && companyResult.companyId) {
        logger.info(
          "OrgSelection: companyId found, redirecting to dashboard",
          { companyId: companyResult.companyId, clerkUserId: user.id },
        );
        // Redirect to the company-specific dashboard
        router.push(`/${companyResult.companyId}/dashboard/${user.id}`);
      } else {
        logger.error(
          "OrgSelection: Failed to get companyId from clerkOrgId. Error:",
          companyResult.error,
        );
        toast.error(
          companyResult.error ||
            "Failed to map organization to company. Please try again or contact support.",
        );
        // Optionally, redirect to a specific error page or back to org selection
        // router.push("/org-selection?error=mapping_failed"); 
      }
    } catch (error) {
      logger.error("OrgSelection: error setting active organization or fetching companyId", error);
      toast.error("Failed to select organization. Please try again.");
    }
  };

  const handleCreateOrg = async () => {
    try {
      logger.debug("OrgSelection: create new org");
      // Redirect to onboarding after creating an organization if onboarding is not complete.
      // Similar to org selection, this ensures proper routing for new organizations.
      // Assumes Clerk and Neon are configured as this is part of the auth flow.
      router.push("/onboarding");
    } catch (error) {
      logger.error("OrgSelection: error redirecting to create organization", error);
      toast.error("Failed to create new organization. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center">
          <Image
            src="/map-pinned.png"
            alt="FleetFusion Logo"
            width={64}
            height={64}
            className="mx-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Select Your Company
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Welcome back, {user?.firstName || "there"}! Choose which company you
          want to access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="grid grid-cols-1 gap-4">
          {userMemberships.data.map(({ organization }) => (
            <Card
              key={organization.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleOrgSelect(organization.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{organization.name}</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOrgSelect(organization.id);
                  }}
                >
                  Select
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {organization.membersCount} members
                </p>
              </CardContent>
            </Card>
          ))}

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors border-dashed"
            onClick={handleCreateOrg}
          >
            <CardHeader className="flex flex-row items-center justify-center space-y-0 pb-2 pt-6">
              <div className="flex flex-col items-center justify-center">
                <Plus className="mb-2 h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Create New Company</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Set up a new trucking company in FleetFusion
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
