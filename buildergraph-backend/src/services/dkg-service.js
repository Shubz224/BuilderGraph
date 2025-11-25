/**
 * DKG Service - Interface with DKG Node API
 */
import dotenv from 'dotenv';

dotenv.config();

const DKG_API_URL = process.env.DKG_API_URL || 'http://localhost:9200';
const DKG_EXPLORER_BASE = process.env.DKG_EXPLORER_BASE || 'https://dkg.origintrail.io';

/**
 * Publish a Knowledge Asset to DKG
 * @param {Object} jsonldContent - JSON-LD formatted content
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Result with UAL and status
 * 
 */


export async function publishAsset(jsonldContent, metadata = {}) {
    try {
        console.log('jsonldContent', jsonldContent);
        console.log('metadata', metadata);


        const payload = {
            content: jsonldContent,
            metadata: {
                source: 'buildergraph',
                ...metadata
            },
            publishOptions: {
                privacy: 'public',
                priority: 50,
                epochs: 2,
                maxAttempts: 3
            }
        };

        console.log('\n' + '='.repeat(80));
        console.log('📤 PUBLISHING TO DKG');
        console.log('='.repeat(80));
        console.log(`🌐 API URL: ${DKG_API_URL}/api/dkg/assets`);
        console.log(`📦 Content Type: ${jsonldContent['@type'] || 'Unknown'}`);
        console.log(`📄 Content Name: ${jsonldContent.name || 'Untitled'}`);
        console.log(`📊 Payload Size: ${JSON.stringify(payload).length} bytes`);
        console.log(`⚙️  Options: privacy=${payload.publishOptions.privacy}, epochs=${payload.publishOptions.epochs}`);

        // Use fetch API (same as governance-dkg-app)
        const response = await fetch(`${DKG_API_URL}/api/dkg/assets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ DKG API Error Response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();

        console.log('\n✅ DKG PUBLISH SUCCESS:');
        console.log(`   Asset ID: ${result.id}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   UAL: ${result.ual || 'Pending...'}`);
        console.log('='.repeat(80) + '\n');

        return {
            success: true,
            id: result.id,
            status: result.status,
            ual: result.ual || null,
            data: result
        };
    } catch (error) {
        console.error('\n❌ DKG PUBLISH ERROR:');
        console.error(`   ${error.message}`);
        console.log('='.repeat(80) + '\n');

        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Poll for asset UAL until available
 * @param {number} assetId - Asset ID to poll
 * @returns {Promise<string|null>} UAL if found
 */
async function pollForUAL(assetId, maxAttempts = 15) {
    const pollInterval = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await new Promise(resolve => setTimeout(resolve, pollInterval));

            const response = await fetch(`${DKG_API_URL}/api/dkg/assets/status/${assetId}`);

            if (response.ok) {
                const status = await response.json();

                if (status.ual) {
                    return status.ual;
                }

                if (status.status === 'failed') {
                    throw new Error('Asset publication failed: ' + (status.lastError || 'Unknown error'));
                }

                console.log(`   Polling attempt ${attempt}/${maxAttempts} - Status: ${status.status}`);
            }
        } catch (error) {
            console.error(`   Polling error: ${error.message}`);
        }
    }

    return null;
}

/**
 * Get asset status from DKG
 * @param {number} assetId - Asset ID
 * @returns {Promise<Object>} Asset status
 */
export async function getAssetStatus(assetId) {
    try {
        const response = await fetch(`${DKG_API_URL}/api/dkg/assets/status/${assetId}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('❌ Get asset status error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get asset by UAL from DKG
 * @param {string} ual - Universal Asset Locator
 * @returns {Promise<Object>} Asset data
 */
export async function getAssetByUAL(ual) {
    try {
        const response = await fetch(`${DKG_API_URL}/api/dkg/assets?ual=${encodeURIComponent(ual)}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('❌ Get asset by UAL error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate DKG explorer URL from UAL
 * @param {string} ual - Universal Asset Locator
 * @returns {string|null} Explorer URL
 */
export function getDKGExplorerURL(ual) {
    if (!ual) return null;
    return `${DKG_EXPLORER_BASE}/explore?ual=${encodeURIComponent(ual)}`;
}

export default {
    publishAsset,
    getAssetStatus,
    getAssetByUAL,
    getDKGExplorerURL
};
