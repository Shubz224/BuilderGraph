import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '../../ui/Container';
import { SearchBar } from './SearchBar';
import { FilterSidebar } from './FilterSidebar';
import { DeveloperCard } from './DeveloperCard';
import { IoPeople, IoShieldCheckmark, IoTrendingUp, IoFlash } from 'react-icons/io5';

const RecruiterDashboard: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        skills: [] as string[],
        experience: [0, 20] as [number, number],
        location: '',
        reputationMin: 0,
    });

    const mockDevelopers = [
        {
            id: '1',
            name: 'Alice Johnson',
            username: 'alicecodes',
            title: 'Senior Full-Stack Developer',
            location: 'San Francisco, CA',
            skills: ['TypeScript', 'React', 'Node.js', 'GraphQL'],
            reputationScore: 847,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
            isContactUnlocked: false,
            verified: true,
            matchScore: 98,
        },
        {
            id: '2',
            name: 'Bob Smith',
            username: 'bobthebuilder',
            title: 'Blockchain Engineer',
            location: 'Remote',
            skills: ['Solidity', 'Rust', 'Web3', 'TypeScript'],
            reputationScore: 923,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
            isContactUnlocked: false,
            verified: true,
            matchScore: 95,
        },
        {
            id: '3',
            name: 'Carol Chen',
            username: 'carolcodes',
            title: 'Backend Engineer',
            location: 'New York, NY',
            skills: ['Python', 'Go', 'PostgreSQL', 'Docker'],
            reputationScore: 756,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
            isContactUnlocked: false,
            verified: false,
            matchScore: 88,
        },
        {
            id: '4',
            name: 'David Lee',
            username: 'daviddev',
            title: 'Frontend Specialist',
            location: 'London, UK',
            skills: ['React', 'TypeScript', 'CSS', 'Next.js'],
            reputationScore: 689,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
            isContactUnlocked: false,
            verified: true,
            matchScore: 82,
        },
    ];

    // Filter developers
    const filteredDevelopers = mockDevelopers.filter((dev) => {
        // Search query
        if (searchQuery && !dev.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !dev.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) {
            return false;
        }

        // Skills filter
        if (filters.skills.length > 0 && !filters.skills.some(s => dev.skills.includes(s))) {
            return false;
        }

        // Reputation filter
        if (dev.reputationScore < filters.reputationMin) {
            return false;
        }

        return true;
    });

    const handleFilterChange = (key: string, value: any) => {
        setFilters({ ...filters, [key]: value });
    };

    const stats = [
        { label: 'Total Developers', value: '12,453', icon: <IoPeople />, change: '+12% this week', color: 'text-blue-400' },
        { label: 'Verified Skills', value: '8,932', icon: <IoShieldCheckmark />, change: '+5% this week', color: 'text-emerald-400' },
        { label: 'Active Today', value: '1,245', icon: <IoFlash />, change: '+18% this week', color: 'text-amber-400' },
        { label: 'Avg Reputation', value: '756', icon: <IoTrendingUp />, change: '+2% this week', color: 'text-purple-400' },
    ];

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
                            Access the world's first verified developer graph. Find talent with cryptographic proof of skills and contribution history.
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
                                    <option>Relevance (Best Match)</option>
                                    <option>Reputation (High to Low)</option>
                                    <option>Experience (High to Low)</option>
                                    <option>Recently Active</option>
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
                                        <DeveloperCard {...dev} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-background-card rounded-2xl border border-white/5 border-dashed">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">No developers found</h3>
                                <p className="text-text-secondary max-w-md mx-auto">
                                    We couldn't find any developers matching your specific criteria. Try adjusting your filters or search terms.
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
