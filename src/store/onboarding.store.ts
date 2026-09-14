import { create } from "zustand";

interface OnboardingState {
  isOpen: boolean;
  currentStep: number;
  openModal: (step?: number) => void;
  closeModal: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  hasCompletedOnboarding: (userId?: string) => boolean;
  markOnboardingCompleted: (userId?: string) => void;
  resetOnboarding: (userId?: string) => void;
}

const STORAGE_KEY_PREFIX = "loyal_onboarding_completed_";

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isOpen: false,
  currentStep: 0,

  openModal: (step = 0) => {
    set({ isOpen: true, currentStep: Math.min(Math.max(step, 0), 5) });
  },

  closeModal: () => {
    set({ isOpen: false });
  },

  setStep: (step: number) => {
    set({ currentStep: Math.min(Math.max(step, 0), 5) });
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 5) {
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  hasCompletedOnboarding: (userId?: string) => {
    if (typeof window === "undefined") return false;
    const key = `${STORAGE_KEY_PREFIX}${userId || "anonymous"}`;
    return localStorage.getItem(key) === "true";
  },

  markOnboardingCompleted: (userId?: string) => {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${userId || "anonymous"}`;
    localStorage.setItem(key, "true");
  },

  resetOnboarding: (userId?: string) => {
    if (typeof window === "undefined") return;
    const key = `${STORAGE_KEY_PREFIX}${userId || "anonymous"}`;
    localStorage.removeItem(key);
  },
}));
