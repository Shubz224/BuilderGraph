/**
 * Project API Routes - DKG.js SDK Integration
 */
import express from 'express';
import { projectQueries, profileQueries, aiAnalysisQueries, allDataQueries } from '../database/db.js';
import dkgjsService from '../services/dkgjs-service.js';
import { projectToJSONLD } from '../utils/jsonld-converter.js';
import groqService from '../services/groq-service.js';

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
        console.log('📋 Final JSON-LD to publish:', JSON.stringify(jsonldContent, null, 2));

        // Extract the actual entity from @graph if present
        // DKG.js expects: { public: {...entity...}, private: {...} }
        let publicContent = jsonldContent;
        if (jsonldContent['@graph'] && jsonldContent['@graph'].length > 0) {
            // Extract the first item from @graph and merge context
            publicContent = {
                '@context': jsonldContent['@context'],
                ...jsonldContent['@graph'][0]
            };
        }

        // Wrap in DKG format (public/private structure)
        const dkgContent = {
            public: publicContent,
            private: {}
        };

        console.log('📦 Wrapped JSON-LD for DKG:', JSON.stringify(dkgContent, null, 2));

        // Start async DKG publish
        const publishResult = await dkgjsService.publishAssetAsync(dkgContent, 6);

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

        // Store the promise for status checking along with the published data
        publishOperations.set(operationId, {
            promise: publishResult.promise,
            projectId: projectId,
            dkgContent: dkgContent, // Store the full published data
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
                
                // Save all published data to all_data table
                try {
                    const operationData = publishOperations.get(operationId);
                    if (operationData && operationData.dkgContent) {
                        // Get project to get owner_ual and ai_analysis_hash
                        const project = projectQueries.getById(projectId);
                        const userUAL = project?.owner_ual || projectData.ownerUAL;
                        
                        // Get score from ai_analysis if available
                        let score = null;
                        let scoreBreakdown = null;
                        if (project && project.ai_analysis_hash) {
                            const analysis = aiAnalysisQueries.getByHash(project.ai_analysis_hash);
                            if (analysis) {
                                score = analysis.score;
                                if (analysis.score_breakdown) {
                                    scoreBreakdown = typeof analysis.score_breakdown === 'string'
                                        ? JSON.parse(analysis.score_breakdown)
                                        : analysis.score_breakdown;
                                }
                            }
                        }
                        
                        // Add score and breakdown to published_data
                        const publishedDataWithScore = {
                            ...operationData.dkgContent,
                            score: score,
                            scoreBreakdown: scoreBreakdown
                        };
                        
                        allDataQueries.insert({
                            ual: userUAL, // User's/profile's UAL
                            dataset_root: publishComplete.datasetRoot,
                            project_ual: publishComplete.ual, // Project's UAL
                            user_ual: userUAL,
                            published_data: publishedDataWithScore
                        });
                        console.log(`💾 Saved published data to all_data table - User UAL: ${userUAL}, Project UAL: ${publishComplete.ual}, Score: ${score}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to save to all_data table:`, error.message);
                }
            } else {
                projectQueries.updatePublishStatus(projectId, 'failed');
                console.error(`❌ Project ${projectId} publishing failed:`, publishComplete.error);
                // Don't save to all_data if publishing failed
            }
            publishOperations.delete(operationId);
        }).catch(error => {
            projectQueries.updatePublishStatus(projectId, 'failed');
            console.error(`❌ Project ${projectId} publishing error:`, error.message);
            // Don't save to all_data if publishing failed
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
            projects: projects.map(p => {
                let techStack = null;
                if (p.tech_stack) {
                    try {
                        techStack = typeof p.tech_stack === 'string' ? JSON.parse(p.tech_stack) : p.tech_stack;
                    } catch (error) {
                        console.error('Error parsing tech_stack for project', p.id, ':', error);
                        techStack = [];
                    }
                }
                return {
                    ...p,
                    tech_stack: techStack,
                    explorerUrl: p.ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(p.ual)}` : null
                };
            })
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
 * DELETE /api/projects/:id
 * Delete a project by ID
 */
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const projectId = parseInt(id);

        if (isNaN(projectId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid project ID'
            });
        }

        // Check if project exists
        const project = projectQueries.getById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Delete the project
        projectQueries.deleteById(projectId);

        console.log(`✅ Project ${projectId} deleted successfully`);

        res.json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting project:', error);
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
/**
 * POST /api/projects/import/github/analyze
 * Analyze scraped repository data using Groq AI
 */
router.post('/import/github/analyze', async (req, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const { scrapedData, ownerUAL } = req.body;

        if (!scrapedData || !ownerUAL) {
            return res.status(400).json({
                success: false,
                error: 'Scraped data and owner UAL are required'
            });
        }

        if (!groqService.isAvailable()) {
            return res.status(503).json({
                success: false,
                error: 'AI analysis service is not available. Please configure GROQ_API_KEY.'
            });
        }

        console.log('🤖 Analyzing repository with Groq AI...');
        const analysisResult = await groqService.analyzeRepository(scrapedData, ownerUAL);

        res.json(analysisResult);

    } catch (error) {
        console.error('Error analyzing repository:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to analyze repository'
        });
    }
});

/**
 * POST /api/projects/import/github/scrape
 * Scrape all repository data (file structure, README, commits)
 */
router.post('/import/github/scrape', async (req, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const { repoUrl, ownerUAL } = req.body;

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

        if (!owner.access_token) {
            return res.status(401).json({
                success: false,
                error: 'GitHub access token missing'
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

        console.log(`📦 Scraping repository: ${repoOwner}/${cleanRepoName}`);

        const token = owner.access_token;
        const baseUrl = `https://api.github.com/repos/${repoOwner}/${cleanRepoName}`;

        // Fetch repository basic info
        const repoResponse = await fetch(baseUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BuilderGraph'
            }
        });

        if (!repoResponse.ok) {
            const errorData = await repoResponse.json().catch(() => ({}));
            return res.status(repoResponse.status).json({
                success: false,
                error: `Failed to fetch repository: ${errorData.message || repoResponse.statusText}`
            });
        }

        const repoData = await repoResponse.json();

        // Fetch README
        let readmeContent = '';
        try {
            const readmeResponse = await fetch(`${baseUrl}/readme`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'BuilderGraph'
                }
            });

            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            }
        } catch (err) {
            console.warn('Failed to fetch README:', err);
        }

        // Fetch file structure (tree) - get default branch
        let fileStructure = [];
        try {
            const defaultBranch = repoData.default_branch || 'main';
            const treeResponse = await fetch(`${baseUrl}/git/trees/${defaultBranch}?recursive=1`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'BuilderGraph'
                }
            });

            if (treeResponse.ok) {
                const treeData = await treeResponse.json();
                fileStructure = (treeData.tree || []).map(item => ({
                    path: item.path,
                    type: item.type,
                    size: item.size || 0,
                    mode: item.mode
                }));
            }
        } catch (err) {
            console.warn('Failed to fetch file structure:', err);
        }

        // Fetch commit history (last 30 commits)
        let commitHistory = [];
        try {
            const commitsResponse = await fetch(`${baseUrl}/commits?per_page=30`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'BuilderGraph'
                }
            });

            if (commitsResponse.ok) {
                const commitsData = await commitsResponse.json();
                commitHistory = commitsData.map(commit => ({
                    sha: commit.sha,
                    message: commit.commit.message,
                    author: {
                        name: commit.commit.author.name,
                        email: commit.commit.author.email,
                        date: commit.commit.author.date
                    },
                    url: commit.html_url
                }));
            }
        } catch (err) {
            console.warn('Failed to fetch commit history:', err);
        }

        // Fetch languages
        let languages = {};
        try {
            const languagesResponse = await fetch(repoData.languages_url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'BuilderGraph'
                }
            });

            if (languagesResponse.ok) {
                languages = await languagesResponse.json();
            }
        } catch (err) {
            console.warn('Failed to fetch languages:', err);
        }

        // Compile scraped data
        const scrapedData = {
            repository: {
                name: repoData.name,
                fullName: repoData.full_name,
                description: repoData.description,
                url: repoData.html_url,
                defaultBranch: repoData.default_branch,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                watchers: repoData.watchers_count,
                openIssues: repoData.open_issues_count,
                createdAt: repoData.created_at,
                updatedAt: repoData.updated_at,
                pushedAt: repoData.pushed_at,
                language: repoData.language,
                topics: repoData.topics || [],
                homepage: repoData.homepage,
                license: repoData.license?.name
            },
            readme: {
                content: readmeContent,
                length: readmeContent.length
            },
            fileStructure: {
                totalFiles: fileStructure.filter(f => f.type === 'blob').length,
                totalDirs: fileStructure.filter(f => f.type === 'tree').length,
                files: fileStructure.slice(0, 500) // Limit to first 500 files
            },
            commitHistory: {
                totalCommits: commitHistory.length,
                commits: commitHistory
            },
            languages: languages
        };

        console.log(`✅ Scraped data for ${repoOwner}/${cleanRepoName}:`, {
            readmeLength: readmeContent.length,
            files: scrapedData.fileStructure.totalFiles,
            commits: commitHistory.length
        });

        res.json({
            success: true,
            data: scrapedData
        });

    } catch (error) {
        console.error('Error scraping repository:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/projects/import/github/readme
 * Fetch README content for a repository
 */
router.get('/import/github/readme', async (req, res) => {
    try {
        if (!req.isAuthenticated || !req.isAuthenticated()) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }

        const { owner, repo, ownerUAL } = req.query;

        if (!owner || !repo || !ownerUAL) {
            return res.status(400).json({
                success: false,
                error: 'owner, repo, and ownerUAL are required'
            });
        }

        const decodedOwnerUAL = decodeURIComponent(ownerUAL);

        // Verify owner exists and get token
        const userProfile = profileQueries.getByUal(decodedOwnerUAL);
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                error: 'Owner profile not found'
            });
        }

        if (!userProfile.access_token) {
            return res.status(401).json({
                success: false,
                error: 'GitHub access token missing'
            });
        }

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
            headers: {
                'Authorization': `Bearer ${userProfile.access_token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'BuilderGraph'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return res.json({ success: true, content: '' }); // No README is fine
            }
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                success: false,
                error: errorData.message || 'Failed to fetch README'
            });
        }

        const data = await response.json();
        // Content is base64 encoded
        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        res.json({
            success: true,
            content: content
        });

    } catch (error) {
        console.error('Error fetching README:', error);
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
        const { repoUrl, ownerUAL, accessToken, aiAnalysis } = req.body;

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

        // Use AI-generated JSON-LD if available, otherwise use standard conversion
        let jsonldContent;
        if (aiAnalysis && aiAnalysis.json_ld) {
            console.log('🤖 Using AI-generated JSON-LD');
            jsonldContent = aiAnalysis.json_ld;
            
            // Ensure owner UAL is correctly set in the graph
            if (jsonldContent['@graph'] && jsonldContent['@graph'].length > 0) {
                const graphItem = jsonldContent['@graph'][0];
                if (ownerUAL) {
                    if (!graphItem['schema:creator']) {
                        graphItem['schema:creator'] = { '@id': ownerUAL };
                    } else {
                        graphItem['schema:creator']['@id'] = ownerUAL;
                    }
                    if (!graphItem['prov:wasAttributedTo']) {
                        graphItem['prov:wasAttributedTo'] = { '@id': ownerUAL };
                    } else {
                        graphItem['prov:wasAttributedTo']['@id'] = ownerUAL;
                    }
                }
            }
        } else {
            // Fallback to standard JSON-LD conversion
            console.log('📄 Using standard JSON-LD conversion');
            jsonldContent = projectToJSONLD(projectData, ownerUAL);
        }

        console.log('📄 JSON-LD generated with owner link');
        console.log('📋 Final JSON-LD to publish:', JSON.stringify(jsonldContent, null, 2));

        // Extract the actual entity from @graph if present
        // DKG.js expects: { public: {...entity...}, private: {...} }
        let publicContent = jsonldContent;
        if (jsonldContent['@graph'] && jsonldContent['@graph'].length > 0) {
            // Extract the first item from @graph and merge context
            publicContent = {
                '@context': jsonldContent['@context'],
                ...jsonldContent['@graph'][0]
            };
        }

        // Wrap in DKG format (public/private structure)
        const dkgContent = {
            public: publicContent,
            private: {}
        };

        console.log('📦 Wrapped JSON-LD for DKG:', JSON.stringify(dkgContent, null, 2));

        // Start async DKG publish
        const publishResult = await dkgjsService.publishAssetAsync(dkgContent, 6);

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
            operation_id: operationId,
            ai_analysis_hash: aiAnalysis?.ai_analysis_hash || null
        };

        const result = projectQueries.insert(dbProject);
        const projectId = result.lastInsertRowid;

        // Store the promise for status checking along with the published data
        publishOperations.set(operationId, {
            promise: publishResult.promise,
            projectId: projectId,
            dkgContent: dkgContent, // Store the full published data
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
                
                // Save all published data to all_data table
                try {
                    const operationData = publishOperations.get(operationId);
                    if (operationData && operationData.dkgContent) {
                        // Get project to get owner_ual and ai_analysis_hash
                        const project = projectQueries.getById(projectId);
                        const userUAL = project?.owner_ual || ownerUAL;
                        
                        // Get score from ai_analysis if available
                        let score = null;
                        let scoreBreakdown = null;
                        if (project && project.ai_analysis_hash) {
                            const analysis = aiAnalysisQueries.getByHash(project.ai_analysis_hash);
                            if (analysis) {
                                score = analysis.score;
                                if (analysis.score_breakdown) {
                                    scoreBreakdown = typeof analysis.score_breakdown === 'string'
                                        ? JSON.parse(analysis.score_breakdown)
                                        : analysis.score_breakdown;
                                }
                            }
                        }
                        
                        // Add score and breakdown to published_data
                        const publishedDataWithScore = {
                            ...operationData.dkgContent,
                            score: score,
                            scoreBreakdown: scoreBreakdown
                        };
                        
                        allDataQueries.insert({
                            ual: userUAL, // User's/profile's UAL
                            dataset_root: publishComplete.datasetRoot,
                            project_ual: publishComplete.ual, // Project's UAL
                            user_ual: userUAL,
                            published_data: publishedDataWithScore
                        });
                        console.log(`💾 Saved published data to all_data table - User UAL: ${userUAL}, Project UAL: ${publishComplete.ual}, Score: ${score}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to save to all_data table:`, error.message);
                }
            } else {
                projectQueries.updatePublishStatus(projectId, 'failed');
                console.error(`❌ Imported project ${projectId} publishing failed:`, publishComplete.error);
                // Don't save to all_data if publishing failed
            }
            publishOperations.delete(operationId);
        }).catch(error => {
            projectQueries.updatePublishStatus(projectId, 'failed');
            console.error(`❌ Imported project ${projectId} publishing error:`, error.message);
            // Don't save to all_data if publishing failed
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

/**
 * GET /api/projects/ai-analysis/:hash
 * Get AI analysis by hash
 */
router.get('/ai-analysis/:hash', (req, res) => {
    try {
        const { hash } = req.params;
        
        if (!hash) {
            return res.status(400).json({
                success: false,
                error: 'Hash is required'
            });
        }

        const analysis = aiAnalysisQueries.getByHash(hash);
        
        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'AI analysis not found'
            });
        }

        res.json({
            success: true,
            analysis: {
                hash: analysis.hash,
                analysis_text: analysis.analysis_text,
                score: analysis.score,
                score_breakdown: analysis.score_breakdown,
                created_at: analysis.created_at,
                updated_at: analysis.updated_at
            }
        });
    } catch (error) {
        console.error('Error fetching AI analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/projects/aggregated/:ownerUAL
 * Get aggregated project data (scores and programming languages) from all_data table using user_ual
 */
router.get('/aggregated/:ownerUAL', (req, res) => {
    try {
        const ownerUAL = decodeURIComponent(req.params.ownerUAL);

        // Get all data entries for this user from all_data table using user_ual
        const allDataEntries = allDataQueries.getByUserUal(ownerUAL);
        
        if (!allDataEntries || allDataEntries.length === 0) {
            return res.json({
                success: true,
                totalScore: 0,
                scoreBreakdown: {
                    commitScore: 0,
                    structureScore: 0,
                    readmeScore: 0,
                    metadataScore: 0
                },
                projectCount: 0,
                programmingLanguages: [],
                ownerUAL: ownerUAL
            });
        }

        let totalScore = 0;
        let commitScore = 0;
        let structureScore = 0;
        let readmeScore = 0;
        let metadataScore = 0;
        const programmingLanguages = new Set();

        // For each entry in all_data, extract score and breakdown from published_data JSON
        for (const dataEntry of allDataEntries) {
            try {
                if (!dataEntry.published_data) {
                    console.log(`⚠️ No published_data for project_ual: ${dataEntry.project_ual}`);
                    continue;
                }

                const data = dataEntry.published_data;
                console.log(`📊 Processing all_data entry for project_ual: ${dataEntry.project_ual}`);
                console.log(`📊 Published data keys:`, Object.keys(data));
                
                // Extract score from published_data JSON
                // Score is stored at the root level: data.score and data.scoreBreakdown
                let score = 0;
                let breakdown = null;

                // Score is stored at root level when we save it
                if (data.score !== null && data.score !== undefined) {
                    score = data.score;
                    console.log(`✅ Found score in published_data: ${score}`);
                }

                // Score breakdown is stored at root level
                if (data.scoreBreakdown) {
                    breakdown = typeof data.scoreBreakdown === 'string'
                        ? JSON.parse(data.scoreBreakdown)
                        : data.scoreBreakdown;
                    console.log(`✅ Found scoreBreakdown in published_data:`, breakdown);
                }

                // If score not found in published_data, try ai_analysis table as fallback
                if (score === 0 || score === null) {
                    console.log(`⚠️ Score not found in published_data, trying ai_analysis table...`);
                    const project = projectQueries.getByUal(dataEntry.project_ual);
                    if (project && project.ai_analysis_hash) {
                        const analysis = aiAnalysisQueries.getByHash(project.ai_analysis_hash);
                        if (analysis && analysis.score) {
                            score = analysis.score;
                            console.log(`✅ Found score in ai_analysis: ${score}`);
                            if (analysis.score_breakdown) {
                                breakdown = typeof analysis.score_breakdown === 'string'
                                    ? JSON.parse(analysis.score_breakdown)
                                    : analysis.score_breakdown;
                                console.log(`✅ Found scoreBreakdown in ai_analysis:`, breakdown);
                            }
                        } else {
                            console.log(`⚠️ No analysis found for hash: ${project.ai_analysis_hash}`);
                        }
                    } else {
                        console.log(`⚠️ No project or ai_analysis_hash for project_ual: ${dataEntry.project_ual}`);
                    }
                }

                // Add to totals
                if (score > 0) {
                    totalScore += score;
                }

                // Extract breakdown components
                if (breakdown) {
                    commitScore += breakdown.commitScore || 0;
                    structureScore += breakdown.structureScore || 0;
                    readmeScore += breakdown.readmeScore || 0;
                    metadataScore += breakdown.metadataScore || 0;
                }

                // Extract programming languages from published data
                let languages = [];
                if (data.public) {
                    const langField = data.public['schema:programmingLanguage'] || 
                                    data.public.programmingLanguage ||
                                    data.public['programmingLanguage'];
                    
                    if (Array.isArray(langField)) {
                        languages = langField;
                    } else if (typeof langField === 'string') {
                        languages = [langField];
                    }
                }
                
                languages.forEach(lang => {
                    if (lang && typeof lang === 'string') {
                        programmingLanguages.add(lang);
                    }
                });
            } catch (error) {
                console.error(`Error processing all_data entry with project_ual: ${dataEntry.project_ual}`, error.message);
            }
        }

        res.json({
            success: true,
            totalScore: totalScore,
            scoreBreakdown: {
                commitScore: commitScore,
                structureScore: structureScore,
                readmeScore: readmeScore,
                metadataScore: metadataScore
            },
            projectCount: allDataEntries.length,
            programmingLanguages: Array.from(programmingLanguages).sort(),
            ownerUAL: ownerUAL
        });

    } catch (error) {
        console.error('Error fetching aggregated project data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
