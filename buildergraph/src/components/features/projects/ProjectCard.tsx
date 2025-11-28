import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle, IoGlobe, IoLogoGithub } from 'react-icons/io5';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  category?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  ual?: string;
  explorerUrl?: string;
  createdAt: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  techStack,
  repositoryUrl,
  liveUrl,
  ual,
  explorerUrl,
  createdAt,
}) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/dashboard/projects/${id}`)}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="mb-4 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-text-primary flex-1">
            {name}
          </h3>
          {ual && (
            <div className="ml-2">
              <IoCheckmarkCircle className="text-accent text-xl" title="Published to DKG" />
            </div>
          )}
        </div>
        <p className="text-text-secondary text-sm line-clamp-2">
          {description}
        </p>
      </div>

      {/* Tech Stack */}
      <div className="mb-4 flex flex-wrap gap-2">
        {techStack.slice(0, 3).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-primary/10 text-accent rounded text-xs font-medium"
          >
            {tech}
          </span>
        ))}
        {techStack.length > 3 && (
          <span className="px-2 py-1 bg-primary/10 text-accent rounded text-xs font-medium">
            +{techStack.length - 3}
          </span>
        )}
      </div>

      {/* Links & UAL */}
      <div className="mt-auto space-y-3">
        {/* UAL Section */}
        {ual && (
          <div className="p-2 bg-background-elevated rounded border border-white/5">
            <div className="text-xs text-text-muted mb-1">Universal Asset Locator</div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-accent font-mono flex-1 truncate">
                {ual.slice(0, 40)}...
              </code>
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 bg-primary/20 hover:bg-primary/30 text-accent text-xs rounded transition-colors"
                  title="View on DKG Explorer"
                >
                  DKG →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          {repositoryUrl && (
            <a
              href={repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <IoLogoGithub className="text-lg" />
              <span className="text-xs">Repo</span>
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <IoGlobe className="text-lg" />
              <span className="text-xs">Live</span>
            </a>
          )}
          <div className="flex-1" />
          <div className="text-xs text-text-muted">
            {new Date(createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export { ProjectCard };
