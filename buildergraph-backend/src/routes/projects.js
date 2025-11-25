/**
 * Project API Routes
 */
import express from 'express';
import { projectQueries, profileQueries } from '../database/db.js';
import { publishAsset, getDKGExplorerURL } from '../services/dkg-service.js';
import { projectToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

/**
 * POST /api/projects
 * Create a new project linked to user UAL and publish to DKG
 */
router.post('/', async (req, res) => {
    try {
        const projectData = req.body;

        // Validation
        if (!projectData.userUal || !projectData.name || !projectData.description || !projectData.repositoryUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userUal, name, description, repositoryUrl'
            });
        }

        // Verify user UAL exists
        const userProfile = profileQueries.getByUal(projectData.userUal);
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'User profile not found with provided UAL'
            });
        }

        console.log(`\n📝 Creating project: ${projectData.name}`);
        console.log(`👤 Linked to user: ${userProfile.username} (${projectData.userUal})`);

        // Convert to JSON-LD with user UAL linkage
        const jsonld = projectToJSONLD(projectData, projectData.userUal);

        console.log('📄 JSON-LD generated:', JSON.stringify(jsonld, null, 2));

        // Publish to DKG
        const dkgResult = await publishAsset(jsonld, {
            sourceId: `project-${Date.now()}`,
            projectName: projectData.name,
            userUal: projectData.userUal
        });

        if (!dkgResult.success) {
            return res.status(500).json({
                success: false,
                error: 'Failed to publish to DKG: ' + dkgResult.error
            });
        }

        // Save to database
        const dbProject = {
            user_ual: projectData.userUal,
            name: projectData.name,
            description: projectData.description,
            repository_url: projectData.repositoryUrl,
            tech_stack: projectData.techStack || null,
            category: projectData.category || null,
            live_url: projectData.liveUrl || null,
            ual: dkgResult.ual,
            dkg_asset_id: dkgResult.id
        };

        const result = projectQueries.insert(dbProject);
        const projectId = result.lastInsertRowid;

        console.log(`✅ Project created with ID: ${projectId}`);
        console.log(`🔗 UAL: ${dkgResult.ual || 'Pending...'}\n`);

        res.json({
            success: true,
            message: 'Project created successfully',
            project: {
                id: projectId,
                name: projectData.name,
                userUal: projectData.userUal,
                ual: dkgResult.ual,
                dkgAssetId: dkgResult.id,
                explorerUrl: dkgResult.ual ? getDKGExplorerURL(dkgResult.ual) : null
            }
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
 * GET /api/projects/:id
 * Get project by database ID
 */
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const project = projectQueries.getById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        res.json({
            success: true,
            project: {
                ...project,
                tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : null,
                explorerUrl: project.ual ? getDKGExplorerURL(project.ual) : null
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
 * GET /api/projects/user/:userUal
 * Get all projects for a user UAL
 */
router.get('/user/:userUal', (req, res) => {
    try {
        const userUal = decodeURIComponent(req.params.userUal);
        const projects = projectQueries.getByUserUal(userUal);

        res.json({
            success: true,
            count: projects.length,
            projects: projects.map(p => ({
                ...p,
                tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : null,
                explorerUrl: p.ual ? getDKGExplorerURL(p.ual) : null
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
                explorerUrl: p.ual ? getDKGExplorerURL(p.ual) : null
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
