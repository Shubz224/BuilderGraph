import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import { User, ExternalLink, Github, LogOut } from 'lucide-react';
import logo from '../../assets/logo.png';
import { api } from '../../services/api';
import type { Profile } from '../../types/api.types';

const Navbar: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check authentication status first
        const authStatus = await api.checkAuthStatus();
        if (authStatus.authenticated && authStatus.user && authStatus.user.username) {
          // Load full profile by username from API (standard way)
          const profileResponse = await api.getProfileByUsername(authStatus.user.username);
          if (profileResponse.success && profileResponse.profile) {
            setProfile(profileResponse.profile);
            return;
          }
          
          // If profile not found by username, use auth user data as fallback
          // This happens when user just connected GitHub but profile isn't fully set up
          setProfile({
            id: authStatus.user.id,
            username: authStatus.user.username,
            full_name: authStatus.user.full_name || authStatus.user.username,
            avatar_url: authStatus.user.avatar_url,
            email: authStatus.user.email || '',
            location: authStatus.user.location || '',
            bio: authStatus.user.bio || undefined,
            skills: [],
            experience: 0,
            languages: [],
            specializations: [],
            github_username: authStatus.user.github_username || authStatus.user.username,
            github_repos: [],
            ual: authStatus.user.ual || '',
            dataset_root: '',
            publish_status: authStatus.user.publish_status || 'pending',
            created_at: new Date().toISOString(),
            explorerUrl: ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, []);

  const profileLink = profile?.username ? `/${profile.username}` : '/profile-setup';

  const handleLogout = async () => {
    const result = await api.logout();
    if (result.success) {
      setProfile(null);
      window.location.reload();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <Container maxWidth="2xl" className="py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-0 group-hover:opacity-50 blur transition duration-500" />
              <img src={logo} alt="BuilderGraph Logo" className="relative w-8 h-8 object-contain" />
            </div>
            <span className="font-bold text-lg text-text-primary tracking-tight">BuilderGraph</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/projects"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Projects
            </Link>
            <Link
              to="/dashboard/endorsements"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Endorsements
            </Link>
            <Link
              to="/recruiter"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-full transition-all"
            >
              Recruiters
            </Link>
            <a
              href="https://dkg-testnet.origintrail.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent hover:bg-white/5 rounded-full transition-all flex items-center gap-2"
            >
              DKG Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <Link
              to={profileLink}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all group"
            >
              <User className="w-4 h-4 text-primary group-hover:text-accent transition-colors" />
              <span className="text-sm font-medium text-text-primary">
                {profile ? 'My Profile' : 'Create Profile'}
              </span>
            </Link>

            <div className="h-6 w-px bg-white/10" />

            {profile ? (
              /* Show user info when authenticated */
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-8 h-8 rounded-full border-2 border-primary/30"
                    />
                  )}
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-text-primary">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-xs text-text-secondary">@{profile.username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-text-secondary hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              /* Show login button when not authenticated */
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => api.loginWithGitHub()}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Connect GitHub
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export { Navbar };
