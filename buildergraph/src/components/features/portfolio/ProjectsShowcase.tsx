import React from 'react';
import { Card } from '../../ui/Card';
import { Star, Activity, ExternalLink } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    stars: number;
    codeQualityScore: number;
}

interface ProjectsShowcaseProps {
    projects: Project[];
}

const ProjectsShowcase: React.FC<ProjectsShowcaseProps> = ({ projects }) => {
    return (
        <div className="mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                Featured Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} hoverable className="group flex flex-col h-full border-white/5 hover:border-primary/30">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                                {project.name}
                            </h3>
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-primary/10 transition-colors">
                                <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-primary" />
                            </div>
                        </div>

                        <p className="text-text-secondary mb-6 line-clamp-2 flex-grow">
                            {project.description}
                        </p>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.techStack.slice(0, 3).map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2.5 py-1 bg-white/5 border border-white/5 text-text-secondary rounded-md text-xs font-medium"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.techStack.length > 3 && (
                                <span className="px-2.5 py-1 bg-white/5 border border-white/5 text-text-secondary rounded-md text-xs font-medium">
                                    +{project.techStack.length - 3}
                                </span>
                            )}
                        </div>

                        {/* Metrics */}
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-auto">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-text-secondary text-sm">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                                    <span>{project.stars}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-accent" />
                                    <span className="text-text-secondary text-xs">Quality</span>
                                </div>
                                <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent"
                                        style={{ width: `${project.codeQualityScore}%` }}
                                    />
                                </div>
                                <span className="text-accent font-bold text-sm">
                                    {project.codeQualityScore}%
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export { ProjectsShowcase };
