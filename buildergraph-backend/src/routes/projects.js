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
 * GET /api/projects/import/github/repos
 * List GitHub repositories accessible by the authenticated user
 */
router.get('/import/github/repos', async (req, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const ownerUALParam = req.query.ownerUAL;
        if (!ownerUALParam || typeof ownerUALParam !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'ownerUAL query parameter is required'
            });
        }

        const ownerUAL = decodeURIComponent(ownerUALParam);

        // Ensure the requested UAL matches the logged-in user
        if (!req.user?.ual || req.user.ual !== ownerUAL) {
            return res.status(403).json({
                success: false,
                error: 'You can only list repositories for your own profile'
            });
        }

        const owner = profileQueries.getByUal(ownerUAL);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner profile not found'
            });
        }

        if (!owner.access_token) {
            return res.status(401).json({
                success: false,
                error: 'GitHub access token missing. Please re-authenticate.'
            });
        }

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const perPage = Math.min(parseInt(req.query.per_page) || 100, 100);

        const githubResponse = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc&affiliation=owner,collaborator,organization_member`, {
            headers: {
                'Authorization': `Bearer ${owner.access_token}`,
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'BuilderGraph'
            }
        });

        if (!githubResponse.ok) {
            const errorData = await githubResponse.json().catch(() => ({}));
            console.error('GitHub repo list error:', errorData);
            return res.status(githubResponse.status).json({
                success: false,
                error: errorData.message || 'Failed to fetch repositories from GitHub'
            });
        }

        const reposData = await githubResponse.json();
        const repositories = Array.isArray(reposData) ? reposData.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            visibility: repo.visibility,
            description: repo.description,
            htmlUrl: repo.html_url,
            sshUrl: repo.ssh_url,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            defaultBranch: repo.default_branch,
            language: repo.language,
            owner: {
                login: repo.owner?.login,
                avatarUrl: repo.owner?.avatar_url
            }
        })) : [];

        res.json({
            success: true,
            repositories,
            pagination: {
                page,
                perPage,
                returned: repositories.length
            }
        });
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
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

/**
 * POST /api/projects/import/github
 * Import a project from GitHub and create DKG asset
 */
router.post('/import/github', async (req, res) => {
    try {
        const { repoUrl, ownerUAL, accessToken } = req.body;

        console.log('\n🔍 Importing GitHub repository:', repoUrl);

        if (!repoUrl || !ownerUAL) {
            return res.status(400).json({
                success: false,
                error: 'Repository URL and owner UAL are required'
            });
        }

        // Verify owner exists
        const owner = profileQueries.getByUal(ownerUAL);
        if (!owner) {
            return res.status(404).json({
                success: false,
                error: 'Owner profile not found'
            });
        }

        // Parse GitHub URL
        const repoRegex = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = repoUrl.match(repoRegex);

        if (!match) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GitHub repository URL'
            });
        }

        const [, repoOwner, repoName] = match;
        const cleanRepoName = repoName.replace(/\.git$/, '');

        console.log(`📦 Fetching repository: ${repoOwner}/${cleanRepoName}`);

        // Fetch repository data from GitHub API
        const token = accessToken || owner.access_token;
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'GitHub access token not found. Please log in again.'
            });
        }

        const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${cleanRepoName}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BuilderGraph'
            }
        });

        if (!repoResponse.ok) {
            const errorData = await repoResponse.json().catch(() => ({}));
            console.error('GitHub API error:', errorData);
            return res.status(repoResponse.status).json({
                success: false,
                error: `Failed to fetch repository from GitHub: ${errorData.message || repoResponse.statusText}`
            });
        }

        const repoData = await repoResponse.json();

        // Fetch languages used in the repository
        const languagesResponse = await fetch(repoData.languages_url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BuilderGraph'
            }
        });

        let techStack = [];
        if (languagesResponse.ok) {
            const languages = await languagesResponse.json();
            techStack = Object.keys(languages);
        }

        // Determine category based on repository topics and description
        let category = 'other';
        const topics = repoData.topics || [];
        const description = (repoData.description || '').toLowerCase();

        if (topics.includes('web') || topics.includes('website') || description.includes('web')) {
            category = 'web';
        } else if (topics.includes('mobile') || topics.includes('android') || topics.includes('ios')) {
            category = 'mobile';
        } else if (topics.includes('smart-contract') || topics.includes('solidity') || description.includes('smart contract')) {
            category = 'smartcontract';
        } else if (topics.includes('library') || topics.includes('package')) {
            category = 'library';
        } else if (topics.includes('tool') || topics.includes('cli')) {
            category = 'tool';
        }

        // Create project data
        const projectData = {
            name: repoData.name,
            description: repoData.description || `Imported from ${repoUrl}`,
            repositoryUrl: repoData.html_url,
            techStack: techStack.length > 0 ? techStack : ['Unknown'],
            category: category,
            liveUrl: repoData.homepage || undefined,
            ownerUAL: ownerUAL
        };

        console.log('📝 Extracted project data:', projectData);

        // Convert to JSON-LD (linked to owner)
        const jsonldContent = projectToJSONLD(projectData, ownerUAL);
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
        const operationId = `import-${Date.now()}-${projectData.name.replace(/\s+/g, '-').toLowerCase()}`;
        const dbProject = {
            owner_ual: ownerUAL,
            name: projectData.name,
            description: projectData.description,
            repository_url: projectData.repositoryUrl,
            tech_stack: JSON.stringify(projectData.techStack),
            category: projectData.category,
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

        console.log(`✅ Project imported with ID: ${projectId}`);
        console.log(`🔗 Linked to owner UAL: ${ownerUAL}`);
        console.log(`⏳ DKG publishing in progress. Operation ID: ${operationId}\n`);

        // Return immediately
        res.json({
            success: true,
            message: 'Project imported from GitHub, DKG publishing in progress',
            projectId: projectId,
            operationId: operationId,
            status: 'publishing',
            ownerUAL: ownerUAL,
            projectData: projectData
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
                console.log(`✅ Imported project ${projectId} published successfully. UAL: ${publishComplete.ual}`);
            } else {
                projectQueries.updatePublishStatus(projectId, 'failed');
                console.error(`❌ Imported project ${projectId} publishing failed:`, publishComplete.error);
            }
            publishOperations.delete(operationId);
        }).catch(error => {
            projectQueries.updatePublishStatus(projectId, 'failed');
            console.error(`❌ Imported project ${projectId} publishing error:`, error.message);
            publishOperations.delete(operationId);
        });

    } catch (error) {
        console.error('Error importing GitHub repository:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
