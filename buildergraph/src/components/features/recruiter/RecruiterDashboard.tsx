import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { SearchBar } from './SearchBar';
import { FilterSidebar } from './FilterSidebar';
import { DeveloperCard } from './DeveloperCard';
import { IoPeople, IoShieldCheckmark, IoTrendingUp, IoFlash } from 'react-icons/io5';
import { api } from '../../../services/api';
import type { Profile } from '../../../types/api.types';
import { getReputationScore } from '../../../utils/reputation';

const RecruiterDashboard: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        skills: [] as string[],
        experience: [0, 20] as [number, number],
        location: '',
        reputationMin: 0,
    });
    const [developers, setDevelopers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDevelopers = async () => {
            try {
                const response = await api.getAllProfiles();
                if (response.success) {
                    setDevelopers(response.profiles);
                }
            } catch (error) {
                console.error('Failed to load developers:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDevelopers();
    }, []);

    // Filter developers
    const filteredDevelopers = developers.filter((dev) => {
        // Search query
        if (searchQuery &&
            !dev.full_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !dev.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !(dev.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
        }

        // Skills filter
        if (filters.skills.length > 0 &&
            !filters.skills.some(s => (dev.skills || []).includes(s))) {
            return false;
        }

        // Experience filter (assume reputation score correlates)
        const devExp = dev.experience || 0;
        if (devExp < filters.experience[0] || devExp > filters.experience[1]) {
            return false;
        }

        return true;
    });

    const handleFilterChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const stats = [
        { label: 'Total Developers', value: developers.length.toString(), icon: <IoPeople />, change: `${developers.filter(d => d.ual).length} verified`, color: 'text-blue-400' },
        { label: 'On DKG', value: developers.filter(d => d.ual).length.toString(), icon: <IoShieldCheckmark />, change: 'Published', color: 'text-emerald-400' },
        { label: 'Total Projects', value: '–', icon: <IoFlash />, change: 'Linked', color: 'text-amber-400' },
        { label: 'Avg Experience', value: developers.length > 0 ? Math.round(developers.reduce((sum, d) => sum + (d.experience || 0), 0) / developers.length) + 'y' : '0y', icon: <IoTrendingUp />, change: 'Average', color: 'text-purple-400' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Loading developers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-background">
            {/* Hero / Stats Section */}
            <div className="bg-background-elevated border-b border-white/5 pt-12 pb-16">
                <Container maxWidth="2xl">
                    <div className="mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                            Talent <span className="text-accent">Discovery</span>
                        </h1>
                        <p className="text-lg text-text-secondary max-w-2xl">
                            Access verified developer profiles on the Decentralized Knowledge Graph. Find talent with cryptographic proof of skills.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-background-card p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg bg-white/5 ${stat.color} text-xl`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                                        {stat.change}
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-text-primary mb-1">{stat.value}</div>
                                <div className="text-sm text-text-secondary">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </Container>
            </div>

            <Container maxWidth="2xl" className="py-12">
                {/* Search Section */}
                <div className="relative -mt-24 mb-12 z-10">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSearch={() => console.log('Search:', searchQuery)}
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <FilterSidebar
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {/* Results Grid */}
                    <div className="lg:col-span-3">
                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                            <p className="text-text-secondary">
                                Showing <span className="text-text-primary font-semibold">{filteredDevelopers.length}</span> verified developers
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-text-secondary">Sort by:</span>
                                <select className="px-4 py-2 rounded-lg bg-background-elevated border border-white/10 text-text-primary focus:outline-none focus:border-primary cursor-pointer hover:bg-white/5 transition-colors">
                                    <option>Recently Added</option>
                                    <option>Experience (High to Low)</option>
                                    <option>Most Skills</option>
                                </select>
                            </div>
                        </div>

                        {/* Developer Cards */}
                        {filteredDevelopers.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredDevelopers.map((dev, index) => (
                                    <motion.div
                                        key={dev.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <DeveloperCard
                                            id={dev.id.toString()}
                                            name={dev.full_name}
                                            username={dev.username}
                                            title={`${dev.experience || 0}+ years experience`}
                                            location={dev.location}
                                            skills={dev.skills || []}
                                            reputationScore={getReputationScore(dev)}
                                            avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.username}`}
                                            isContactUnlocked={false}
                                            verified={!!dev.ual}
                                            matchScore={Math.min(70 + (dev.skills?.length || 0) * 3, 99)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-background-card rounded-2xl border border-white/5 border-dashed">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">No developers found</h3>
                                <p className="text-text-secondary max-w-md mx-auto">
                                    {developers.length === 0
                                        ? "No developers have created profiles yet. Be the first!"
                                        : "We couldn't find any developers matching your specific criteria. Try adjusting your filters or search terms."}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
};

export { RecruiterDashboard };
