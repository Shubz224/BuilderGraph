import DKG from 'dkg.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * DKG.js SDK Service - Handles all DKG operations using the official dkg.js SDK
 * This is an alternative to the API-based dkg-service.js
 */
class DKGJSService {
    constructor() {
        this.dkg = null;
        this.isInitialized = false;
    }

    /**
     * Initialize DKG client
     */
    async initialize() {
        if (this.isInitialized) {
            return this.dkg;
        }

        const config = {
            environment: process.env.DKG_ENVIRONMENT || 'testnet',
            endpoint: process.env.DKG_NODE_ENDPOINT || 'http://localhost',
            port: parseInt(process.env.DKG_NODE_PORT || '8900'),
            blockchain: {
                name: process.env.DKG_BLOCKCHAIN || 'otp:20430',
                publicKey: process.env.PUBLIC_KEY,
                privateKey: process.env.PRIVATE_KEY,
            },
        };

        console.log('🔧 Initializing DKG.js SDK Service...');
        this.dkg = new DKG(config);

        try {
            const nodeInfo = await this.dkg.node.info();
            console.log('✅ DKG.js Service initialized. Node version:', nodeInfo.version);
            this.isInitialized = true;
            return this.dkg;
        } catch (error) {
            console.error('❌ Failed to initialize DKG.js Service:', error.message);
            throw new Error('DKG.js initialization failed: ' + error.message);
        }
    }

    /**
     * Create a Knowledge Asset for a BuilderGraph project
     * @param {Object} projectData - Project data to publish
     * @param {number} epochsNum - Number of epochs to keep the asset (default: 6)
     * @returns {Promise<Object>} Result with UAL and transaction details
     */
    async createProjectAsset(projectData, epochsNum = 6) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const content = {
            public: {
                '@context': 'http://schema.org',
                '@id': projectData.id || `https://buildergraph.io/project/${Date.now()}`,
                '@type': 'SoftwareProject',
                name: projectData.name,
                description: projectData.description,
                dateCreated: projectData.dateCreated || new Date().toISOString(),
                programmingLanguage: projectData.language || 'JavaScript',
                codeRepository: projectData.repository,
                author: {
                    '@type': 'Person',
                    name: projectData.author,
                },
            },
            private: projectData.privateData || {},
        };

        try {
            console.log(`📝 Creating Knowledge Asset for project: ${projectData.name}`);
            const result = await this.dkg.asset.create(content, { epochsNum });

            console.log(`✅ Asset created. UAL: ${result.UAL}`);
            return {
                success: true,
                ual: result.UAL,
                datasetRoot: result.datasetRoot,
                transactionHash: result.operation?.mintKnowledgeAsset?.transactionHash,
                blockNumber: result.operation?.mintKnowledgeAsset?.blockNumber,
            };
        } catch (error) {
            console.error('❌ Failed to create asset:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get a Knowledge Asset by UAL
     * @param {string} ual - Universal Asset Locator
     * @returns {Promise<Object>} Asset data
     */
    async getAsset(ual) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log(`📖 Retrieving asset: ${ual}`);
            const result = await this.dkg.asset.get(ual);

            return {
                success: true,
                data: result.assertion,
                operation: result.operation,
            };
        } catch (error) {
            console.error('❌ Failed to get asset:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Query the DKG using SPARQL
     * @param {string} query - SPARQL query string
     * @param {string} type - Query type (SELECT, CONSTRUCT, etc.)
     * @returns {Promise<Object>} Query results
     */
    async queryGraph(query, type = 'SELECT') {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('🔍 Running SPARQL query...');
            const result = await this.dkg.graph.query(query, type);

            return {
                success: true,
                data: result.data,
                status: result.status,
            };
        } catch (error) {
            console.error('❌ Query failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Search for projects by name
     * @param {string} projectName - Name to search for
     * @returns {Promise<Object>} Search results
     */
    async searchProjectsByName(projectName) {
        const query = `
            PREFIX schema: <http://schema.org/>
            SELECT ?project ?name ?description ?dateCreated
            WHERE {
                ?project a schema:SoftwareProject .
                ?project schema:name ?name .
                OPTIONAL { ?project schema:description ?description }
                OPTIONAL { ?project schema:dateCreated ?dateCreated }
                FILTER(CONTAINS(LCASE(?name), LCASE("${projectName}")))
            }
            LIMIT 100
        `;

        return await this.queryGraph(query);
    }

    /**
     * Publish asset asynchronously and return operation ID immediately
     * @param {Object} content - JSON-LD content
     * @param {number} epochsNum - Number of epochs
     * @returns {Promise<Object>} Operation ID and initial status
     */
    async publishAssetAsync(content, epochsNum = 6) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('📤 Starting async DKG asset publish...');

            // Start the publish operation (this initiates but doesn't wait)
            const createPromise = this.dkg.asset.create(content, { epochsNum });

            // Return immediately with operation tracking
            return {
                success: true,
                message: 'Asset publishing started',
                promise: createPromise
            };
        } catch (error) {
            console.error('❌ Failed to start asset publish:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Wait for asset publishing to complete
     * @param {Promise} publishPromise - Promise from publishAssetAsync
     * @param {number} timeoutMs - Timeout in milliseconds (default: 300000 = 5 minutes)
     * @returns {Promise<Object>} Complete asset data with UAL
     */
    async waitForAssetPublish(publishPromise, timeoutMs = 300000) {
        try {
            console.log('⏳ Waiting for asset publish to complete...');

            const result = await Promise.race([
                publishPromise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Asset publishing timed out')), timeoutMs)
                )
            ]);

            if (!result.UAL) {
                // Publishing started but UAL not generated yet
                return {
                    success: false,
                    status: 'pending',
                    datasetRoot: result.datasetRoot,
                    operationId: result.operation?.publish?.operationId,
                    error: result.operation?.publish?.errorMessage || 'UAL not generated yet'
                };
            }

            console.log('✅ Asset published successfully. UAL:', result.UAL);
            return {
                success: true,
                ual: result.UAL,
                datasetRoot: result.datasetRoot,
                transactionHash: result.operation?.mintKnowledgeAsset?.transactionHash,
                blockNumber: result.operation?.mintKnowledgeAsset?.blockNumber,
                operationId: result.operation?.publish?.operationId,
            };
        } catch (error) {
            console.error('❌ Asset publishing failed:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Create and wait for asset (all-in-one method for simpler use)
     * @param {Object} content - JSON-LD content
     * @param {number} epochsNum - Number of epochs
     * @returns {Promise<Object>} Complete result with UAL
     */
    async createAssetSync(content, epochsNum = 6) {
        const asyncResult = await this.publishAssetAsync(content, epochsNum);

        if (!asyncResult.success) {
            return asyncResult;
        }

        return await this.waitForAssetPublish(asyncResult.promise);
    }

    /**
     * Get node info
     * @returns {Promise<Object>} Node information
     */
    async getNodeInfo() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const info = await this.dkg.node.info();
            return {
                success: true,
                version: info.version,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Export singleton instance
export default new DKGJSService();

// Example usage:
/*
import dkgjsService from './dkgjs-service.js';

// Initialize
await dkgjsService.initialize();

// Create a project asset
const result = await dkgjsService.createProjectAsset({
    name: 'My Awesome Project',
    description: 'A revolutionary dApp',
    language: 'JavaScript',
    repository: 'https://github.com/user/project',
    author: 'Developer Name',
    privateData: {
        '@context': 'http://schema.org',
        '@id': 'https://buildergraph.io/project/private/123',
        '@type': 'ProjectPrivateData',
        internalNotes: 'Some private notes',
    }
});

console.log('UAL:', result.ual);

// Get asset
const asset = await dkgjsService.getAsset(result.ual);
console.log('Asset data:', asset.data);

// Search projects
const projects = await dkgjsService.searchProjectsByName('Awesome');
console.log('Found projects:', projects.data);
*/
