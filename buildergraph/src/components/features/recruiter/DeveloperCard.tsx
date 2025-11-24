import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { IoLocationSharp, IoMail, IoLockOpen, IoCheckmarkCircle, IoLogoGithub, IoGlobe } from 'react-icons/io5';

interface DeveloperCardProps {
    id: string;
    name: string;
    username: string;
    title: string;
    location: string;
    skills: string[];
    reputationScore: number;
    avatar: string;
    isContactUnlocked: boolean;
    verified?: boolean;
    matchScore?: number;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
    name,
    username,
    title,
    location,
    skills,
    reputationScore,
    avatar,
    isContactUnlocked: initialUnlocked,
    verified = false,
    matchScore,
}) => {
    const [isContactUnlocked, setIsContactUnlocked] = useState(initialUnlocked);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlockContact = () => {
        setIsUnlocking(true);

        // Simulate x402 payment
        setTimeout(() => {
            console.log('Payment processed: $0.50 via x402');
            setIsContactUnlocked(true);
            setIsUnlocking(false);
            alert('Contact unlocked! Email: ' + username + '@example.com');
        }, 1500);
    };

    return (
        <Card hoverable className="h-full flex flex-col md:flex-row gap-6 p-6 transition-all duration-300 hover:border-primary/50 group">
            {/* Avatar Section */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="relative">
                    <img
                        src={avatar}
                        alt={name}
                        className="w-24 h-24 rounded-full border-2 border-white/10 group-hover:border-primary/50 transition-colors object-cover"
                    />
                    {verified && (
                        <div className="absolute -bottom-1 -right-1 bg-background-card rounded-full p-1" title="Verified Developer">
                            <IoCheckmarkCircle className="text-accent text-xl" />
                        </div>
                    )}
                </div>
                {matchScore && (
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                        {matchScore}% Match
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                                {name}
                            </h3>
                            <span className="text-text-secondary text-sm">@{username}</span>
                        </div>
                        <p className="text-text-primary font-medium mb-2">{title}</p>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                                <IoLocationSharp className="text-accent" />
                                <span>{location}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <a href="#" className="hover:text-primary transition-colors"><IoLogoGithub className="text-lg" /></a>
                                <a href="#" className="hover:text-primary transition-colors"><IoGlobe className="text-lg" /></a>
                            </div>
                        </div>
                    </div>

                    {/* Reputation Score */}
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-text-secondary mb-1 uppercase tracking-wider">Reputation</div>
                        <div className="text-2xl font-bold text-accent">{reputationScore}</div>
                        <div className="text-xs text-emerald-400">Top 5%</div>
                    </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 text-text-secondary hover:text-primary rounded-lg text-xs font-medium transition-all cursor-default"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/${username}`, '_blank')}
                    >
                        View Full Profile
                    </Button>

                    {isContactUnlocked ? (
                        <Button variant="primary" size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 border-emerald-500">
                            <IoMail className="mr-2" />
                            Send Message
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={handleUnlockContact}
                            disabled={isUnlocking}
                        >
                            <IoLockOpen className="mr-2" />
                            {isUnlocking ? 'Processing...' : 'Unlock Contact ($0.50)'}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export { DeveloperCard };
