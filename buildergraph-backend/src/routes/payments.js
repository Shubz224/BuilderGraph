/**
 * Payment Access API Routes
 */
import express from 'express';
import { profileAccessQueries } from '../database/db.js';

const router = express.Router();

/**
 * POST /api/payments/grant-access
 * Grant access after successful payment
 */
router.post('/grant-access', (req, res) => {
    try {
        const { payerWalletAddress, profileUsername, transactionHash, amountPaid } = req.body;

        if (!payerWalletAddress || !profileUsername || !transactionHash || !amountPaid) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Grant access
        profileAccessQueries.grantAccess(
            payerWalletAddress.toLowerCase(),
            profileUsername,
            transactionHash,
            amountPaid
        );

        res.json({
            success: true,
            message: 'Access granted successfully'
        });

    } catch (error) {
        console.error('Error granting access:', error);

        // Check if it's a duplicate transaction hash error
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({
                success: false,
                error: 'This transaction has already been recorded'
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/payments/check-access/:username
 * Check if current wallet has access to a profile
 */
router.get('/check-access/:username', (req, res) => {
    try {
        const { username } = req.params;
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }

        const access = profileAccessQueries.hasAccess(
            walletAddress.toLowerCase(),
            username
        );

        res.json({
            success: true,
            hasAccess: !!access,
            accessDetails: access || null
        });

    } catch (error) {
        console.error('Error checking access:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/payments/my-access
 * Get all profiles the wallet has access to
 */
router.get('/my-access', (req, res) => {
    try {
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }

        const accessList = profileAccessQueries.getAccessByWallet(
            walletAddress.toLowerCase()
        );

        res.json({
            success: true,
            accessList
        });

    } catch (error) {
        console.error('Error fetching access list:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
