/**
 * Profile API Routes
 */
import express from 'express';
import { profileQueries } from '../database/db.js';
import { publishAsset, getDKGExplorerURL } from '../services/dkg-service.js';
import { profileToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

/**
 * POST /api/profiles
 * Create a new profile and publish to DKG
 */
router.post('/', async (req, res) => {
    try {
        const profileData = req.body;

        // Validation
        if (!profileData.fullName || !profileData.username || !profileData.email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: fullName, username, email'
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
        const jsonld = profileToJSONLD(profileData);

        console.log('📄 JSON-LD generated:', JSON.stringify(jsonld, null, 2));

        // Publish to DKG
        const dkgResult = await publishAsset(jsonld, {
            sourceId: `profile-${profileData.username}`,
            username: profileData.username
        });



        if (!dkgResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to publish to DKG: ' + dkgResult.error
            });
        }

        // Save to database
        const dbProfile = {
            full_name: profileData.fullName,
            username: profileData.username,
            email: profileData.email,
            location: profileData.location || null,
            bio: profileData.bio || null,
            skills: profileData.skills || null,
            github_username: profileData.githubUsername || null,
            github_repos: profileData.githubRepos || null,
            ual: dkgResult.ual,
            dkg_asset_id: dkgResult.id
        };

        const result = profileQueries.insert(dbProfile);
        const profileId = result.lastInsertRowid;

        console.log(`✅ Profile created with ID: ${profileId}`);
        console.log(`🔗 UAL: ${dkgResult.ual || 'Pending...'}\n`);

        res.json({
            success: true,
            message: 'Profile created successfully',
            profile: {
                id: profileId,
                username: profileData.username,
                fullName: profileData.fullName,
                ual: dkgResult.ual,
                dkgAssetId: dkgResult.id,
                explorerUrl: dkgResult.ual ? getDKGExplorerURL(dkgResult.ual) : null
            }
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
 * GET /api/profiles/:id
 * Get profile by database ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const profile = profileQueries.getById(id);

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
                github_repos: profile.github_repos ? JSON.parse(profile.github_repos) : null,
                explorerUrl: profile.ual ? getDKGExplorerURL(profile.ual) : null
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
 * GET /api/profiles/ual/:ual
 * Get profile by UAL
 */
router.get('/ual/:ual', (req, res) => {
    try {
        const ual = decodeURIComponent(req.params.ual);
        const profile = profileQueries.getByUal(ual);

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
                github_repos: profile.github_repos ? JSON.parse(profile.github_repos) : null,
                explorerUrl: getDKGExplorerURL(profile.ual)
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
                github_repos: p.github_repos ? JSON.parse(p.github_repos) : null,
                explorerUrl: p.ual ? getDKGExplorerURL(p.ual) : null
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

export default router;
