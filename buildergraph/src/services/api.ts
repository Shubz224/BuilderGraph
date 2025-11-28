/**
 * API Service for BuilderGraph Backend
 * Handles all communication with the DKG-integrated backend
 */

import type {
    ProfileFormData,
    CreateProfileResponse,
    ProfileStatusResponse,
    Profile,
    ProjectFormData,
    CreateProjectResponse,
    ProjectStatusResponse,
    Project,
    ProjectsByOwnerResponse,
    ImportGitHubProjectData,
    ImportGitHubProjectResponse,
    GitHubRepositoriesResponse,
    CreateEndorsementData,
    CreateEndorsementResponse,
    EndorsementStatusResponse,
    EndorsementsResponse,
    GivenEndorsementsResponse,
    AuthStatusResponse,
    AuthUserResponse,
    LogoutResponse,
    ApiError,
} from '../types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

class ApiService {
    /**
     * Create a new profile
     */
    async createProfile(data: ProfileFormData): Promise<CreateProfileResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/profiles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as CreateProfileResponse;
        } catch (error) {
            console.error('Create profile error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create profile',
            };
        }
    }

    /**
     * Poll profile publishing status
     */
    async pollProfileStatus(operationId: string): Promise<ProfileStatusResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/status/${operationId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as ProfileStatusResponse;
        } catch (error) {
            console.error('Poll profile status error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profile status',
            };
        }
    }

    /**
     * Get profile by UAL or ID
     */
    async getProfile(identifier: string): Promise<{ success: true; profile: Profile } | ApiError> {
        try {
            const encodedId = encodeURIComponent(identifier);
            const response = await fetch(`${API_BASE_URL}/profiles/${encodedId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get profile error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profile',
            };
        }
    }

    /**
     * Get all profiles
     */
    async getAllProfiles(): Promise<{ success: true; profiles: Profile[]; count: number } | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/profiles`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get all profiles error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profiles',
            };
        }
    }

    /**
     * Get profile by username
     */
    async getProfileByUsername(username: string): Promise<{ success: boolean; profile?: Profile; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/profiles/username/${username}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get profile by username error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get profile',
            };
        }
    }

    /**
     * Create a new project
     */
    async createProject(
        data: ProjectFormData,
        ownerUAL: string
    ): Promise<CreateProjectResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    ownerUAL,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as CreateProjectResponse;
        } catch (error) {
            console.error('Create project error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create project',
            };
        }
    }

    /**
     * Poll project publishing status
     */
    async pollProjectStatus(operationId: string): Promise<ProjectStatusResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/status/${operationId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as ProjectStatusResponse;
        } catch (error) {
            console.error('Poll project status error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get project status',
            };
        }
    }

    /**
     * Get projects by owner UAL
     */
    async getProjectsByOwner(ownerUAL: string): Promise<ProjectsByOwnerResponse | ApiError> {
        try {
            const encodedUAL = encodeURIComponent(ownerUAL);
            const response = await fetch(`${API_BASE_URL}/projects/owner/${encodedUAL}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as ProjectsByOwnerResponse;
        } catch (error) {
            console.error('Get projects by owner error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get projects',
            };
        }
    }

    /**
     * Get project by UAL or ID
     */
    async getProject(identifier: string): Promise<{ success: true; project: Project } | ApiError> {
        try {
            const encodedId = encodeURIComponent(identifier);
            const response = await fetch(`${API_BASE_URL}/projects/${encodedId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get project error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get project',
            };
        }
    }

    /**
     * Import a project from GitHub
     */
    async importGitHubProject(
        data: ImportGitHubProjectData
    ): Promise<ImportGitHubProjectResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/projects/import/github`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as ImportGitHubProjectResponse;
        } catch (error) {
            console.error('Import GitHub project error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to import GitHub project',
            };
        }
    }

    /**
     * Get GitHub repositories for the authenticated user
     */
    async getGitHubRepositories(ownerUAL: string): Promise<GitHubRepositoriesResponse | ApiError> {
        try {
            const encodedUAL = encodeURIComponent(ownerUAL);
            const response = await fetch(`${API_BASE_URL}/projects/import/github/repos?ownerUAL=${encodedUAL}`, {
                credentials: 'include',
            });
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as GitHubRepositoriesResponse;
        } catch (error) {
            console.error('Get GitHub repositories error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch GitHub repositories',
            };
        }
    }

    /**
     * Helper: Wait for profile publishing to complete
     * Polls every 3 seconds until completed or failed
     */
    async waitForProfilePublishing(
        operationId: string,
        onProgress?: (status: ProfileStatusResponse) => void,
        maxAttempts: number = 100 // 5 minutes max (100 * 3s)
    ): Promise<ProfileStatusResponse> {
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            const status = await this.pollProfileStatus(operationId);

            if (!status.success) {
                return status as ProfileStatusResponse;
            }

            if (onProgress) {
                onProgress(status as ProfileStatusResponse);
            }

            const statusResponse = status as ProfileStatusResponse;

            if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
                return statusResponse;
            }

            // Wait 3 seconds before next poll
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return {
            success: false,
            status: 'failed',
            error: 'Publishing timed out after 5 minutes',
        };
    }

    /**
     * Helper: Wait for project publishing to complete
     */
    async waitForProjectPublishing(
        operationId: string,
        onProgress?: (status: ProjectStatusResponse) => void,
        maxAttempts: number = 100
    ): Promise<ProjectStatusResponse> {
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            const status = await this.pollProjectStatus(operationId);

            if (!status.success) {
                return status as ProjectStatusResponse;
            }

            if (onProgress) {
                onProgress(status as ProjectStatusResponse);
            }

            const statusResponse = status as ProjectStatusResponse;

            if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
                return statusResponse;
            }

            // Wait 3 seconds before next poll
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return {
            success: false,
            status: 'failed',
            error: 'Publishing timed out after 5 minutes',
        };
    }

    /**
     * Create a new endorsement
     */
    async createEndorsement(
        data: CreateEndorsementData
    ): Promise<CreateEndorsementResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/endorsements`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as CreateEndorsementResponse;
        } catch (error) {
            console.error('Create endorsement error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create endorsement',
            };
        }
    }

    /**
     * Poll endorsement publishing status
     */
    async pollEndorsementStatus(operationId: string): Promise<EndorsementStatusResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/endorsements/status/${operationId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as EndorsementStatusResponse;
        } catch (error) {
            console.error('Poll endorsement status error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get endorsement status',
            };
        }
    }

    /**
     * Helper: Wait for endorsement publishing to complete
     */
    async waitForEndorsementPublishing(
        operationId: string,
        onProgress?: (status: EndorsementStatusResponse) => void,
        maxAttempts: number = 100
    ): Promise<EndorsementStatusResponse> {
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            const status = await this.pollEndorsementStatus(operationId);

            if (!status.success) {
                return status as EndorsementStatusResponse;
            }

            if (onProgress) {
                onProgress(status as EndorsementStatusResponse);
            }

            const statusResponse = status as EndorsementStatusResponse;

            if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
                return statusResponse;
            }

            // Wait 3 seconds before next poll
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        return {
            success: false,
            status: 'failed',
            endorsementId: 0,
            error: 'Publishing timed out after 5 minutes',
        };
    }

    /**
     * Get endorsements for a user (skill endorsements)
     */
    async getEndorsementsByUser(ual: string): Promise<EndorsementsResponse | ApiError> {
        try {
            const encodedUAL = encodeURIComponent(ual);
            const response = await fetch(`${API_BASE_URL}/endorsements/user/${encodedUAL}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get user endorsements error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get endorsements',
            };
        }
    }

    /**
     * Get endorsements for a project
     */
    async getEndorsementsByProject(projectId: number): Promise<EndorsementsResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/endorsements/project/${projectId}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get project endorsements error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get endorsements',
            };
        }
    }

    /**
     * Get endorsements given by a user
     */
    async getGivenEndorsements(ual: string): Promise<GivenEndorsementsResponse | ApiError> {
        try {
            const encodedUAL = encodeURIComponent(ual);
            const response = await fetch(`${API_BASE_URL}/endorsements/given/${encodedUAL}`);
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Get given endorsements error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get given endorsements',
            };
        }
    }

    /**
     * Withdraw TRAC stake from an endorsement
     */
    async withdrawEndorsement(endorsementId: number, endorserUal: string): Promise<{ success: boolean; message?: string; error?: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/endorsements/${endorsementId}/withdraw`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ endorserUal }),
            });

            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result;
        } catch (error) {
            console.error('Withdraw endorsement error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to withdraw endorsement',
            };
        }
    }

    /**
     * GitHub OAuth - Initiate login
     * Redirects to GitHub OAuth page
     */
    loginWithGitHub(): void {
        window.location.href = `${API_BASE_URL}/auth/github`;
    }

    /**
     * Get current authenticated user
     */
    async getCurrentUser(): Promise<AuthUserResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/user`, {
                credentials: 'include', // Important for session cookies
            });
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as AuthUserResponse;
        } catch (error) {
            console.error('Get current user error:', error);
            return {
                success: false,
                authenticated: false,
                error: error instanceof Error ? error.message : 'Failed to get current user',
            };
        }
    }

    /**
     * Logout current user
     */
    async logout(): Promise<LogoutResponse | ApiError> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                credentials: 'include',
            });
            const result = await response.json();

            if (!response.ok) {
                return result as ApiError;
            }

            return result as LogoutResponse;
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to logout',
            };
        }
    }

    /**
     * Check authentication status
     */
    async checkAuthStatus(): Promise<AuthStatusResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/status`, {
                credentials: 'include',
            });
            const result = await response.json();

            return result as AuthStatusResponse;
        } catch (error) {
            console.error('Check auth status error:', error);
            return {
                authenticated: false,
                user: null,
            };
        }
    }
}

export const api = new ApiService();
export default api;
