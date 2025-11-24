import React, { useState } from 'react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';
import { mockProjects } from '../../../data/mockData';

const ProjectsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Filter and sort projects
  const filteredProjects = mockProjects
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stars - a.stars;
        case 'quality':
          return b.codeQualityScore - a.codeQualityScore;
        case 'commits':
          return b.commits - a.commits;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="2xl" className="py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Projects
            </h1>
            <p className="text-text-secondary">
              Showcase your work with verified metrics
            </p>
          </div>
          <Button onClick={() => window.location.href = '/dashboard/projects/add'}>+ Add Project</Button>
      
        </div>

        {/* Filters */}
        <ProjectFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              No projects found. Start by adding your first project!
            </p>
            <Button className="mt-4">+ Create First Project</Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export { ProjectsList };
