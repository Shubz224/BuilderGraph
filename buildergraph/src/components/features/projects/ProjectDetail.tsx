import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';
import type { Project } from '../../../types/api.types';
import { IoLogoGithub, IoGlobe, IoCheckmarkCircle, IoCopy } from 'react-icons/io5';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'project' | 'owner' | null>(null);

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
            {project.tech_stack.map((tech) => (
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
            <div className="text-2xl font-bold capitalize">
              <span className={project.publish_status === 'completed' ? 'text-emerald-400' : 'text-yellow-400'}>
                {project.publish_status}
              </span>
            </div>
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
      </Container>
    </div>
  );
};

export { ProjectDetail };
