/**
 * Endorsement Routes for BuilderGraph
 * Handles TRAC-staked endorsements for skills and projects
 */

import express from 'express';
import { endorsementQueries, profileQueries, projectQueries } from '../database/db.js';
import dkgjsService from '../services/dkgjs-service.js';
import { endorsementToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

/**
 * POST /api/endorsements
 * Create a new endorsement (skill or project)
 * Publishes to DKG asynchronously
 */
router.post('/', async (req, res) => {
    try {
        const endorsementData = req.body;

        // Validate required fields
        const requiredFields = ['endorserUAL', 'endorserUsername', 'endorserName', 'targetType', 'targetId', 'rating', 'message', 'tracStaked'];
        for (const field of requiredFields) {
            if (!endorsementData[field]) {
                return res.status(400).json({
                    success: false,
                    error: `Missing required field: ${field}`
                });
            }
        }

        // Validate target type
        if (!['skill', 'project'].includes(endorsementData.targetType)) {
            return res.status(400).json({
                success: false,
                error: 'target_type must be either "skill" or "project"'
            });
        }

        // Validate rating
        if (endorsementData.rating < 1 || endorsementData.rating > 5) {
            return res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
        }

        // Validate TRAC stake
        if (endorsementData.tracStaked < 100 || endorsementData.tracStaked > 10000) {
            return res.status(400).json({
                success: false,
                error: 'TRAC stake must be between 100 and 10,000'
            });
        }

        // Validate message length
        if (endorsementData.message.length < 10 || endorsementData.message.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Message must be between 10 and 500 characters'
            });
        }

        // For skill endorsements, require skillName
        if (endorsementData.targetType === 'skill' && !endorsementData.skillName) {
            return res.status(400).json({
                success: false,
                error: 'skillName is required for skill endorsements'
            });
        }

        // For project endorsements, require projectId
        if (endorsementData.targetType === 'project' && !endorsementData.projectId) {
            return res.status(400).json({
                success: false,
                error: 'projectId is required for project endorsements'
            });
        }

        // Verify target exists
        if (endorsementData.targetType === 'skill') {
            const targetProfile = await profileQueries.getByUal(endorsementData.targetId);
            if (!targetProfile) {
                return res.status(404).json({
                    success: false,
                    error: 'Target profile not found'
                });
            }
            endorsementData.targetUsername = targetProfile.username;
        } else if (endorsementData.targetType === 'project') {
            const targetProject = await projectQueries.getById(endorsementData.projectId);
            if (!targetProject) {
                return res.status(404).json({
                    success: false,
                    error: 'Target project not found'
                });
            }
        }

        // NOTE: Self-endorsement is allowed for demo purposes
        // In production, you may want to uncomment this check:
        // if (endorsementData.endorserUAL === endorsementData.targetId) {
        //     return res.status(400).json({
        //         success: false,
        //         error: 'Cannot endorse yourself'
        //     });
        // }

        console.log(`\n⭐ Creating endorsement: ${endorsementData.endorserName} → ${endorsementData.targetType}`);

        // Generate operation ID
        endorsementData.operationId = `endorsement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create endorsement in database
        const endorsementId = endorsementQueries.create(endorsementData);

        // Convert to JSON-LD
        const jsonldContent = endorsementToJSONLD({
            ...endorsementData,
            id: endorsementId
        });
        console.log('📄 JSON-LD generated');

        // Start async DKG publish
        console.log('🚀 Starting DKG publish...');
        endorsementQueries.updateStatus(endorsementId, 'publishing');

        // Publish in background (don't await)
        dkgjsService.createAssetSync(jsonldContent, 2)
            .then(result => {
                if (result.success && result.ual) {
                    console.log(`✅ Endorsement published to DKG: ${result.ual}`);
                    endorsementQueries.updateUal(endorsementId, result.ual, result.datasetRoot);
                } else {
                    console.error(`❌ DKG publish failed:`, result.error || 'Unknown error');
                    endorsementQueries.updateStatus(endorsementId, 'failed');
                }
            })
            .catch(error => {
                console.error(`❌ DKG publish failed:`, error);
                endorsementQueries.updateStatus(endorsementId, 'failed');
            });

        // Return immediately with operation ID
        res.status(202).json({
            success: true,
            message: 'Endorsement created, publishing to DKG...',
            endorsementId,
            operationId: endorsementData.operationId,
            status: 'publishing'
        });

    } catch (error) {
        console.error('Error creating endorsement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/endorsements/status/:operationId
 * Poll endorsement publishing status
 */
router.get('/status/:operationId', async (req, res) => {
    try {
        const { operationId } = req.params;

        const endorsement = endorsementQueries.getByOperationId(operationId);

        if (!endorsement) {
            return res.status(404).json({
                success: false,
                error: 'Endorsement not found'
            });
        }

        const response = {
            success: true,
            status: endorsement.publish_status,
            endorsementId: endorsement.id
        };

        if (endorsement.publish_status === 'completed') {
            response.ual = endorsement.ual;
            response.datasetRoot = endorsement.dataset_root;
            response.endorsement = {
                id: endorsement.id,
                endorser: endorsement.endorser_name,
                targetType: endorsement.target_type,
                skillName: endorsement.skill_name,
                rating: endorsement.rating,
                tracStaked: endorsement.trac_staked,
                ual: endorsement.ual
            };
        } else if (endorsement.publish_status === 'failed') {
            response.error = 'Publishing to DKG failed';
        }

        res.json(response);

    } catch (error) {
        console.error('Error getting endorsement status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/endorsements/user/:ual
 * Get all endorsements received by a user (skill endorsements)
 */
router.get('/user/:ual', async (req, res) => {
    try {
        const { ual } = req.params;

        const endorsements = endorsementQueries.getByUserUal(decodeURIComponent(ual));
        const stats = endorsementQueries.getStatsForUser(decodeURIComponent(ual));
        const topSkills = endorsementQueries.getTopSkills(decodeURIComponent(ual));

        res.json({
            success: true,
            count: endorsements.length,
            endorsements,
            stats: {
                totalEndorsements: stats.total_endorsements || 0,
                totalTracStaked: stats.total_trac_staked || 0,
                averageRating: parseFloat((stats.average_rating || 0).toFixed(2)),
                uniqueSkillsEndorsed: stats.unique_skills_endorsed || 0
            },
            topSkills
        });

    } catch (error) {
        console.error('Error getting user endorsements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/endorsements/project/:id
 * Get all endorsements for a project
 */
router.get('/project/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const endorsements = endorsementQueries.getByProjectId(parseInt(id));

        // Calculate stats
        const totalStake = endorsements.reduce((sum, e) => sum + parseFloat(e.trac_staked), 0);
        const avgRating = endorsements.length > 0
            ? endorsements.reduce((sum, e) => sum + e.rating, 0) / endorsements.length
            : 0;

        res.json({
            success: true,
            count: endorsements.length,
            endorsements,
            stats: {
                totalEndorsements: endorsements.length,
                totalTracStaked: totalStake,
                averageRating: parseFloat(avgRating.toFixed(2))
            }
        });

    } catch (error) {
        console.error('Error getting project endorsements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/endorsements/given/:ual
 * Get all endorsements given by a user
 */
router.get('/given/:ual', async (req, res) => {
    try {
        const { ual } = req.params;

        const endorsements = endorsementQueries.getGivenByUser(decodeURIComponent(ual));

        // Calculate total staked
        const activeEndorsements = endorsements.filter(e => !e.withdrawn_at);
        const totalStaked = activeEndorsements.reduce((sum, e) => sum + parseFloat(e.trac_staked), 0);

        res.json({
            success: true,
            count: endorsements.length,
            activeCount: activeEndorsements.length,
            totalStaked,
            endorsements
        });

    } catch (error) {
        console.error('Error getting given endorsements:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PUT /api/endorsements/:id/withdraw
 * Withdraw TRAC stake from an endorsement
 */
router.put('/:id/withdraw', async (req, res) => {
    try {
        const { id } = req.params;
        const { endorserUal } = req.body;

        if (!endorserUal) {
            return res.status(400).json({
                success: false,
                error: 'endorserUal is required'
            });
        }

        const endorsement = endorsementQueries.getById(parseInt(id));

        if (!endorsement) {
            return res.status(404).json({
                success: false,
                error: 'Endorsement not found'
            });
        }

        if (endorsement.endorser_ual !== endorserUal) {
            return res.status(403).json({
                success: false,
                error: 'Only the endorser can withdraw their stake'
            });
        }

        if (endorsement.withdrawn_at) {
            return res.status(400).json({
                success: false,
                error: 'Endorsement already withdrawn'
            });
        }

        endorsementQueries.withdraw(parseInt(id), endorserUal);

        res.json({
            success: true,
            message: `${endorsement.trac_staked} TRAC stake withdrawn`
        });

    } catch (error) {
        console.error('Error withdrawing endorsement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
