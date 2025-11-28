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


const PublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            if (!username) {
                console.log('No username provided');
                setLoading(false);
                return;
            }

            try {
                console.log('Loading profile for username:', username);
                // Get profile by username
                const response = await api.getProfileByUsername(username);
                console.log('Profile response:', response);

                if (response.success && response.profile) {
                    console.log('Profile loaded successfully:', response.profile);
                    setProfile(response.profile);

                    // Load projects if UAL available
                    if (response.profile.ual) {
                        console.log('Loading projects for UAL:', response.profile.ual);
                        const projectsResponse = await api.getProjectsByOwner(response.profile.ual);
                        if (projectsResponse.success) {
                            console.log('Projects loaded:', projectsResponse.projects);
                            setProjects(projectsResponse.projects);
                        }
                    }
                } else {
                    console.warn('Profile not found or response unsuccessful:', response);
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

    try {
        // Convert skills to the format expected by SkillsSection
        const skills = (profile.skills || []).map(skill => ({
            name: skill,
            level: 85 + Math.random() * 15, // Random level between 85-100
            endorsed: !!profile.ual,
            endorsementCount: Math.floor(Math.random() * 15)
        }));

        // Helper function to normalize tech_stack to always be an array
        const normalizeTechStack = (techStack: any): string[] => {
            if (Array.isArray(techStack)) {
                return techStack;
            }
            if (typeof techStack === 'string') {
                try {
                    const parsed = JSON.parse(techStack);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return [];
                }
            }
            return [];
        };

        // Convert projects to format expected by ProjectsShowcase
        const projectsForShowcase = projects.map(project => {
            try {
                return {
                    id: project.id.toString(),
                    name: project.name || 'Unnamed Project',
                    description: project.description || 'No description',
                    techStack: normalizeTechStack(project.tech_stack),
                    stars: 0,
                    commits: 0,
                    codeQualityScore: 90,
                    lastUpdated: 'recently',
                    ual: project.ual || undefined,
                    explorerUrl: project.explorerUrl || undefined
                };
            } catch (error) {
                console.error('Error processing project:', project, error);
                return null;
            }
        }).filter((p): p is NonNullable<typeof p> => p !== null);

        // Derive programming languages from projects
        const programmingLanguages = Array.from(new Set(
            projects.flatMap(p => {
                try {
                    const stack = p.tech_stack;
                    if (Array.isArray(stack)) return stack;
                    if (typeof stack === 'string') return JSON.parse(stack);
                    return [];
                } catch {
                    return [];
                }
            })
        )).slice(0, 5); // Top 5 languages

        return (
            <div className="min-h-screen pb-20">
                {/* Hero */}
                <div className="bg-gradient-to-br from-background-card to-background py-12">
                    <Container maxWidth="2xl">
                        <HeroSection
                            name={profile.full_name || profile.username || 'Unknown User'}
                            title={`Skills :${programmingLanguages.length || 'No languages'}`}
                            location={profile.location || undefined}
                            bio={profile.bio || 'No bio provided'}
                            reputationScore={profile.reputation_score || 0}
                            avatar={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                            ual={profile.ual || undefined}
                            explorerUrl={profile.explorerUrl || undefined}
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
                        memberSince={profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
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
                            Want to hire {profile.full_name || profile.username}?
                        </p>
                        <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition">
                            Get in Touch
                        </button>
                    </div>
                </Container>
            </div>
        );
    } catch (error) {
        console.error('Error rendering profile:', error);
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Container maxWidth="md">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-text-primary mb-4">
                            Error Loading Profile
                        </h1>
                        <p className="text-text-secondary mb-6">
                            {error instanceof Error ? error.message : 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition"
                        >
                            Reload Page
                        </button>
                    </div>
                </Container>
            </div>
        );
    }
};

export { PublicProfile };
