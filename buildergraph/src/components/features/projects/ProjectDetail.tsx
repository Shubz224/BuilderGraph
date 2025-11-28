import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';
import type { Project } from '../../../types/api.types';
import { IoLogoGithub, IoGlobe, IoCheckmarkCircle, IoCopy, IoTrash } from 'react-icons/io5';

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

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'project' | 'owner' | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        const response = await api.getProject(id);
        if (response.success) {
          setProject(response.project);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const copyToClipboard = (text: string, type: 'project' | 'owner') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    if (!project || !project.id) return;

    setIsDeleting(true);
    try {
      const result = await api.deleteProject(project.id);
      if (result.success) {
        navigate('/dashboard/projects');
      } else {
        alert(result.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Container maxWidth="md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Project not found
            </h1>
            <Button onClick={() => navigate('/dashboard/projects')}>
              ← Back to Projects
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="2xl" className="py-12">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard/projects')}
          className="text-accent hover:text-accent/80 transition mb-6"
        >
          ← Back to Projects
        </button>

        {/* Project Title */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-3">
            <h1 className="text-4xl font-bold text-text-primary flex-1">
              {project.name}
            </h1>
            {project.ual && (
              <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                <IoCheckmarkCircle className="text-accent text-xl" />
                <span className="text-accent text-sm font-semibold">DKG Verified</span>
              </div>
            )}
          </div>
          <p className="text-xl text-text-secondary mb-6">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {normalizeTechStack(project.tech_stack).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-primary/10 text-accent rounded-lg text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            {project.repository_url && (
              <Button onClick={() => window.open(project.repository_url, '_blank')}>
                <IoLogoGithub className="mr-2" />
                View on GitHub
              </Button>
            )}
            {project.live_url && (
              <Button variant="secondary" onClick={() => window.open(project.live_url, '_blank')}>
                <IoGlobe className="mr-2" />
                Live Demo
              </Button>
            )}
            {project.explorerUrl && (
              <Button variant="secondary" onClick={() => window.open(project.explorerUrl, '_blank')}>
                <IoCheckmarkCircle className="mr-2" />
                DKG Explorer
              </Button>
            )}
          </div>
        </div>

        {/* UAL Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Project UAL */}
          {project.ual && (
            <Card>
              <h3 className="text-text-secondary text-sm font-semibold mb-3 uppercase tracking-wider">
                Project UAL
              </h3>
              <div className="bg-background-elevated rounded-lg p-3 mb-3">
                <code className="text-accent text-xs font-mono break-all">
                  {project.ual}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(project.ual!, 'project')}
                className="flex items-center gap-2 text-sm text-accent hover:text-primary transition-colors"
              >
                <IoCopy />
                {copied === 'project' ? 'Copied!' : 'Copy UAL'}
              </button>
            </Card>
          )}

          {/* Owner UAL */}
          {project.owner_ual && (
            <Card>
              <h3 className="text-text-secondary text-sm font-semibold mb-3 uppercase tracking-wider">
                Owner UAL
              </h3>
              <div className="bg-background-elevated rounded-lg p-3 mb-3">
                <code className="text-accent text-xs font-mono break-all">
                  {project.owner_ual}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(project.owner_ual, 'owner')}
                className="flex items-center gap-2 text-sm text-accent hover:text-primary transition-colors"
              >
                <IoCopy />
                {copied === 'owner' ? 'Copied!' : 'Copy UAL'}
              </button>
            </Card>
          )}
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Category */}
          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4 uppercase tracking-wider">
              Category
            </h3>
            <div className="text-2xl font-bold text-text-primary capitalize">
              {project.category}
            </div>
          </Card>

          {/* Status */}
          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4 uppercase tracking-wider">
              DKG Status
            </h3>
            <div className="text-2xl font-bold capitalize mb-4">
              <span className={project.publish_status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}>
                {project.publish_status}
              </span>
            </div>
            {project.publish_status !== 'completed' && (
              <div className="mt-4">
                {!showDeleteConfirm ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-red-400 border-red-400/30 hover:border-red-400 hover:bg-red-400/10"
                  >
                    <IoTrash className="mr-2" />
                    Delete Project
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-text-secondary mb-2">
                      Are you sure you want to delete this project? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        className="flex-1 bg-red-500 hover:bg-red-600"
                      >
                        <IoTrash className="mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Created */}
          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4 uppercase tracking-wider">
              Created
            </h3>
            <div className="text-lg font-semibold text-text-primary">
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </Card>
        </div>

        {/* Description Section */}
        <Card className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            About this project
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            {project.description}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
            <div>
              <p className="text-text-muted text-sm mb-1">Repository</p>
              <a
                href={project.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline text-sm break-all"
              >
                {project.repository_url}
              </a>
            </div>
            {project.live_url && (
              <div>
                <p className="text-text-muted text-sm mb-1">Live URL</p>
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-sm break-all"
                >
                  {project.live_url}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* Dataset Root */}
        {project.dataset_root && (
          <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              DKG Dataset Root
            </h2>
            <div className="bg-background-elevated rounded-lg p-4">
              <code className="text-accent text-xs font-mono break-all">
                {project.dataset_root}
              </code>
            </div>
            <p className="text-text-muted text-sm mt-3">
              This is the cryptographic root hash of your project's knowledge asset on the DKG.
            </p>
          </Card>
        )}

        {/* Delete Button for Completed Projects */}
        {project.publish_status === 'completed' && (
          <Card className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Danger Zone
              </h3>
              {!showDeleteConfirm ? (
                <div>
                  <p className="text-text-secondary text-sm mb-4">
                    Once you delete a project, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-red-400 border-red-400/30 hover:border-red-400 hover:bg-red-400/10"
                  >
                    <IoTrash className="mr-2" />
                    Delete Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-red-400 font-medium mb-1">Warning: This action cannot be undone</p>
                        <p className="text-text-secondary text-sm">
                          This will permanently delete the project from the database. The DKG asset will remain on the blockchain.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      <IoTrash className="mr-2" />
                      Delete Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
};

export { ProjectDetail };
