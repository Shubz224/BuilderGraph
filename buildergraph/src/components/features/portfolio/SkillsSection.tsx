import React from 'react';
import { Card } from '../../ui/Card';
import { CheckCircle2, Users } from 'lucide-react';

interface Skill {
    name: string;
    level: number;
    endorsed: boolean;
    endorsementCount: number;
}

interface SkillsSectionProps {
    skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
    return (
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                Skills & Expertise
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                    <Card key={index} className="group hover:border-primary/30 transition-all duration-300">
                        {/* Skill Header */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                                    {skill.name}
                                </span>
                                {skill.endorsed && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-full text-[10px] font-medium border border-accent/20">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Verified
                                    </div>
                                )}
                            </div>
                            <span className="text-text-secondary font-mono text-sm">
                                {skill.level}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out group-hover:shadow-[0_0_10px_rgba(123,97,255,0.5)]"
                                style={{ width: `${skill.level}%` }}
                            />
                        </div>

                        {/* Endorsements */}
                        <div className="flex items-center gap-2 text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                            <Users className="w-3.5 h-3.5" />
                            <span>{skill.endorsementCount} endorsement{skill.endorsementCount !== 1 ? 's' : ''}</span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export { SkillsSection };
