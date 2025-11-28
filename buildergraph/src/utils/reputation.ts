/**
 * Utility to calculate consistent reputation score across the app
 */

import type { Profile } from '../types/api.types';

/**
 * Calculate reputation score based on profile data
 * Formula: base (750) + skills (10 each) + experience (5 per year) + verified (50)
 */
export function calculateReputationScore(profile: Profile): number {
    let score = 750; // Base score

    // Skills contribution (10 points each, max 150)
    const skillsScore = Math.min((profile.skills?.length || 0) * 10, 150);
    score += skillsScore;

    // Experience contribution (5 points per year, max 100)
    const expScore = Math.min((profile.experience || 0) * 5, 100);
    score += expScore;

    // DKG verification bonus (50 points)
    if (profile.ual && profile.publish_status === 'completed') {
        score += 50;
    }

    // Languages bonus (5 points each, max 25)
    const langScore = Math.min((profile.languages?.length || 0) * 5, 25);
    score += langScore;

    // Cap at 999
    return Math.min(score, 999);
}

/**
 * Get reputation score from profile (uses cached or calculates)
 */
export function getReputationScore(profile: Profile): number {
    // If reputation_score is already calculated, use it
    if (profile.reputation_score) {
        return profile.reputation_score;
    }

    // Otherwise calculate it
    return calculateReputationScore(profile);
}
