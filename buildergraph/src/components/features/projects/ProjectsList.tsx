import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { ProjectCard } from './ProjectCard';
import { ProjectFilters } from './ProjectFilters';
import { GitHubRepoImportModal } from './GitHubRepoImportModal';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import type { Project } from '../../../types/api.types';

// Helper function to normalize tech_stack to always be an array
const normalizeTechStack = (techStack: any): string[] => {
  if (Array.isArray(techStack)) {
    return techStack;
  }
  if (typeof techStack === 'string') {
    try {
      const parsed = JSON.parse(techStack);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  useEffect(() => {
    loadProjects();
  }, []);

  const handleImportSuccess = () => {
    // Reload projects after successful import
    loadProjects();
  };

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
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 bg-background-elevated text-text-primary rounded-xl hover:bg-background-elevated/80 transition-colors font-medium border border-primary/30 hover:border-primary/50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Import from GitHub
            </button>
            <Button onClick={() => navigate('/dashboard/projects/add')}>+ Add Project</Button>
          </div>
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
                techStack={normalizeTechStack(project.tech_stack)}
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
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-6 py-3 bg-background-elevated text-text-primary rounded-xl hover:bg-background-elevated/80 transition-colors font-medium border border-primary/30 hover:border-primary/50 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Import from GitHub
                </button>
                <Button onClick={() => navigate('/dashboard/projects/add')}>
                  + Create First Project
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>

      {/* GitHub Import Modal */}
      <GitHubRepoImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
};

export { ProjectsList };
