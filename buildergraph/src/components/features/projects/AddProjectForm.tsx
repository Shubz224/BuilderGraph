import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Container } from '../../ui/Container';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { DKGPublishingLoader } from '../../ui/DKGPublishingLoader';
import { SuccessCelebration } from '../../ui/SuccessCelebration';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
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

  // Publishing states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [projectUAL, setProjectUAL] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

    setIsPublishing(true);
    setPublishError(null);
    setProgress(10);

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
      console.log('👤 Owner UAL:', ownerUAL);

      // Call API to create project
      const createResponse = await api.createProject(projectData, ownerUAL);

      if (!createResponse.success) {
        const errorMsg = 'error' in createResponse ? createResponse.error : 'Failed to create project';
        throw new Error(errorMsg);
      }

      setProgress(30);

      console.log('✅ Project creation started:', createResponse);

      // Wait for publishing to complete with progress updates
      const finalStatus = await api.waitForProjectPublishing(
        createResponse.operationId,
        (status) => {
          console.log('📊 Status update:', status);
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      );

      if (!finalStatus.success || finalStatus.status === 'failed') {
        throw new Error(finalStatus.error || 'Publishing failed');
      }

      setProgress(100);

      console.log('🎉 Project published successfully!', finalStatus);

      // Save project UAL
      if (finalStatus.ual) {
        setProjectUAL(finalStatus.ual);
      }

      // Show success celebration
      setIsPublishing(false);
      setPublishSuccess(true);
    } catch (error) {
      console.error('❌ Project creation error:', error);
      setIsPublishing(false);
      setPublishError(error instanceof Error ? error.message : 'Failed to create project');
    }
  };

  const handleCelebrationComplete = () => {
    // Navigate to projects page
    navigate('/dashboard/projects');
  };

  const handleRetry = () => {
    setPublishError(null);
    setProgress(0);
  };

  // Show loading screen while publishing
  if (isPublishing) {
    return <DKGPublishingLoader message="Publishing your project to DKG" progress={progress} />;
  }

  // Show success celebration
  if (publishSuccess && projectUAL) {
    return (
      <SuccessCelebration
        title="Project Published!"
        message="Your project is now on the Decentralized Knowledge Graph!"
        ual={projectUAL}
        onComplete={handleCelebrationComplete}
        autoRedirectSeconds={5}
      />
    );
  }

  // Show error state
  if (publishError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Container maxWidth="md">
          <div className="bg-background-card rounded-xl p-8 border border-red-500/20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Publishing Failed</h2>
            <p className="text-text-secondary">{publishError}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard/projects')}
                className="px-6 py-3 bg-background-elevated text-text-primary rounded-xl hover:bg-background-elevated/80 transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

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

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full">
              Publish Project to DKG ✓
            </Button>
          </Card>
        </form>
      </Container>
    </div>
  );
};

export { AddProjectForm };
