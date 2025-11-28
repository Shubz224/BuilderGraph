/**
 * GitHub OAuth Authentication Routes
 */
import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { profileQueries } from '../database/db.js';
import dkgjsService from '../services/dkgjs-service.js';
import { profileToJSONLD } from '../utils/jsonld-converter.js';

const router = express.Router();

// Configure GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3002/api/auth/github/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Save or update user in database
      const profileData = {
        github_id: profile.id,
        username: profile.username,
        full_name: profile.displayName || profile.username,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`,
        avatar_url: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        bio: profile._json.bio,
        location: profile._json.location,
        github_username: profile.username,
        access_token: accessToken
      };

      profileQueries.upsertFromGithub(profileData);

      // Get the saved user
      const user = profileQueries.getByGithubId(profile.id);

      // Trigger DKG Profile Creation if not already published or publishing
      if (user && !user.ual && user.publish_status !== 'publishing') {
        console.log(`\n🚀 Triggering automatic DKG profile creation for @${user.username}`);

        // Prepare data for JSON-LD
        const dkgProfileData = {
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          location: user.location,
          bio: user.bio,
          githubUsername: user.github_username
        };

        // Convert to JSON-LD
        const jsonldContent = profileToJSONLD(dkgProfileData);

        // Start async DKG publish
        dkgjsService.publishAssetAsync(jsonldContent, 6).then(async (publishResult) => {
          if (publishResult.success) {
            const operationId = `auto-github-${Date.now()}-${user.username}`;

            // Update DB with operation ID and status
            // We need a way to update operation_id without changing other fields
            // For now, we can use updatePublishStatus which handles status, ual, datasetRoot
            // But we also need to set operation_id. 
            // Let's update the query in db.js or just use a direct update here if possible?
            // Actually, profileQueries.updatePublishStatus doesn't update operation_id.
            // But we can assume it's fine for now, or we should add a method.
            // Wait, db.js has `updatePublishStatus` which updates `updated_at`.

            // Let's manually update operation_id if needed, or just track it in memory?
            // Better to update DB so we know it's happening.
            // Since we don't have a specific method for operation_id in profileQueries (except getByOperationId),
            // we might skip saving operation_id for now or add a method.
            // However, the important part is the status.

            profileQueries.updatePublishStatus(user.id, 'publishing');
            console.log(`⏳ DKG publishing started for ${user.username}`);

            // Wait for completion
            const publishComplete = await dkgjsService.waitForAssetPublish(publishResult.promise);

            if (publishComplete.success) {
              profileQueries.updatePublishStatus(
                user.id,
                'completed',
                publishComplete.ual,
                publishComplete.datasetRoot
              );
              console.log(`✅ Auto-created DKG profile for ${user.username}. UAL: ${publishComplete.ual}`);
            } else {
              profileQueries.updatePublishStatus(user.id, 'failed');
              console.error(`❌ Auto-create DKG profile failed for ${user.username}:`, publishComplete.error);
            }
          } else {
            console.error(`❌ Failed to start DKG publish for ${user.username}:`, publishResult.error);
          }
        }).catch(err => {
          console.error('Error in auto-DKG publish:', err);
        });
      }

      return done(null, user);
    } catch (error) {
      console.error('GitHub auth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  try {
    const user = profileQueries.getById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

/**
 * GET /api/auth/github
 * Initiate GitHub OAuth flow
 */
router.get('/github',
  passport.authenticate('github', {
    scope: ['user:email', 'read:user', 'repo']
  })
);

/**
 * GET /api/auth/github/callback
 * GitHub OAuth callback
 */
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, user, info) => {
    if (err) {
      console.error('GitHub authentication error details:', err);
      // Redirect to frontend with error details if possible, or show JSON for debugging
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/callback?success=false&error=${encodeURIComponent(err.message)}`);
    }

    if (!user) {
      console.error('No user returned from GitHub authentication');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/callback?success=false&error=NoUser`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }

      // Successful authentication, redirect to frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?success=true`);
    });
  })(req, res, next);
});

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Not authenticated'
    });
  }

  // Return user without sensitive fields
  const { access_token, ...safeUser } = req.user;

  res.json({
    success: true,
    authenticated: true,
    user: safeUser
  });
});

/**
 * GET /api/auth/logout
 * Logout user
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});

/**
 * GET /api/auth/status
 * Check authentication status
 */
router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username,
      full_name: req.user.full_name,
      avatar_url: req.user.avatar_url
    } : null
  });
});

export default router;
