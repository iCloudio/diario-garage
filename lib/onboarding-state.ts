/**
 * Onboarding State Management
 * Handles localStorage persistence for onboarding progress
 */

const ONBOARDING_KEY = "diario-garage:onboarding";

export type OnboardingStep = "vehicle" | "deadlines" | "expense";

export type OnboardingState = {
  dismissed: boolean;
  completedSteps: OnboardingStep[];
  lastInteraction: string; // ISO date
};

const DEFAULT_STATE: OnboardingState = {
  dismissed: false,
  completedSteps: [],
  lastInteraction: new Date().toISOString(),
};

/**
 * Safe localStorage getter with SSR support
 */
function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

/**
 * Get onboarding state from localStorage
 */
export function getOnboardingState(): OnboardingState {
  const storage = getLocalStorage();
  if (!storage) return DEFAULT_STATE;

  try {
    const stored = storage.getItem(ONBOARDING_KEY);
    if (!stored) return DEFAULT_STATE;

    const parsed = JSON.parse(stored) as OnboardingState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch (error) {
    console.error("[Onboarding] Failed to parse state:", error);
    return DEFAULT_STATE;
  }
}

/**
 * Save onboarding state to localStorage
 */
export function saveOnboardingState(state: Partial<OnboardingState>): void {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    const current = getOnboardingState();
    const updated: OnboardingState = {
      ...current,
      ...state,
      lastInteraction: new Date().toISOString(),
    };

    storage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("[Onboarding] Failed to save state:", error);
  }
}

/**
 * Mark onboarding as dismissed
 */
export function dismissOnboarding(): void {
  saveOnboardingState({ dismissed: true });
}

/**
 * Complete an onboarding step
 */
export function completeOnboardingStep(step: OnboardingStep): void {
  const current = getOnboardingState();
  if (!current.completedSteps.includes(step)) {
    saveOnboardingState({
      completedSteps: [...current.completedSteps, step],
    });
  }
}

/**
 * Check if onboarding should be shown
 */
export function shouldShowOnboarding(hasVehicles: boolean): boolean {
  if (hasVehicles) return false; // Don't show if user already has vehicles

  const state = getOnboardingState();
  return !state.dismissed;
}

/**
 * Reset onboarding state (for testing)
 */
export function resetOnboarding(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  storage.removeItem(ONBOARDING_KEY);
}
