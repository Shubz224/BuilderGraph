import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '../../ui/Container';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

const addProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  repositoryUrl: z.string().url('Invalid repository URL'),
  techStack: z.string().min(1, 'Add at least one technology'),
  category: z.string().min(1, 'Select a category'),
  liveUrl: z.string().url().optional().or(z.literal('')),
});

type AddProjectFormData = z.infer<typeof addProjectSchema>;

const AddProjectForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddProjectFormData>({
    resolver: zodResolver(addProjectSchema),
  });

  const onSubmit = (data: AddProjectFormData) => {
    // Create complete project data structure
    const completeProjectData = {
      projectId: `PROJ-${Date.now()}`,
      name: data.name,
      description: data.description,
      repositoryUrl: data.repositoryUrl,
      techStack: data.techStack.split(',').map((t) => t.trim()),
      category: data.category,
      liveUrl: data.liveUrl || null,
      createdAt: new Date().toISOString(),
      status: 'active',
      visibility: 'public',
    };

    // Log complete project data as JSON
    console.log('PROJECT ADDED:');
    console.log(completeProjectData);

    alert('Project added successfully! Check console for data.');
  };

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="md" className="py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Add New Project
          </h1>
          <p className="text-text-secondary">
            Showcase your work and get verified metrics
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Name */}
            <Input
              label="Project Name"
              placeholder="e.g., DeFi Dashboard"
              {...register('name')}
              error={errors.name?.message}
            />

            {/* Description */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Description
              </label>
              <textarea
                placeholder="Brief description of your project..."
                className={`
                  w-full px-4 py-3 rounded-lg h-24 resize-none
                  bg-background-elevated border border-white/10
                  text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-primary
                  transition-colors
                  ${errors.description ? 'border-red-500' : ''}
                `}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Repository URL */}
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/user/project"
              {...register('repositoryUrl')}
              error={errors.repositoryUrl?.message}
            />

            {/* Tech Stack */}
            <Input
              label="Tech Stack (comma-separated)"
              placeholder="React, TypeScript, Node.js, Solidity"
              {...register('techStack')}
              error={errors.techStack?.message}
            />

            {/* Category */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Category
              </label>
              <select
                className={`
                  w-full px-4 py-3 rounded-lg
                  bg-background-elevated border border-white/10
                  text-text-primary
                  focus:outline-none focus:border-primary
                  transition-colors
                  ${errors.category ? 'border-red-500' : ''}
                `}
                {...register('category')}
              >
                <option value="">Select a category</option>
                <option value="web">Web App</option>
                <option value="library">Library</option>
                <option value="tool">Tool</option>
                <option value="smartcontract">Smart Contract</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Live URL */}
            <Input
              label="Live Demo URL (Optional)"
              placeholder="https://demo.example.com"
              {...register('liveUrl')}
              error={errors.liveUrl?.message}
            />

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full">
              Add Project
            </Button>
          </form>
        </Card>
      </Container>
    </div>
  );
};

export { AddProjectForm };
