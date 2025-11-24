import React from 'react';
import { Card } from '../../ui/Card';

interface StatsSectionProps {
    totalCommits: number;
    totalProjects: number;
    totalEndorsements: number;
    memberSince: string;
}

const StatsSection: React.FC<StatsSectionProps> = ({
    totalCommits,
    totalProjects,
    totalEndorsements,
    memberSince,
}) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                    {totalCommits.toLocaleString()}
                </div>
                <p className="text-text-secondary text-sm">Commits</p>
            </Card>

            <Card className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-1">
                    {totalProjects}
                </div>
                <p className="text-text-secondary text-sm">Projects</p>
            </Card>

            <Card className="text-center">
                <div className="text-3xl font-bold text-accent mb-1">
                    {totalEndorsements}
                </div>
                <p className="text-text-secondary text-sm">Endorsements</p>
            </Card>

            <Card className="text-center">
                <div className="text-sm font-semibold text-text-primary mb-1">
                    Member
                </div>
                <p className="text-text-secondary text-sm">Since {memberSince}</p>
            </Card>
        </div>
    );
};

export { StatsSection };
