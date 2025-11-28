import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import { DKGPublishingLoader } from '../../ui/DKGPublishingLoader';
import { SuccessCelebration } from '../../ui/SuccessCelebration';
import type { GitHubRepository } from '../../../types/api.types';

interface GitHubRepoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GitHubRepoImportModal: React.FC<GitHubRepoImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectUAL, setProjectUAL] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [availableRepos, setAvailableRepos] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [hasFetchedRepos, setHasFetchedRepos] = useState(false);

  const loadRepositories = useCallback(async () => {
    const ownerUAL = userStore.getUserUAL();

    if (!ownerUAL) {
      setReposError('Please log in to view your repositories.');
      setAvailableRepos([]);
      setHasFetchedRepos(true);
      return;
    }

    setIsLoadingRepos(true);
    setReposError(null);

    try {
      const response = await api.getGitHubRepositories(ownerUAL);
      if (response.success) {
        setAvailableRepos(response.repositories);
      } else {
        setAvailableRepos([]);
        const errorMessage = 'error' in response ? response.error : 'Failed to load repositories from GitHub';
        setReposError(errorMessage);
      }
    } catch (repoError) {
      console.error('Failed to load repositories:', repoError);
      setAvailableRepos([]);
      setReposError('Failed to load repositories from GitHub');
    } finally {
      setIsLoadingRepos(false);
      setHasFetchedRepos(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadRepositories();
    }
  }, [isOpen, loadRepositories]);

  const handleSelectRepository = (repoId: string) => {
    setSelectedRepoId(repoId);
    if (!repoId) {
      setRepoUrl('');
      return;
    }

    const chosenRepo = availableRepos.find((repo) => repo.id.toString() === repoId);
    if (chosenRepo) {
      setRepoUrl(chosenRepo.htmlUrl);
      setError(null);
    }
  };

  const handleManualRepoUrlChange = (value: string) => {
    setSelectedRepoId('');
    setRepoUrl(value);
  };

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const ownerUAL = userStore.getUserUAL();
    if (!ownerUAL) {
      setError('Please log in to import projects');
      return;
    }

    setIsImporting(true);
    setError(null);
    setProgress(10);

    try {
      // Call import API
      console.log('📦 Importing repository:', repoUrl);
      const importResponse = await api.importGitHubProject({
        repoUrl: repoUrl.trim(),
        ownerUAL: ownerUAL,
      });

      if (!importResponse.success) {
        const errorMsg = 'error' in importResponse ? importResponse.error : 'Failed to import repository';
        throw new Error(errorMsg);
      }

      setProgress(30);
      setIsImporting(false);
      setIsPublishing(true);

      console.log('✅ Import started:', importResponse);

      // Wait for publishing to complete with progress updates
      const finalStatus = await api.waitForProjectPublishing(
        importResponse.operationId,
        (status) => {
          console.log('📊 Status update:', status);
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      );

      if (!finalStatus.success || finalStatus.status === 'failed') {
        throw new Error(finalStatus.error || 'Publishing failed');
      }

      setProgress(100);

      console.log('🎉 Project imported and published successfully!', finalStatus);

      // Save project UAL
      if (finalStatus.ual) {
        setProjectUAL(finalStatus.ual);
      }

      // Show success celebration
      setIsPublishing(false);
      setPublishSuccess(true);
    } catch (err) {
      console.error('❌ Import error:', err);
      setIsImporting(false);
      setIsPublishing(false);
      setError(err instanceof Error ? err.message : 'Failed to import repository');
    }
  };

  const handleCelebrationComplete = () => {
    setPublishSuccess(false);
    setRepoUrl('');
    setProgress(0);
    setSelectedRepoId('');
    setAvailableRepos([]);
    setHasFetchedRepos(false);
    setReposError(null);
    onClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleClose = () => {
    if (!isImporting && !isPublishing) {
      setRepoUrl('');
      setError(null);
      setSelectedRepoId('');
      setAvailableRepos([]);
      setHasFetchedRepos(false);
      setReposError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Show publishing loader
  if (isPublishing) {
    return <DKGPublishingLoader message="Publishing imported project to DKG" progress={progress} />;
  }

  // Show success celebration
  if (publishSuccess && projectUAL) {
    return (
      <SuccessCelebration
        title="Project Imported!"
        message="Your GitHub project has been imported and published to the DKG!"
        ual={projectUAL}
        onComplete={handleCelebrationComplete}
        autoRedirectSeconds={5}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background-card rounded-2xl border border-white/10 max-w-lg w-full p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Import from GitHub
            </h2>
            <p className="text-text-secondary text-sm">
              Import a repository and publish it to the DKG
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-primary transition-colors"
            disabled={isImporting}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Repository Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-text-primary font-medium">
                Choose a repository
              </label>
              <button
                onClick={loadRepositories}
                className="text-sm text-primary hover:text-primary/80 disabled:text-text-muted"
                disabled={isLoadingRepos || isImporting}
                type="button"
              >
                {isLoadingRepos ? 'Refreshing...' : 'Refresh list'}
              </button>
            </div>
            <div className="space-y-2">
              <select
                className="w-full rounded-xl border border-white/10 bg-background-elevated px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
                value={selectedRepoId}
                onChange={(e) => handleSelectRepository(e.target.value)}
                disabled={isImporting || isLoadingRepos || availableRepos.length === 0}
              >
                <option value="">
                  {isLoadingRepos
                    ? 'Loading your repositories...'
                    : availableRepos.length > 0
                      ? 'Select a repository'
                      : 'No repositories available yet'}
                </option>
                {availableRepos.map((repo) => (
                  <option key={repo.id} value={repo.id.toString()}>
                    {repo.private ? '🔒 ' : ''}
                    {repo.owner.login}/{repo.name}
                  </option>
                ))}
              </select>
              {reposError && (
                <p className="text-red-400 text-xs">
                  {reposError}
                </p>
              )}
              {!reposError && !isLoadingRepos && hasFetchedRepos && availableRepos.length === 0 && (
                <p className="text-text-muted text-xs">
                  We could not find repositories for your GitHub account. Make sure you granted BuilderGraph access,
                  especially for private repos.
                </p>
              )}
              <p className="text-text-muted text-xs">
                Private repositories are included (🔒) when you grant the <code>repo</code> scope during GitHub login.
              </p>
            </div>
          </div>

          {/* Repository URL Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-text-primary font-medium">
                Repository URL *
              </label>
              <span className="text-text-muted text-xs">Auto-filled from selection or paste manually</span>
            </div>
            <Input
              value={repoUrl}
              onChange={(e) => handleManualRepoUrlChange(e.target.value)}
              placeholder="https://github.com/username/repository"
              disabled={isImporting}
            />
            <p className="text-text-muted text-xs mt-2">
              Paste any GitHub repository URL. Selecting from the dropdown above will fill this automatically.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm">
                <p className="text-primary font-medium mb-1">Auto-extracted data</p>
                <p className="text-primary/80">
                  We'll automatically extract the project name, description, tech stack, and other details from your repository.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-background-elevated text-text-primary rounded-xl hover:bg-background-elevated/80 transition-colors font-medium"
              disabled={isImporting}
            >
              Cancel
            </button>
            <Button
              onClick={handleImport}
              disabled={isImporting || !repoUrl.trim()}
              className="flex-1"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                '🚀 Import & Publish'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GitHubRepoImportModal };

