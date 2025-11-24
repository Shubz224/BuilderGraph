import React from 'react';
import { Card } from '../../ui/Card';
import { IoFilter, IoRefresh } from 'react-icons/io5';

interface FilterSidebarProps {
    filters: {
        skills: string[];
        experience: [number, number];
        location: string;
        reputationMin: number;
    };
    onFilterChange: (key: string, value: any) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange }) => {
    const allSkills = ['TypeScript', 'React', 'Node.js', 'Python', 'Solidity', 'Go', 'Rust', 'GraphQL'];

    const toggleSkill = (skill: string) => {
        const newSkills = filters.skills.includes(skill)
            ? filters.skills.filter(s => s !== skill)
            : [...filters.skills, skill];
        onFilterChange('skills', newSkills);
    };

    const resetFilters = () => {
        onFilterChange('skills', []);
        onFilterChange('experience', [0, 20]);
        onFilterChange('location', '');
        onFilterChange('reputationMin', 0);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-text-primary font-bold">
                    <IoFilter className="text-accent" />
                    <span>Filters</span>
                </div>
                <button
                    onClick={resetFilters}
                    className="text-xs text-text-secondary hover:text-accent flex items-center gap-1 transition-colors"
                >
                    <IoRefresh />
                    Reset
                </button>
            </div>

            {/* Skills Filter */}
            <Card className="border-white/5">
                <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Skills</h3>
                <div className="space-y-3">
                    {allSkills.map((skill) => (
                        <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${filters.skills.includes(skill)
                                    ? 'bg-accent border-accent'
                                    : 'bg-background-elevated border-white/20 group-hover:border-accent/50'
                                }`}>
                                {filters.skills.includes(skill) && (
                                    <svg className="w-3 h-3 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <input
                                type="checkbox"
                                checked={filters.skills.includes(skill)}
                                onChange={() => toggleSkill(skill)}
                                className="hidden"
                            />
                            <span className={`text-sm transition-colors ${filters.skills.includes(skill) ? 'text-text-primary font-medium' : 'text-text-secondary group-hover:text-text-primary'
                                }`}>
                                {skill}
                            </span>
                        </label>
                    ))}
                </div>
            </Card>

            {/* Experience Filter */}
            <Card className="border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Experience</h3>
                    <span className="text-xs text-accent font-mono">{filters.experience[0]}+ years</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.experience[0]}
                    onChange={(e) => onFilterChange('experience', [Number(e.target.value), filters.experience[1]])}
                    className="w-full h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer accent-accent hover:accent-accent/80"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                    <span>0 yrs</span>
                    <span>10 yrs</span>
                    <span>20+ yrs</span>
                </div>
            </Card>

            {/* Reputation Filter */}
            <Card className="border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Reputation</h3>
                    <span className="text-xs text-accent font-mono">{filters.reputationMin}+</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="1000"
                    step="100"
                    value={filters.reputationMin}
                    onChange={(e) => onFilterChange('reputationMin', Number(e.target.value))}
                    className="w-full h-2 bg-background-elevated rounded-lg appearance-none cursor-pointer accent-accent hover:accent-accent/80"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-2">
                    <span>0</span>
                    <span>500</span>
                    <span>1000</span>
                </div>
            </Card>

            {/* Location Filter */}
            <Card className="border-white/5">
                <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">Location</h3>
                <div className="relative">
                    <select
                        value={filters.location}
                        onChange={(e) => onFilterChange('location', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-background-elevated border border-white/10 text-text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        <option value="">Any Location</option>
                        <option value="remote">Remote</option>
                        <option value="us">United States</option>
                        <option value="eu">Europe</option>
                        <option value="asia">Asia</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export { FilterSidebar };
