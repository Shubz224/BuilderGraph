/**
 * User Store - Simple state management for user data
 * Uses localStorage for persistence
 */

import type { Profile } from '../types/api.types';

const USER_UAL_KEY = 'buildergraph_user_ual';
const USER_PROFILE_KEY = 'buildergraph_user_profile';

class UserStore {
    /**
     * Save user UAL to localStorage
     */
    saveUserUAL(ual: string): void {
        localStorage.setItem(USER_UAL_KEY, ual);
    }

    /**
     * Get user UAL from localStorage
     */
    getUserUAL(): string | null {
        return localStorage.getItem(USER_UAL_KEY);
    }

    /**
     * Check if user has a UAL (is logged in)
     */
    hasUser(): boolean {
        return !!this.getUserUAL();
    }

    /**
     * Save user profile data to localStorage (cache)
     */
    saveUserProfile(profile: Profile): void {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
        // Also save UAL
        if (profile.ual) {
            this.saveUserUAL(profile.ual);
        }
    }

    /**
     * Get cached user profile from localStorage
     */
    getUserProfile(): Profile | null {
        const cached = localStorage.getItem(USER_PROFILE_KEY);
        if (!cached) return null;

        try {
            return JSON.parse(cached) as Profile;
        } catch {
            return null;
        }
    }

    /**
     * Clear all user data (logout)
     */
    clearUser(): void {
        localStorage.removeItem(USER_UAL_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
    }

    /**
     * Get user's display name
     */
    getUserDisplayName(): string {
        const profile = this.getUserProfile();
        return profile?.full_name || profile?.username || 'Developer';
    }

    /**
     * Get user's username
     */
    getUsername(): string | null {
        const profile = this.getUserProfile();
        return profile?.username || null;
    }
}

export const userStore = new UserStore();
export default userStore;
