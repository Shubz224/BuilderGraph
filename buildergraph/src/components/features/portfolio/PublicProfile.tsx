import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { HeroSection } from './HeroSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsShowcase } from './ProjectsShowcase';
import { StatsSection } from './StatsSection';
import { ShareSection } from './ShareSection';
import { api } from '../../../services/api';
import type { Profile, Project } from '../../../types/api.types';
import { getReputationScore } from '../../../utils/reputation';

const PublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!username) return;

            try {
                // Get all profiles and find by username
                const response = await api.getAllProfiles();
                if (response.success) {
                    const foundProfile = response.profiles.find(
                        p => p.username.toLowerCase() === username.toLowerCase()
                    );

                    if (foundProfile) {
                        setProfile(foundProfile);

                        // Load projects if UAL available
                        if (foundProfile.ual) {
                            const projectsResponse = await api.getProjectsByOwner(foundProfile.ual);
                            if (projectsResponse.success) {
                                setProjects(projectsResponse.projects);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Container maxWidth="md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-text-primary mb-4">
                            Profile not found
                        </h1>
                        <p className="text-text-secondary mb-6">
                            The user @{username} doesn't exist.
                        </p>
                        <a
                            href="/recruiter"
                            className="text-accent hover:underline"
                        >
                            ← Browse all developers
                        </a>
                    </div>
                </Container>
            </div>
        );
    }

    // Convert skills to the format expected by SkillsSection
    const skills = (profile.skills || []).map(skill => ({
        name: skill,
        level: 85 + Math.random() * 15, // Random level between 85-100
        endorsed: !!profile.ual,
        endorsementCount: Math.floor(Math.random() * 15)
    }));

    // Convert projects to format expected by ProjectsShowcase
    const projectsForShowcase = projects.map(project => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        techStack: project.tech_stack,
        stars: 0,
        commits: 0,
        codeQualityScore: 90,
        lastUpdated: 'recently',
        ual: project.ual,
        explorerUrl: project.explorerUrl
    }));

    return (
        <div className="min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-background-card to-background py-12">
                <Container maxWidth="2xl">
                    <HeroSection
                        name={profile.full_name}
                        title={`${profile.experience || 0}+ years experience • ${(profile.skills || []).length} skills`}
                        location={profile.location}
                        bio={profile.bio || 'No bio provided'}
                        reputationScore={getReputationScore(profile)}
                        avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                        ual={profile.ual}
                        explorerUrl={profile.explorerUrl}
                    />
                </Container>
            </div>

            {/* Main Content */}
            <Container maxWidth="2xl" className="py-12">
                {/* Share Section */}
                <ShareSection />

                {/* Stats */}
                <StatsSection
                    totalCommits={profile.github_repos?.length || 0}
                    totalProjects={projects.length}
                    totalEndorsements={0}
                    memberSince={new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                />

                {/* Skills */}
                {skills.length > 0 && (
                    <SkillsSection skills={skills} />
                )}

                {/* Projects */}
                {projectsForShowcase.length > 0 && (
                    <ProjectsShowcase projects={projectsForShowcase} />
                )}

                {projectsForShowcase.length === 0 && (
                    <div className="text-center py-12 bg-background-card rounded-xl border border-white/5">
                        <p className="text-text-secondary">No projects yet</p>
                    </div>
                )}

                {/* Footer CTA */}
                <div className="text-center py-12 border-t border-white/5">
                    <p className="text-text-secondary mb-4">
                        Want to hire {profile.full_name}?
                    </p>
                    <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition">
                        Get in Touch
                    </button>
                </div>
            </Container>
        </div>
    );
};

export { PublicProfile };
