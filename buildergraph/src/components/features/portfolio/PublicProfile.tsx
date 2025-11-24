import React from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { HeroSection } from './HeroSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsShowcase } from './ProjectsShowcase';
import { EndorsementsShowcase } from './EndorsementsShowcase';
import { StatsSection } from './StatsSection';
import { ShareSection } from './ShareSection';
import { mockUser, mockProjects, mockEndorsements } from '../../../data/mockData';

const PublicProfile: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    console.log('Viewing profile for:', username);

    // In a real app, fetch user data by username
    // For now, use mock data
    const user = mockUser;

    const skills = [
        { name: 'TypeScript', level: 95, endorsed: true, endorsementCount: 12 },
        { name: 'React', level: 92, endorsed: true, endorsementCount: 10 },
        { name: 'Solidity', level: 88, endorsed: true, endorsementCount: 8 },
        { name: 'Node.js', level: 90, endorsed: true, endorsementCount: 9 },
        { name: 'GraphQL', level: 85, endorsed: false, endorsementCount: 5 },
        { name: 'Docker', level: 80, endorsed: false, endorsementCount: 4 },
    ];

    return (
        <div className="min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-gradient-to-br from-background-card to-background py-12">
                <Container maxWidth="2xl">
                    <HeroSection
                        name={user.fullName}
                        title="Full-stack Developer"
                        location={`${user.location.city}, ${user.location.country}`}
                        bio={user.bio}
                        reputationScore={user.reputationScore}
                        avatar={user.avatar}
                    />
                </Container>
            </div>

            {/* Main Content */}
            <Container maxWidth="2xl" className="py-12">
                {/* Share Section */}
                <ShareSection />

                {/* Stats */}
                <StatsSection
                    totalCommits={1247}
                    totalProjects={8}
                    totalEndorsements={mockEndorsements.length}
                    memberSince="Jan 2024"
                />

                {/* Skills */}
                <SkillsSection skills={skills} />

                {/* Projects */}
                <ProjectsShowcase projects={mockProjects} />

                {/* Endorsements */}
                <EndorsementsShowcase endorsements={mockEndorsements} />

                {/* Footer CTA */}
                <div className="text-center py-12 border-t border-white/5">
                    <p className="text-text-secondary mb-4">
                        Want to hire {user.fullName}?
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
