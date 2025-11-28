import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../components/ui/Container';
import {
  ReputationScore,
  ReputationBreakdown,
  ActivityFeed,
  QuickActions,
  ProfileCompletion
} from '../components/features/reputation';
import {
  IoCodeSlash,
  IoTrendingUp,
  IoPeople,
  IoBulb,
  IoSave,
  IoRocket,
  IoStar,
  IoEye,
  IoFolder,
  IoLogoGithub
} from 'react-icons/io5';
import { api } from '../services/api';
import { userStore } from '../stores/userStore';
import type { Profile, Project } from '../types/api.types';
import { getReputationScore } from '../utils/reputation';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      // Check if user has UAL
      const userUAL = userStore.getUserUAL();

      if (!userUAL) {
        // No profile, redirect to setup
        navigate('/profile-setup');
        return;
      }

      try {
        // Load profile data
        const cachedProfile = userStore.getUserProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
        }

        // Fetch fresh profile data
        const profileResponse = await api.getProfile(userUAL);
        if (profileResponse.success) {
          setProfile(profileResponse.profile);
          userStore.saveUserProfile(profileResponse.profile);
        }

        // Load projects
        const projectsResponse = await api.getProjectsByOwner(userUAL);
        if (projectsResponse.success) {
          setProjects(projectsResponse.projects);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  // Loading state
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data
  const breakdownItems = [
    { label: 'Code Quality', value: 35, icon: <IoCodeSlash className="text-2xl" /> },
    { label: 'Consistency', value: 25, icon: <IoTrendingUp className="text-2xl" /> },
    { label: 'Peer Endorsements', value: 20, icon: <IoPeople className="text-2xl" /> },
    { label: 'Project Diversity', value: 20, icon: <IoBulb className="text-2xl" /> },
  ];

  const activities = [
    {
      id: '1',
      type: 'project' as const,
      title: `Profile published to DKG`,
      description: `UAL: ${profile.ual.slice(0, 40)}...`,
      timestamp: new Date(profile.created_at).toLocaleDateString(),
      icon: <IoRocket className="text-xl" />,
      color: 'from-primary to-accent',
    },
    ...projects.slice(0, 2).map((project, idx) => ({
      id: `project-${idx}`,
      type: 'project' as const,
      title: `Added project: ${project.name}`,
      description: project.category,
      timestamp: new Date(project.created_at).toLocaleDateString(),
      icon: <IoRocket className="text-xl" />,
      color: 'from-primary/50 to-accent/50',
    })),
  ];

  const quickActions = [
    {
      id: '1',
      label: 'Add Project',
      icon: <IoFolder className="text-3xl" />,
      description: 'Showcase your work',
      onClick: () => navigate('/dashboard/projects/add'),
    },
    {
      id: '2',
      label: 'View Profile',
      icon: <IoEye className="text-3xl" />,
      description: 'See your public page',
      onClick: () => window.open(profile.explorerUrl, '_blank'),
    },
    {
      id: '3',
      label: 'View Projects',
      icon: <IoLogoGithub className="text-3xl" />,
      description: 'Manage your projects',
      onClick: () => navigate('/dashboard/projects'),
    },
  ];

  const profileFields = [
    profile.full_name,
    profile.email,
    profile.location,
    profile.bio,
    profile.skills?.length || 0,
    profile.github_username,
  ];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

  const completionItems = [
    { name: 'Complete basic profile', completed: true },
    { name: 'Add skills', completed: (profile.skills?.length || 0) > 0 },
    { name: 'Connect GitHub', completed: !!profile.github_username },
    { name: 'Add at least 3 projects', completed: projects.length >= 3 },
    { name: 'Published to DKG', completed: !!profile.ual },
  ];

  // Stats for hero section
  const heroStats = [
    {
      label: 'TOTAL REPOS',
      value: (profile.github_repos?.length || 0).toString(),
      change: `+${projects.length}`,
      icon: <IoSave className="text-3xl" />,
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      label: 'ACTIVE PROJECTS',
      value: projects.length.toString(),
      change: projects.filter(p => p.publish_status === 'completed').length > 0 ? `+${projects.filter(p => p.publish_status === 'completed').length}` : '0',
      icon: <IoRocket className="text-3xl" />,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'SKILLS',
      value: (profile.skills?.length || 0).toString(),
      change: `${profile.experience || 0}y exp`,
      icon: <IoCodeSlash className="text-3xl" />,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      label: 'DKG VERIFIED',
      value: profile.ual ? '✓' : '✗',
      change: profile.publish_status,
      icon: <IoStar className="text-3xl" />,
      gradient: 'from-emerald-500 to-teal-600'
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(123,97,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,217,255,0.1),transparent_50%)]" />

        <Container maxWidth="2xl" className="py-12 relative z-10">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-3 tracking-tight">
              WELCOME BACK
            </h1>
            <p className="text-xl text-accent font-medium">
              {profile.full_name}
            </p>
            <p className="text-text-secondary mt-2">
              @{profile.username} • Verified Developer on the Decentralized Knowledge Graph
            </p>
            {profile.ual && (
              <p className="text-text-muted text-sm mt-1 font-mono">
                UAL: {profile.ual.slice(0, 60)}...
              </p>
            )}
          </div>

          {/* Hero Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-background-card/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl rounded-full`} />
                <div className="relative">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-xs text-text-secondary font-semibold tracking-wider mb-2">
                    {stat.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </div>
                    <div className="text-xs text-accent font-semibold">
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container maxWidth="2xl" className="py-12">
        {/* Reputation Overview Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              REPUTATION OVERVIEW
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reputation Score */}
            <div className="lg:col-span-1">
              <ReputationScore
                score={getReputationScore(profile)}
                trend="up"
              />
            </div>

            {/* Breakdown */}
            <div className="lg:col-span-2">
              <ReputationBreakdown items={breakdownItems} />
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              QUICK ACTIONS
            </h2>
          </div>
          <QuickActions actions={quickActions} />
        </div>

        {/* Profile & Activity Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              ACTIVITY & PROGRESS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileCompletion
              percentage={profileCompletion}
              items={completionItems}
            />
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Recent Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                YOUR PROJECTS
              </h2>
            </div>
            <button
              onClick={() => navigate('/dashboard/projects/add')}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors text-sm font-semibold"
            >
              + Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-background-card rounded-xl p-12 border border-white/10 text-center">
              <IoRocket className="text-6xl text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-bold text-text-primary mb-2">No projects yet</h3>
              <p className="text-text-secondary mb-6">Showcase your work by adding your first project!</p>
              <button
                onClick={() => navigate('/dashboard/projects/add')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold"
              >
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative bg-background-card rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {project.publish_status === 'completed' ? (
                          <IoStar className="text-accent" title="Published to DKG" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Publishing..." />
                        )}
                        <IoRocket className="text-2xl text-accent" />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-accent rounded-full text-xs font-semibold border border-primary/30 hover:border-accent/50 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.tech_stack.length > 3 && (
                        <span className="px-3 py-1 bg-white/5 text-text-secondary rounded-full text-xs font-semibold">
                          +{project.tech_stack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-4 text-text-secondary text-sm">
                      <a
                        href={project.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-primary transition-colors font-semibold text-xs"
                      >
                        GITHUB →
                      </a>
                      {project.ual && (
                        <a
                          href={project.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-primary transition-colors font-semibold text-xs"
                        >
                          DKG →
                        </a>
                      )}
                      <div className="flex-1" />
                      <span className="text-xs text-text-muted">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
