import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { mockProjects } from '../../../data/mockData';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = mockProjects.find((p) => p.id === id);

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
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            {project.name}
          </h1>
          <p className="text-xl text-text-secondary mb-6">
            {project.description}
          </p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech) => (
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
            <Button>View on GitHub</Button>
            <Button variant="secondary">Request Endorsement</Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Metrics Cards */}
          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4">
              Code Quality
            </h3>
            <div className="mb-4">
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {project.codeQualityScore}%
              </div>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${project.codeQualityScore}%` }}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4">
              Test Coverage
            </h3>
            <div className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-4">
              87%
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-primary"
                style={{ width: '87%' }}
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-text-secondary text-sm font-medium mb-4">
              GitHub Stats
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-text-secondary text-xs mb-1">Stars</p>
                <p className="text-2xl font-bold text-text-primary">
                  {project.stars}
                </p>
              </div>
              <div>
                <p className="text-text-secondary text-xs mb-1">Commits</p>
                <p className="text-2xl font-bold text-text-primary">
                  {project.commits}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Description Section */}
        <Card className="mb-12">
          <h2 className="text-2xl font-semibold text-text-primary mb-4">
            About this project
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            This is a detailed description of the project. In a real implementation,
            this would be fetched from the README.md file on GitHub and rendered as markdown.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The project showcases best practices in code quality, testing, and documentation.
            It has been contributed to by multiple developers and maintains high standards
            throughout the codebase.
          </p>
        </Card>

        {/* Recent Commits */}
        <Card>
          <h2 className="text-2xl font-semibold text-text-primary mb-6">
            Recent Commits
          </h2>
          <div className="space-y-4">
            {[
              {
                hash: 'abc123f',
                message: 'feat: Add real-time collaboration with WebSocket',
                additions: 347,
                deletions: 123,
              },
              {
                hash: 'def456g',
                message: 'fix: Resolve memory leak in data synchronization',
                additions: 45,
                deletions: 78,
              },
              {
                hash: 'ghi789h',
                message: 'docs: Update API documentation',
                additions: 120,
                deletions: 15,
              },
            ].map((commit, index) => (
              <div
                key={index}
                className="pb-4 border-b border-white/5 last:border-0"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <code className="text-accent text-sm font-mono">
                      {commit.hash}
                    </code>
                    <p className="text-text-primary font-medium mt-1">
                      {commit.message}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-text-secondary text-sm">
                  <span className="text-green-400">+{commit.additions}</span>
                  <span className="text-red-400">-{commit.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </div>
  );
};

export { ProjectDetail };
