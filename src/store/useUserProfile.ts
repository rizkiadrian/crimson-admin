import { create } from "zustand";
import { authService } from "@services/auth";
import type { IUserAuth } from "@services/auth";

interface UserProfileState {
  /** The currently authenticated user's profile data */
  profile: IUserAuth | null;
  /** Whether the profile is currently being fetched */
  isLoading: boolean;

  /** Set the profile data directly */
  setProfile: (profile: IUserAuth | null) => void;
  /** Fetch the profile from the /me API endpoint */
  fetchProfile: () => Promise<void>;
  /** Clear the profile data (e.g., on logout) */
  clearProfile: () => void;
}

export const useUserProfile = create<UserProfileState>((set) => ({
  profile: null,
  isLoading: false,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await authService.me();
      set({ profile: res.data, isLoading: false });
    } catch {
      // Silently fail or handle error appropriately, setting profile to null
      set({ profile: null, isLoading: false });
    }
  },

  clearProfile: () => set({ profile: null }),
}));
