/**
 * Profile API Routes - DKG.js SDK Integration
 */
import express from 'express';
import { profileQueries } from '../database/db.js';
import dkgjsService from '../services/dkgjs-service.js';
import { profileToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

// Store in-flight operations (in production, use Redis or database)
const publishOperations = new Map();

/**
 * Validate profile data
 */
function validateProfileData(data) {
    const errors = [];

    // Required fields
    if (!data.fullName || data.fullName.trim() === '') {
        errors.push('Full name is required');
    }

    if (!data.username || data.username.trim() === '') {
        errors.push('Username is required');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
        errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    if (!data.email || data.email.trim() === '') {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * POST /api/profiles
 * Create a new profile and publish to DKG (async)
 */
router.post('/', async (req, res) => {
    try {
        const profileData = req.body;

        // Validate input data
        const validation = validateProfileData(profileData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }

        // Check if username already exists
        const existingProfile = profileQueries.getByUsername(profileData.username);
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                error: 'Username already exists'
            });
        }

        console.log(`\n📝 Creating profile for: ${profileData.fullName} (@${profileData.username})`);

        // Convert to JSON-LD
        const jsonldContent = profileToJSONLD(profileData);
        console.log('📄 JSON-LD generated');

        // Start async DKG publish
        const publishResult = await dkgjsService.publishAssetAsync(jsonldContent, 6);

        if (!publishResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to start DKG publishing: ' + publishResult.error
            });
        }

        // Save to database with pending status
        const operationId = `profile-${Date.now()}-${profileData.username}`;
        const dbProfile = {
            full_name: profileData.fullName,
            username: profileData.username,
            email: profileData.email,
            location: profileData.location || null,
            bio: profileData.bio || null,
            skills: profileData.skills || null,
            experience: profileData.experience || null,
            languages: profileData.languages || null,
            specializations: profileData.specializations || null,
            github_username: profileData.githubUsername || null,
            github_repos: profileData.githubRepos || null,
            publish_status: 'publishing',
            operation_id: operationId
        };

        const result = profileQueries.insert(dbProfile);
        const profileId = result.lastInsertRowid;

        // Store the promise for status checking
        publishOperations.set(operationId, {
            promise: publishResult.promise,
            profileId: profileId,
            startedAt: new Date().toISOString()
        });

        console.log(`✅ Profile saved with ID: ${profileId}`);
        console.log(`⏳ DKG publishing in progress. Operation ID: ${operationId}\n`);

        // Return immediately
        res.json({
            success: true,
            message: 'Profile created, DKG publishing in progress',
            profileId: profileId,
            operationId: operationId,
            status: 'publishing'
        });

        // Handle publish completion in background
        dkgjsService.waitForAssetPublish(publishResult.promise).then(publishComplete => {
            if (publishComplete.success) {
                profileQueries.updatePublishStatus(
                    profileId,
                    'completed',
                    publishComplete.ual,
                    publishComplete.datasetRoot
                );
                console.log(`✅ Profile ${profileId} published successfully. UAL: ${publishComplete.ual}`);
            } else {
                profileQueries.updatePublishStatus(profileId, 'failed');
                console.error(`❌ Profile ${profileId} publishing failed:`, publishComplete.error);
            }
            publishOperations.delete(operationId);
        }).catch(error => {
            profileQueries.updatePublishStatus(profileId, 'failed');
            console.error(`❌ Profile ${profileId} publishing error:`, error.message);
            publishOperations.delete(operationId);
        });

    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/profiles/status/:operationId
 * Check profile publishing status
 */
router.get('/status/:operationId', async (req, res) => {
    try {
        const { operationId } = req.params;

        // Check database for profile
        const profile = profileQueries.getByOperationId(operationId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Operation not found'
            });
        }

        // If already completed or failed, return from DB
        if (profile.publish_status === 'completed') {
            return res.json({
                success: true,
                status: 'completed',
                ual: profile.ual,
                datasetRoot: profile.dataset_root,
                profile: {
                    id: profile.id,
                    username: profile.username,
                    fullName: profile.full_name,
                    email: profile.email,
                    ual: profile.ual
                }
            });
        }

        if (profile.publish_status === 'failed') {
            return res.json({
                success: false,
                status: 'failed',
                error: 'Asset publishing failed'
            });
        }

        // Still publishing
        res.json({
            success: true,
            status: 'publishing',
            message: 'DKG asset publishing in progress',
            profileId: profile.id
        });

    } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/profiles/:identifier
 * Get profile by ID or UAL
 */
router.get('/:identifier', (req, res) => {
    try {
        const { identifier } = req.params;
        let profile;

        // Check if it's a numeric ID or UAL
        if (/^\d+$/.test(identifier)) {
            profile = profileQueries.getById(parseInt(identifier));
        } else {
            // It's a UAL (decode it)
            const ual = decodeURIComponent(identifier);
            profile = profileQueries.getByUal(ual);
        }

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile: {
                ...profile,
                skills: profile.skills ? JSON.parse(profile.skills) : null,
                languages: profile.languages ? JSON.parse(profile.languages) : null,
                specializations: profile.specializations ? JSON.parse(profile.specializations) : null,
                github_repos: profile.github_repos ? JSON.parse(profile.github_repos) : null,
                explorerUrl: profile.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(profile.ual)}` : null
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/profiles
 * Get all profiles
 */
router.get('/', (req, res) => {
    try {
        const profiles = profileQueries.getAll();

        res.json({
            success: true,
            count: profiles.length,
            profiles: profiles.map(p => ({
                ...p,
                skills: p.skills ? JSON.parse(p.skills) : null,
                languages: p.languages ? JSON.parse(p.languages) : null,
                specializations: p.specializations ? JSON.parse(p.specializations) : null,
                github_repos: p.github_repos ? JSON.parse(p.github_repos) : null,
                explorerUrl: p.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(p.ual)}` : null
            }))
        });

    } catch (error) {
        console.error('Error fetching profiles:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/profiles/username/:username
 * Get profile by username
 */
router.get('/username/:username', (req, res) => {
    try {
        const { username } = req.params;
        const profile = profileQueries.getByUsername(username);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Profile not found'
            });
        }

        res.json({
            success: true,
            profile: {
                ...profile,
                skills: profile.skills ? JSON.parse(profile.skills) : [],
                languages: profile.languages ? JSON.parse(profile.languages) : [],
                specializations: profile.specializations ? JSON.parse(profile.specializations) : [],
                github_repos: profile.github_repos ? JSON.parse(profile.github_repos) : [],
                ual: profile.ual || null,
                dataset_root: profile.dataset_root || null,
                explorerUrl: profile.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(profile.ual)}` : null
            }
        });

    } catch (error) {
        console.error('Error fetching profile by username:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
