/**
 * Project API Routes - DKG.js SDK Integration
 */
import express from 'express';
import { projectQueries, profileQueries } from '../database/db.js';
import dkgjsService from '../services/dkgjs-service.js';
import { projectToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

// Store in-flight operations (in production, use Redis or database)
const publishOperations = new Map();

/**
 * POST /api/projects
 * Create a new project and publish to DKG (async) with owner UAL linking
 */
router.post('/', async (req, res) => {
    try {
        const projectData = req.body;

        console.log('\n📦 Creating new project...');
        console.log('Project data:', JSON.stringify(projectData, null, 2));

        // Validate owner UAL is provided
        if (!projectData.ownerUAL) {
            return res.status(400).json({
                success: false,
                error: 'ownerUAL is required'
            });
        }

        // Verify owner exists
        const owner = profileQueries.getByUal(projectData.ownerUAL);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner profile not found'
            });
        }

        console.log(`\n📝 Creating project: ${projectData.name} (owner: ${owner.username})`);

        // Convert to JSON-LD (linked to owner)
        const jsonldContent = projectToJSONLD(projectData, projectData.ownerUAL);
        console.log('📄 JSON-LD generated with owner link');

        // Start async DKG publish
        const publishResult = await dkgjsService.publishAssetAsync(jsonldContent, 6);

        if (!publishResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to start DKG publishing: ' + publishResult.error
            });
        }

        // Save to database with pending status
        const operationId = `project-${Date.now()}-${projectData.name.replace(/\s+/g, '-').toLowerCase()}`;
        const dbProject = {
            owner_ual: projectData.ownerUAL,
            name: projectData.name,
            description: projectData.description,
            repository_url: projectData.repositoryUrl,
            tech_stack: projectData.techStack || null,
            category: projectData.category || null,
            live_url: projectData.liveUrl || null,
            publish_status: 'publishing',
            operation_id: operationId
        };

        const result = projectQueries.insert(dbProject);
        const projectId = result.lastInsertRowid;

        // Store the promise for status checking
        publishOperations.set(operationId, {
            promise: publishResult.promise,
            projectId: projectId,
            startedAt: new Date().toISOString()
        });

        console.log(`✅ Project saved with ID: ${projectId}`);
        console.log(`🔗 Linked to owner UAL: ${projectData.ownerUAL}`);
        console.log(`⏳ DKG publishing in progress. Operation ID: ${operationId}\n`);

        // Return immediately
        res.json({
            success: true,
            message: 'Project created, DKG publishing in progress',
            projectId: projectId,
            operationId: operationId,
            status: 'publishing',
            ownerUAL: projectData.ownerUAL
        });

        // Handle publish completion in background
        dkgjsService.waitForAssetPublish(publishResult.promise).then(publishComplete => {
            if (publishComplete.success) {
                projectQueries.updatePublishStatus(
                    projectId,
                    'completed',
                    publishComplete.ual,
                    publishComplete.datasetRoot
                );
                console.log(`✅ Project ${projectId} published successfully. UAL: ${publishComplete.ual}`);
            } else {
                projectQueries.updatePublishStatus(projectId, 'failed');
                console.error(`❌ Project ${projectId} publishing failed:`, publishComplete.error);
            }
            publishOperations.delete(operationId);
        }).catch(error => {
            projectQueries.updatePublishStatus(projectId, 'failed');
            console.error(`❌ Project ${projectId} publishing error:`, error.message);
            publishOperations.delete(operationId);
        });

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/projects/status/:operationId
 * Check project publishing status
 */
router.get('/status/:operationId', async (req, res) => {
    try {
        const { operationId } = req.params;

        // Check database for project
        const project = projectQueries.getByOperationId(operationId);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Operation not found'
            });
        }

        // If already completed or failed, return from DB
        if (project.publish_status === 'completed') {
            return res.json({
                success: true,
                status: 'completed',
                ual: project.ual,
                datasetRoot: project.dataset_root,
                project: {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    ownerUAL: project.owner_ual,
                    ual: project.ual
                }
            });
        }

        if (project.publish_status === 'failed') {
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
            projectId: project.id
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
 * GET /api/projects/owner/:ownerUAL
 * Get all projects by owner UAL
 */
router.get('/owner/:ownerUAL', (req, res) => {
    try {
        const ownerUAL = decodeURIComponent(req.params.ownerUAL);

        // Verify owner exists
        const owner = profileQueries.getByUal(ownerUAL);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner profile not found'
            });
        }

        const projects = projectQueries.getByOwnerUal(ownerUAL);

        res.json({
            success: true,
            count: projects.length,
            owner: {
                username: owner.username,
                fullName: owner.full_name,
                ual: owner.ual
            },
            projects: projects.map(p => ({
                ...p,
                tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : null,
                explorerUrl: p.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(p.ual)}` : null
            }))
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/projects/:identifier
 * Get project by ID or UAL
 */
router.get('/:identifier', (req, res) => {
    try {
        const { identifier } = req.params;
        let project;

        // Check if it's a numeric ID or UAL
        if (/^\d+$/.test(identifier)) {
            project = projectQueries.getById(parseInt(identifier));
        } else {
            // It's a UAL (decode it)
            const ual = decodeURIComponent(identifier);
            project = projectQueries.getByUal(ual);
        }

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Get owner info
        const owner = profileQueries.getByUal(project.owner_ual);

        res.json({
            success: true,
            project: {
                ...project,
                tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : null,
                owner: owner ? {
                    username: owner.username,
                    fullName: owner.full_name,
                    ual: owner.ual
                } : null,
                explorerUrl: project.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(project.ual)}` : null
            }
        });

    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', (req, res) => {
    try {
        const projects = projectQueries.getAll();

        res.json({
            success: true,
            count: projects.length,
            projects: projects.map(p => ({
                ...p,
                tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : null,
                explorerUrl: p.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(p.ual)}` : null
            }))
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
