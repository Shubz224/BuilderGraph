import React from 'react';
import { Input } from '../../ui/Input';

interface ProjectFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="space-y-4 mb-8">
      {/* Search */}
      <Input
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Sort and Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={`
            px-4 py-2 rounded-lg
            bg-background-elevated border border-white/10
            text-text-primary
            focus:outline-none focus:border-primary
            transition-colors
          `}
        >
          <option value="recent">Most Recent</option>
          <option value="stars">Most Stars</option>
          <option value="quality">Highest Quality</option>
          <option value="commits">Most Commits</option>
        </select>
      </div>
    </div>
  );
};

export { ProjectFilters };
