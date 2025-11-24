import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { IoStar, IoSave } from 'react-icons/io5';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  stars: number;
  commits: number;
  codeQualityScore: number;
  lastUpdated: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  techStack,
  stars,
  commits,
  codeQualityScore,
  lastUpdated,
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
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          {name}
        </h3>
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

      {/* Metrics */}
      <div className="mt-auto space-y-3">
        {/* Quality Score */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary text-sm">Code Quality</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${codeQualityScore}%` }}
              />
            </div>
            <span className="text-accent font-semibold text-sm">
              {codeQualityScore}%
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-text-secondary text-sm">
          <div className="flex items-center gap-1">
            <IoStar className="text-accent" />
            <span>{stars}</span>
          </div>
          <div className="flex items-center gap-1">
            <IoSave className="text-primary" />
            <span>{commits}</span>
          </div>
          <div className="text-xs">
            Updated {lastUpdated}
          </div>
        </div>
      </div>
    </Card>
  );
};

export { ProjectCard };
