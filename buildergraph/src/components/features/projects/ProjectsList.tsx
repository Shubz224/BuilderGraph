import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import type { Project } from '../../../types/api.types';

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const loadProjects = async () => {
      const userUAL = userStore.getUserUAL();

      if (!userUAL) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProjectsByOwner(userUAL);
        if (response.success) {
          setProjects(response.projects);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filter projects
  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="2xl" className="py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Your Projects
            </h1>
            <p className="text-text-secondary">
              Manage your projects published on the DKG
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/projects/add')}>+ Add Project</Button>
        </div>

        {projects.length > 0 && (
          <ProjectFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id.toString()}
                name={project.name}
                description={project.description}
                techStack={project.tech_stack}
                category={project.category}
                repositoryUrl={project.repository_url}
                liveUrl={project.live_url}
                ual={project.ual}
                explorerUrl={project.explorerUrl}
                createdAt={project.created_at}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No projects yet</h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              {searchQuery ? 'No projects match your search.' : 'Showcase your work by adding your first project to the DKG!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/dashboard/projects/add')}>
                + Create First Project
              </Button>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export { ProjectsList };
