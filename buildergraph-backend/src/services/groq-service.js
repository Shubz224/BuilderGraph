/**
 * Groq AI Analysis Service
 * Analyzes GitHub repositories and generates JSON-LD with scoring
 */
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { aiAnalysisQueries } from '../database/db.js';

dotenv.config();

let groqClient = null;

// Initialize Groq client
try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
        groqClient = new Groq({ apiKey: groqApiKey });
        console.log('✅ Groq client initialized successfully');
    } else {
        console.warn('⚠️ GROQ_API_KEY not found - AI analysis will be disabled');
    }
} catch (error) {
    console.error('❌ Groq client initialization failed:', error);
}

/**
 * Calculate commit score based on commit history and frequency
 */
function calculateCommitScore(commitHistory) {
    let score = 0.0;
    const commits = commitHistory?.commits || [];
    const totalCommits = commits.length;

    // Total commits (max 15 points)
    if (totalCommits > 100) {
        score += 15;
    } else if (totalCommits > 50) {
        score += 12;
    } else if (totalCommits > 20) {
        score += 8;
    } else if (totalCommits > 5) {
        score += 5;
    } else if (totalCommits > 0) {
        score += 2;
    }

    // Commit frequency analysis (max 15 points)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    let lastWeek = 0;
    let lastMonth = 0;
    let lastYear = 0;

    commits.forEach(commit => {
        const commitDate = new Date(commit.author?.date || commit.date || 0);
        if (commitDate > oneWeekAgo) lastWeek++;
        if (commitDate > oneMonthAgo) lastMonth++;
        if (commitDate > oneYearAgo) lastYear++;
    });

    // Active in last week (max 5 points)
    if (lastWeek > 5) {
        score += 5;
    } else if (lastWeek > 2) {
        score += 3;
    } else if (lastWeek > 0) {
        score += 1;
    }

    // Active in last month (max 5 points)
    if (lastMonth > 20) {
        score += 5;
    } else if (lastMonth > 10) {
        score += 3;
    } else if (lastMonth > 0) {
        score += 1;
    }

    // Active in last year (max 5 points)
    if (lastYear > 50) {
        score += 5;
    } else if (lastYear > 20) {
        score += 3;
    } else if (lastYear > 0) {
        score += 1;
    }

    return Math.min(score, 30);
}

/**
 * Calculate structure score based on file organization
 */
function calculateStructureScore(fileStructure, repoInfo) {
    let score = 0.0;
    const files = fileStructure?.files || [];
    const totalFiles = fileStructure?.totalFiles || 0;

    // File count (max 10 points)
    if (totalFiles > 50) {
        score += 10;
    } else if (totalFiles > 20) {
        score += 7;
    } else if (totalFiles > 5) {
        score += 4;
    } else if (totalFiles > 0) {
        score += 1;
    }

    // Check for important files (max 20 points)
    const filePaths = files.map(f => f.path?.toLowerCase() || '');

    const importantFiles = {
        'readme.md': 3,
        'readme': 3,
        'license': 2,
        'package.json': 1,
        'dockerfile': 1,
        '.gitignore': 1,
        'requirements.txt': 1,
        'setup.py': 1,
        'pom.xml': 1,
        'cargo.toml': 1,
        'go.mod': 1,
        'composer.json': 1,
    };

    for (const [filePattern, points] of Object.entries(importantFiles)) {
        if (filePaths.some(path => path.includes(filePattern))) {
            score += points;
        }
    }

    return Math.min(score, 30);
}

/**
 * Calculate README score based on quality and content
 */
function calculateReadmeScore(readmeContent) {
    if (!readmeContent) {
        return 0.0;
    }

    let score = 0.0;
    const readmeLower = readmeContent.toLowerCase();

    // Length (max 10 points)
    const length = readmeContent.length;
    if (length > 2000) {
        score += 10;
    } else if (length > 1000) {
        score += 7;
    } else if (length > 500) {
        score += 5;
    } else if (length > 100) {
        score += 3;
    } else {
        score += 1;
    }

    // Key sections (max 20 points)
    const sections = {
        'installation': 2,
        'usage': 2,
        'example': 1,
        'features': 1,
        'contribute': 1,
        'contributing': 1,
        'license': 1,
        'documentation': 1,
        'getting started': 1,
        'quick start': 1,
        'api': 1,
        'configuration': 1,
        'requirements': 1,
        'dependencies': 1,
    };

    for (const [section, points] of Object.entries(sections)) {
        if (readmeLower.includes(section)) {
            score += points;
        }
    }

    return Math.min(score, 30);
}

/**
 * Calculate metadata score based on repository metadata
 */
function calculateMetadataScore(repoInfo) {
    let score = 0.0;

    // Stars (max 10 points)
    const stars = repoInfo.stars || 0;
    if (stars > 1000) {
        score += 10;
    } else if (stars > 100) {
        score += 7;
    } else if (stars > 10) {
        score += 5;
    } else if (stars > 0) {
        score += 3;
    }

    // Forks (max 5 points)
    const forks = repoInfo.forks || 0;
    if (forks > 100) {
        score += 5;
    } else if (forks > 10) {
        score += 3;
    } else if (forks > 0) {
        score += 1;
    }

    // Description (max 5 points)
    if (repoInfo.description && repoInfo.description.length > 20) {
        score += 5;
    } else if (repoInfo.description) {
        score += 2;
    }

    // License (max 5 points)
    if (repoInfo.license) {
        score += 5;
    }

    // Topics/tags (max 5 points)
    const topics = repoInfo.topics || [];
    if (topics.length > 5) {
        score += 5;
    } else if (topics.length > 2) {
        score += 3;
    } else if (topics.length > 0) {
        score += 1;
    }

    return Math.min(score, 30);
}

/**
 * Calculate overall repository score
 */
function calculateScore(scrapedData) {
    const repoInfo = scrapedData.repository || {};
    const readme = scrapedData.readme?.content || '';
    const fileStructure = scrapedData.fileStructure || {};
    const commitHistory = scrapedData.commitHistory || {};

    const commitScore = calculateCommitScore(commitHistory);
    const structureScore = calculateStructureScore(fileStructure, repoInfo);
    const readmeScore = calculateReadmeScore(readme);
    const metadataScore = calculateMetadataScore(repoInfo);

    const totalScore = commitScore + structureScore + readmeScore + metadataScore;

    return {
        totalScore: Math.min(totalScore, 100),
        scoreComponents: {
            commitScore,
            structureScore,
            readmeScore,
            metadataScore
        }
    };
}

/**
 * Determine project category from repository data
 */
function determineCategory(repoInfo, fileStructure) {
    const topics = (repoInfo.topics || []).map(t => t.toLowerCase());
    const description = (repoInfo.description || '').toLowerCase();
    const files = (fileStructure.files || []).map(f => f.path?.toLowerCase() || '');

    if (topics.includes('web') || topics.includes('website') || description.includes('web') || 
        files.some(f => f.includes('html') || f.includes('css') || f.includes('react'))) {
        return 'web';
    } else if (topics.includes('mobile') || topics.includes('android') || topics.includes('ios') ||
               files.some(f => f.includes('android') || f.includes('ios') || f.includes('mobile'))) {
        return 'mobile';
    } else if (topics.includes('smart-contract') || topics.includes('solidity') || 
               description.includes('smart contract') || files.some(f => f.includes('.sol'))) {
        return 'smartcontract';
    } else if (topics.includes('library') || topics.includes('package') ||
               files.some(f => f.includes('package.json') || f.includes('setup.py'))) {
        return 'library';
    } else if (topics.includes('tool') || topics.includes('cli') ||
               description.includes('tool') || description.includes('cli')) {
        return 'tool';
    }
    return 'other';
}

/**
 * Generate description from README if repository description is missing
 */
function generateDescriptionFromReadme(readme) {
    if (!readme) return null;
    
    // Extract first paragraph or first few sentences
    const lines = readme.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        if (firstLine.length > 50 && firstLine.length < 300) {
            return firstLine;
        }
    }
    return null;
}

/**
 * Extract keywords from README content
 */
function extractKeywordsFromReadme(readme) {
    if (!readme) return [];
    
    const keywords = [];
    const readmeLower = readme.toLowerCase();
    
    // Common tech keywords
    const techKeywords = [
        'react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'blockchain', 'ethereum',
        'solidity', 'web3', 'defi', 'nft', 'api', 'rest', 'graphql', 'mongodb',
        'postgresql', 'mysql', 'redis', 'express', 'fastapi', 'django', 'flask'
    ];
    
    techKeywords.forEach(keyword => {
        if (readmeLower.includes(keyword)) {
            keywords.push(keyword);
        }
    });
    
    return keywords.slice(0, 10); // Limit to 10 keywords
}

/**
 * Analyze repository and generate JSON-LD with score
 */
export async function analyzeRepository(scrapedData, ownerUAL) {
    if (!groqClient) {
        throw new Error('Groq API key not configured');
    }

    try {
        const repoInfo = scrapedData.repository || {};
        const readme = scrapedData.readme?.content || '';
        const fileStructure = scrapedData.fileStructure || {};
        const commits = scrapedData.commitHistory?.commits || [];
        const languages = scrapedData.languages || {};

        // Calculate scores first (no AI needed)
        const { totalScore, scoreComponents } = calculateScore(scrapedData);

        // Generate hash for AI analysis (based on repository URL to avoid duplicates)
        // Use repository URL and updated date to create a unique hash
        const hashInput = `${repoInfo.url || repoInfo.fullName || repoInfo.name || 'unknown'}-${repoInfo.updatedAt || repoInfo.createdAt || Date.now()}`;
        let analysisHash = crypto.createHash('sha256').update(hashInput).digest('hex');
        console.log('🔑 Generated AI analysis hash:', analysisHash);

        // Check if analysis already exists for this hash
        let aiAnalysis = '';
        let existingAnalysis = null;
        try {
            existingAnalysis = aiAnalysisQueries.getByHash(analysisHash);
            if (existingAnalysis) {
                console.log('✅ Found existing AI analysis in database, reusing it');
                aiAnalysis = existingAnalysis.analysis_text;
            }
        } catch (dbError) {
            console.warn('⚠️ Could not check for existing analysis:', dbError.message);
        }

        // Prepare AI analysis prompt - only for text analysis, not scoring
        const analysisPrompt = `Analyze this GitHub repository and provide a comprehensive text analysis.

Repository Information:
- Name: ${repoInfo.name || 'Unknown'}
- Owner: ${repoInfo.fullName?.split('/')[0] || 'Unknown'}
- Description: ${repoInfo.description || 'No description'}
- URL: ${repoInfo.url || ''}
- Language: ${repoInfo.language || 'Unknown'}
- Tech Stack: ${Object.keys(languages).join(', ') || 'Unknown'}
- Stars: ${repoInfo.stars || 0}
- Forks: ${repoInfo.forks || 0}
- Open Issues: ${repoInfo.openIssues || 0}
- Total Files: ${fileStructure.totalFiles || 0}
- Total Commits: ${commits.length}
- Created: ${repoInfo.createdAt || 'Unknown'}
- Updated: ${repoInfo.updatedAt || 'Unknown'}
- Topics: ${(repoInfo.topics || []).join(', ')}

README Content (first 2000 chars):
${readme.substring(0, 2000)}

File Structure:
- Key Files: ${(fileStructure.files || []).slice(0, 20).map(f => f.path).join(', ')}

Recent Commits:
${commits.slice(0, 5).map(c => `- ${c.message?.substring(0, 80)}`).join('\n')}

Provide a comprehensive analysis covering:
1. Project Quality & Maturity
2. Code Organization & Structure
3. Documentation Quality
4. Development Activity & Maintenance
5. Community Engagement
6. Technical Stack Assessment
7. Strengths and Areas for Improvement

Write in a professional, detailed manner (2-3 paragraphs).`;

        // Calculate scores first (no AI needed)
        console.log('📊 Calculating repository scores...');
        console.log('📈 Score Breakdown:', JSON.stringify(scoreComponents, null, 2));
        console.log(`🎯 Overall Score: ${totalScore}/100`);

        // Call Groq API for text analysis only if not found in database
        if (!existingAnalysis) {
            console.log('🤖 Calling Groq API for text analysis...');
            console.log('📊 Repository Info:', JSON.stringify({
                name: repoInfo.name,
                description: repoInfo.description?.substring(0, 100),
                stars: repoInfo.stars,
                files: fileStructure.totalFiles,
                commits: commits.length
            }, null, 2));
            
            try {
                const completion = await groqClient.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert software engineering analyst. Provide detailed, professional analysis of GitHub repositories focusing on quality, maintainability, and best practices.'
                        },
                        {
                            role: 'user',
                            content: analysisPrompt
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.7,
                    top_p: 1
                });

                aiAnalysis = completion.choices[0]?.message?.content?.trim() || '';
                console.log('📝 Groq AI Analysis:', aiAnalysis.substring(0, 300) + '...');
                console.log('📊 Groq Usage:', JSON.stringify({
                    prompt_tokens: completion.usage?.prompt_tokens,
                    completion_tokens: completion.usage?.completion_tokens,
                    total_tokens: completion.usage?.total_tokens
                }, null, 2));

                // Store AI analysis in database (must happen before building JSON-LD)
                try {
                    console.log('💾 Storing new AI analysis in database with hash:', analysisHash);
                    aiAnalysisQueries.insert(analysisHash, aiAnalysis, totalScore, scoreComponents);
                    console.log('✅ AI analysis stored successfully in database');
                } catch (dbError) {
                    console.error('⚠️ Failed to store AI analysis in database:', dbError.message);
                    // Continue even if storage fails, but hash will still be in JSON-LD
                }
            } catch (aiError) {
                console.warn('⚠️ AI analysis failed, continuing without it:', aiError.message);
                aiAnalysis = 'AI analysis unavailable';
                // Don't store in database if AI analysis failed
            }
        } else {
            console.log('♻️ Reusing existing AI analysis from database');
        }

        // Ensure hash is always available for JSON-LD (even if AI failed)
        // Hash is generated early, so it should always be set
        if (!analysisHash) {
            console.warn('⚠️ No analysis hash generated, creating fallback hash');
            const fallbackHashInput = `${repoInfo.url || repoInfo.name || 'unknown'}-${Date.now()}`;
            analysisHash = crypto.createHash('sha256').update(fallbackHashInput).digest('hex');
        }

        // Determine category and description from repository data (no AI)
        const category = determineCategory(repoInfo, fileStructure);
        const description = repoInfo.description || generateDescriptionFromReadme(readme) || 'No description available';
        const keywords = repoInfo.topics && repoInfo.topics.length > 0 
            ? repoInfo.topics 
            : extractKeywordsFromReadme(readme);


        // Build JSON-LD using the standard format (same as projectToJSONLD)
        const projectId = `https://buildergraph.com/project/${(repoInfo.name || 'unknown').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        const project = {
            '@type': ['schema:SoftwareSourceCode', 'schema:CreativeWork', 'prov:Entity'],
            '@id': projectId,
            'schema:name': repoInfo.name || 'Unknown Project',
            'schema:description': description,
            'schema:codeRepository': repoInfo.url || '',
            'schema:dateCreated': repoInfo.createdAt || new Date().toISOString(),
            'schema:datePublished': repoInfo.updatedAt || new Date().toISOString(),
            'prov:generatedAtTime': new Date().toISOString(),
            'schema:identifier': {
                '@type': 'schema:PropertyValue',
                'schema:propertyID': 'projectId',
                'schema:value': projectId
            }
        };

        // Add programming languages
        const languageList = Object.keys(languages).length > 0 ? Object.keys(languages) : [repoInfo.language || 'Unknown'];
        project['schema:programmingLanguage'] = languageList;

        // Add category
        project['schema:applicationCategory'] = category;

        // Add keywords
        if (keywords && keywords.length > 0) {
            project['schema:keywords'] = keywords;
        }

        // Add interaction statistics (stars)
        if (repoInfo.stars !== undefined) {
            project['schema:interactionStatistic'] = {
                '@type': 'schema:InteractionCounter',
                'schema:interactionType': 'https://schema.org/LikeAction',
                'schema:userInteractionCount': repoInfo.stars || 0
            };
        }

        // Link to creator
        if (ownerUAL) {
            project['schema:creator'] = {
                '@id': ownerUAL
            };
            project['prov:wasAttributedTo'] = {
                '@id': ownerUAL
            };
        }

        // Add score, score breakdown, and AI analysis hash
        const additionalProperties = [
            {
                '@type': 'schema:PropertyValue',
                'schema:name': 'score',
                'schema:value': totalScore
            },
            {
                '@type': 'schema:PropertyValue',
                'schema:name': 'scoreBreakdown',
                'schema:value': JSON.stringify(scoreComponents)
            }
        ];

        // Add AI analysis hash (not the full text - that's stored in database)
        if (analysisHash) {
            additionalProperties.push({
                '@type': 'schema:PropertyValue',
                'schema:name': 'aiAnalysis',
                'schema:value': analysisHash
            });
        }

        project['schema:additionalProperty'] = additionalProperties;

        // Build final JSON-LD structure (same format as projectToJSONLD)
        const jsonLd = {
            '@context': {
                'schema': 'https://schema.org/',
                'prov': 'http://www.w3.org/ns/prov#'
            },
            '@graph': [project]
        };

        console.log('✅ Built JSON-LD from analysis values:', JSON.stringify(jsonLd, null, 2));

        // Generate analysis summary
        const analysisSummary = `Repository Analysis Summary:
- Overall Score: ${totalScore}/100
- Commit Score: ${scoreComponents.commitScore.toFixed(1)}/30
- Structure Score: ${scoreComponents.structureScore.toFixed(1)}/30
- README Score: ${scoreComponents.readmeScore.toFixed(1)}/30
- Metadata Score: ${scoreComponents.metadataScore.toFixed(1)}/30

Repository Metrics:
- Total Files: ${fileStructure.totalFiles || 0}
- Total Commits: ${commits.length}
- Stars: ${repoInfo.stars || 0}
- Forks: ${repoInfo.forks || 0}
- Has README: ${readme ? 'Yes' : 'No'}
- Has License: ${repoInfo.license ? 'Yes' : 'No'}

${aiAnalysis && aiAnalysis !== 'AI analysis unavailable' ? `\nAI Analysis:\n${aiAnalysis}` : ''}`;

        console.log(`✅ Analysis complete. Score: ${totalScore}/100`);
        console.log('📝 Full Analysis Summary:', analysisSummary);

        return {
            success: true,
            json_ld: jsonLd,
            score: totalScore,
            scoreBreakdown: scoreComponents,
            analysis_summary: analysisSummary,
            ai_analysis: aiAnalysis,
            ai_analysis_hash: analysisHash
        };

    } catch (error) {
        console.error('Error analyzing repository:', error);
        throw error;
    }
}

/**
 * Create fallback JSON-LD if AI parsing fails
 */
function createFallbackJSONLD(repoInfo, languages, ownerUAL, totalScore, scoreComponents) {
    return {
        "@context": {
            "schema": "https://schema.org/",
            "prov": "http://www.w3.org/ns/prov#"
        },
        "@graph": [{
            "@type": ["schema:SoftwareSourceCode", "schema:CreativeWork", "prov:Entity"],
            "@id": `https://buildergraph.com/project/${(repoInfo.name || 'unknown').toLowerCase().replace(/\s+/g, '-')}`,
            "schema:name": repoInfo.name || "Unknown Project",
            "schema:description": repoInfo.description || "No description available",
            "schema:codeRepository": repoInfo.url || "",
            "schema:programmingLanguage": Object.keys(languages),
            "schema:applicationCategory": "Software",
            "schema:dateCreated": repoInfo.createdAt || "",
            "schema:datePublished": repoInfo.createdAt || "",
            "schema:interactionStatistic": {
                "@type": "schema:InteractionCounter",
                "schema:interactionType": "https://schema.org/LikeAction",
                "schema:userInteractionCount": repoInfo.stars || 0
            },
            "schema:keywords": repoInfo.topics || [],
            "schema:creator": {
                "@id": ownerUAL || "unknown"
            },
            "prov:wasAttributedTo": {
                "@id": ownerUAL || "unknown"
            },
            "schema:additionalProperty": [
                {
                    "@type": "schema:PropertyValue",
                    "schema:name": "score",
                    "schema:value": totalScore
                },
                {
                    "@type": "schema:PropertyValue",
                    "schema:name": "scoreBreakdown",
                    "schema:value": JSON.stringify(scoreComponents)
                }
            ]
        }]
    };
}

export default {
    analyzeRepository,
    isAvailable: () => groqClient !== null
};

