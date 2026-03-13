/**
 * Custom hook for onboarding state management
 * Provides reactive state and actions for onboarding flow
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getOnboardingState,
  dismissOnboarding,
  completeOnboardingStep,
  shouldShowOnboarding,
  type OnboardingStep,
  type OnboardingState,
} from "@/lib/onboarding-state";

export function useOnboarding(hasVehicles: boolean) {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [isClient, setIsClient] = useState(false);

  // SSR: Wait for client-side hydration
  useEffect(() => {
    setIsClient(true);
    setState(getOnboardingState());
  }, []);

  // Check if onboarding should be visible
  const shouldShow = isClient && shouldShowOnboarding(hasVehicles);

  // Calculate progress (0-100)
  const progress = state
    ? Math.round((state.completedSteps.length / 3) * 100)
    : 0;

  // Dismiss handler
  const handleDismiss = useCallback(() => {
    dismissOnboarding();
    setState(getOnboardingState());
  }, []);

  // Complete step handler
  const handleCompleteStep = useCallback((step: OnboardingStep) => {
    completeOnboardingStep(step);
    setState(getOnboardingState());
  }, []);

  // Check if step is completed
  const isStepCompleted = useCallback(
    (step: OnboardingStep): boolean => {
      return state?.completedSteps.includes(step) ?? false;
    },
    [state]
  );

  return {
    shouldShow,
    progress,
    completedSteps: state?.completedSteps ?? [],
    isStepCompleted,
    dismiss: handleDismiss,
    completeStep: handleCompleteStep,
  };
}
