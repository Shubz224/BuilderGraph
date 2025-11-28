import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Container } from '../components/ui/Container';
import { api } from '../services/api';
import { IoArrowBack, IoAnalytics, IoCube, IoLockClosed } from 'react-icons/io5';

interface ProjectFullData {
    name: string;
    description: string;
    ual: string;
    aiAnalysis: {
        score: number;
        breakdown: {
            commitScore: number;
            structureScore: number;
            readmeScore: number;
            metadataScore: number;
        };
        summary: string;
    } | null;
}

const DeveloperFullData: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [data, setData] = useState<{ username: string; fullName: string; projects: ProjectFullData[] } | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!username) return;

            try {
                // Check access first
                if (isConnected && address) {
                    const accessCheck = await api.checkProfileAccess(address, username);
                    if (accessCheck.success && accessCheck.hasAccess) {
                        setHasAccess(true);
                        // Load data
                        const response = await api.getDeveloperFullData(username);
                        if (response.success) {
                            setData({
                                username: response.username || '',
                                fullName: response.fullName || '',
                                projects: response.projects || []
                            });
                        }
                    } else {
                        setHasAccess(false);
                    }
                } else {
                    setHasAccess(false);
                }
            } catch (error) {
                console.error('Failed to load full data:', error);
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [username, address, isConnected]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Container maxWidth="md">
                    <div className="text-center bg-background-card rounded-xl p-12 border border-white/5">
                        <IoLockClosed className="text-6xl text-accent mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-text-primary mb-4">
                            Payment Required
                        </h1>
                        <p className="text-text-secondary mb-6">
                            You need to unlock access to view this developer's full profile data.
                        </p>
                        <button
                            onClick={() => navigate('/recruiter')}
                            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:opacity-90 transition"
                        >
                            Go to Recruiter Dashboard
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center text-text-secondary">
                Developer not found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <Container maxWidth="2xl" className="py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-text-secondary hover:text-primary mb-8 transition-colors"
                >
                    <IoArrowBack className="mr-2" /> Back
                </button>

                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-text-primary mb-2">{data.fullName}</h1>
                    <p className="text-xl text-text-secondary">@{data.username}</p>
                    <div className="mt-4 inline-block px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-primary">
                        <span className="font-bold">{data.projects.length}</span> Projects Analyzed
                    </div>
                </div>

                <div className="grid gap-8">
                    {data.projects.map((project, index) => (
                        <div key={index} className="bg-background-card border border-white/5 rounded-xl p-8 hover:border-primary/30 transition-all">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-text-primary mb-3 flex items-center">
                                        <IoCube className="mr-3 text-accent" />
                                        {project.name}
                                    </h2>
                                    <p className="text-text-secondary mb-6">{project.description}</p>

                                    <div className="bg-background-elevated rounded-lg p-4 font-mono text-xs text-text-secondary break-all">
                                        UAL: {project.ual}
                                    </div>

                                    {project.aiAnalysis ? (

                                        <div className="text-sm text-text-secondary border-t border-white/10 pt-4">
                                            <p className="italic whitespace-pre-wrap">
                                                {project.aiAnalysis.summary}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-text-secondary border-t border-white/10 pt-4">
                                            <p className="line-clamp-3 italic">
                                                No AI Analysis Available
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {project.aiAnalysis ? (
                                    <div className="lg:w-1/3 bg-background-elevated rounded-xl p-6 border border-white/5">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-text-primary flex items-center">
                                                <IoAnalytics className="mr-2 text-emerald-400" />
                                                AI Analysis
                                            </h3>
                                            <div className="text-3xl font-bold text-emerald-400">
                                                {project.aiAnalysis.score}
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            {Object.entries(project.aiAnalysis.breakdown || {}).map(([key, value]) => (
                                                <div key={key} className="flex justify-between text-sm">
                                                    <span className="text-text-secondary capitalize">
                                                        {key.replace('Score', '')}
                                                    </span>
                                                    <span className="text-text-primary font-medium">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="lg:w-1/3 flex items-center justify-center bg-background-elevated rounded-xl border border-white/5 border-dashed text-text-secondary">
                                        No AI Analysis Available
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default DeveloperFullData;
