import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { MapPin, BadgeCheck, ShieldCheck, Github, Linkedin, Twitter, Copy, Check } from 'lucide-react';

interface HeroSectionProps {
    name: string;
    title: string;
    location: string;
    bio: string;
    reputationScore: number;
    avatar: string;
    ual?: string;
    explorerUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    name,
    title,
    location,
    bio,
    reputationScore,
    avatar,
    ual,
    explorerUrl,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyUAL = () => {
        if (ual) {
            navigator.clipboard.writeText(ual);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="relative min-h-[500px] bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 mb-12 rounded-3xl overflow-hidden border border-white/5">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,transparent_20%,rgba(123,97,255,0.1)_100%)]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 blur-[100px] rounded-full mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-full opacity-70 blur-md" />
                    <img
                        src={avatar}
                        alt={name}
                        className="relative w-36 h-36 rounded-full border-4 border-background object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-background rounded-full p-1.5 border border-white/10 shadow-lg">
                        <BadgeCheck className="w-6 h-6 text-primary fill-primary/10" />
                    </div>
                </div>

                {/* Name and Title */}
                <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-3 tracking-tight">
                    {name}
                </h1>
                <p className="text-2xl text-accent font-medium mb-4">
                    {title}
                </p>
                <div className="flex items-center justify-center gap-2 text-text-secondary mb-8">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                </div>

                {/* Bio */}
                <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-2xl mx-auto">
                    {bio}
                </p>

                {/* Reputation Score */}
                <div className="flex justify-center mb-10">
                    <Card className="inline-block bg-white/5 backdrop-blur-sm border-white/10">
                        <div className="flex items-center gap-6 px-4 py-2">
                            <div className="text-left">
                                <p className="text-text-secondary text-xs font-medium uppercase tracking-wider mb-1">Reputation Score</p>
                                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    {reputationScore}
                                </div>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center border border-white/10">
                                <ShieldCheck className="w-6 h-6 text-accent" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* DKG Badge */}
                {ual && (
                    <div className="mb-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-2 text-text-secondary text-sm">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            <span>Verified on Decentralized Knowledge Graph</span>
                        </div>
                        <button
                            onClick={handleCopyUAL}
                            className="group relative inline-flex items-center gap-3 px-5 py-3 bg-accent/5 border border-accent/20 rounded-xl hover:bg-accent/10 transition-all cursor-pointer max-w-full"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Universal Asset Locator (UAL)</span>
                                <span className="text-accent font-mono text-sm break-all text-left">
                                    {ual}
                                </span>
                            </div>
                            <div className="pl-3 border-l border-accent/20 text-accent/50 group-hover:text-accent transition-colors">
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </div>
                            {copied && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-2 py-1 rounded shadow-lg animate-fade-in-up">
                                    Copied!
                                </span>
                            )}
                        </button>
                        {explorerUrl && (
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 text-sm text-accent hover:underline"
                            >
                                View on DKG Explorer →
                            </a>
                        )}
                    </div>
                )}

                {/* Social Links */}
                <div className="flex justify-center gap-4">
                    <a
                        href="https://github.com"
                        className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300 text-text-secondary hover:text-white group"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <a
                        href="https://linkedin.com"
                        className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 hover:scale-110 transition-all duration-300 text-text-secondary hover:text-[#0077b5] group"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                        href="https://twitter.com"
                        className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all duration-300 text-text-secondary hover:text-white group"
                    >
                        <Twitter className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export { HeroSection };
