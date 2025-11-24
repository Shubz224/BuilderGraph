import React from 'react';
import { IoSearch } from 'react-icons/io5';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSearch }) => {
    return (
        <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-background-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex items-center p-2">
                <div className="pl-4 text-text-secondary">
                    <IoSearch className="text-2xl" />
                </div>
                <input
                    type="text"
                    placeholder="Search developers by name, skill, or location..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                    className="w-full bg-transparent border-none text-lg text-text-primary placeholder-text-secondary/50 px-4 py-3 focus:outline-none focus:ring-0"
                />
                <button
                    onClick={onSearch}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                    Search
                </button>
            </div>
        </div>
    );
};

export { SearchBar };
