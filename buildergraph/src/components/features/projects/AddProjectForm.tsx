import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '../../ui/Container';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import { publishingStore } from '../../../stores/publishingStore';
import type { ProjectFormData } from '../../../types/api.types';

const addProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  repositoryUrl: z.string().url('Invalid repository URL'),
  techStack: z.string().min(1, 'Add at least one technology'),
  category: z.string().min(1, 'Select a category'),
  liveUrl: z.string().url().optional().or(z.literal('')),
});

type AddProjectFormInputs = z.infer<typeof addProjectSchema>;

const AddProjectForm: React.FC = () => {
  const navigate = useNavigate();
  const [ownerUAL, setOwnerUAL] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddProjectFormInputs>({
    resolver: zodResolver(addProjectSchema),
  });

  // Check if user has UAL on mount
  useEffect(() => {
    const ual = userStore.getUserUAL();
    if (!ual) {
      // No profile, redirect to profile setup
      alert('Please create your developer profile first!');
      navigate('/profile-setup');
      return;
    }
    setOwnerUAL(ual);
  }, [navigate]);

  const onSubmit = async (data: AddProjectFormInputs) => {
    if (!ownerUAL) {
      alert('Owner UAL not found. Please create your profile first.');
      navigate('/profile-setup');
      return;
    }

    setSubmitError(null);

    try {
      // Prepare project data
      const projectData: ProjectFormData = {
        name: data.name,
        description: data.description,
        repositoryUrl: data.repositoryUrl,
        techStack: data.techStack.split(',').map((t) => t.trim()),
        category: data.category,
        liveUrl: data.liveUrl || undefined,
      };

      console.log('📤 Submitting project:', projectData);

      // Call API to create project
      const createResponse = await api.createProject(projectData, ownerUAL);

      if (!createResponse.success) {
        const errorMsg = 'error' in createResponse ? createResponse.error : 'Failed to create project';
        throw new Error(errorMsg);
      }

      console.log('✅ Project creation started:', createResponse);

      // Start background publishing
      publishingStore.startPublishing('project', data.name);
      publishingStore.monitorProjectPublishing(createResponse.operationId);

      // Navigate to projects page immediately
      navigate('/dashboard/projects');

    } catch (error) {
      console.error('❌ Project creation error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create project');
    }
  };

  // Don't render form if no owner UAL
  if (!ownerUAL) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="md" className="py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Add New Project
          </h1>
          <p className="text-text-secondary">
            Publish your project to the Decentralized Knowledge Graph
          </p>
          <p className="text-text-muted text-sm mt-2">
            Linked to your profile: <code className="text-accent">{ownerUAL.slice(0, 50)}...</code>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8 space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Project Name *
              </label>
              <Input
                {...register('name')}
                placeholder="e.g., DeFi Lending Protocol"
                error={errors.name?.message}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe your project..."
                rows={4}
                className="w-full px-4 py-3 bg-background-elevated border border-white/10 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 transition-colors"
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Repository URL */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Repository URL *
              </label>
              <Input
                {...register('repositoryUrl')}
                placeholder="https://github.com/username/repo"
                error={errors.repositoryUrl?.message}
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Tech Stack * <span className="text-text-muted font-normal">(comma-separated)</span>
              </label>
              <Input
                {...register('techStack')}
                placeholder="React, Node.js, Solidity, PostgreSQL"
                error={errors.techStack?.message}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Category *
              </label>
              <select
                {...register('category')}
                className="w-full px-4 py-3 bg-background-elevated border border-white/10 rounded-xl text-text-primary focus:outline-none focus:border-primary/50 transition-colors"
              >
                <option value="">Select category</option>
                <option value="web">Web Application</option>
                <option value="mobile">Mobile Application</option>
                <option value="smartcontract">Smart Contract</option>
                <option value="library">Library/Package</option>
                <option value="tool">Developer Tool</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Live URL */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Live URL <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <Input
                {...register('liveUrl')}
                placeholder="https://myproject.com"
                error={errors.liveUrl?.message}
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Starting Publishing...' : 'Publish Project to DKG ✓'}
            </Button>
          </Card>
        </form>
      </Container>
    </div>
  );
};

export { AddProjectForm };
