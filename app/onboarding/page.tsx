"use client";

import * as React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "../../lib/actions/onboarding-actions";

export default function OnboardingComponent() {
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useUser();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError("");
    
    try {
      const res = await completeOnboarding(formData);
      
      if (res?.success) {
        console.log("Onboarding completed successfully");
        
        // Force a full reload of the user session to get updated metadata
        await user?.reload();
        
        // Add a small delay to allow Clerk to propagate the metadata
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Debug logs
        console.log("User metadata after reload:", user?.publicMetadata);
        
        // Check if onboardingComplete is set
        if (user?.publicMetadata && (user.publicMetadata as any).onboardingComplete === true) {
          router.push("/dashboard");
        } else {
          // If it's still not set, hard reload the page to force a full session refresh
          window.location.href = "/dashboard";
        }
      } else if (res?.error) {
        console.error("Onboarding error:", res.error);
        setError(res.error);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome</h1>
      <form action={handleSubmit}>
        <div>
          <label>Application Name</label>
          <p>Enter the name of your application.</p>
          <input type="text" name="applicationName" required />
        </div>
        <div>
          <label>Application Type</label>
          <p>Describe the type of your application.</p>
          <input type="text" name="applicationType" required />
        </div>
        {error && <p className="text-red-600">Error: {error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>
    </div>
  );
}
