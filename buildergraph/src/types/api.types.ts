/**
 * API Types for BuilderGraph
 */

// Profile Data
export interface ProfileFormData {
    fullName: string;
    username: string;
    email: string;
    location: string;
    bio?: string;
    skills: string[];
    experience: number;
    languages: string[];
    specializations: string[];
    githubUsername?: string;
    githubRepos?: string[];
}

export interface CreateProfileResponse {
    success: boolean;
    message: string;
    profileId: number;
    operationId: string;
    status: 'publishing';
}

export interface ProfileStatusResponse {
    success: boolean;
    status: 'publishing' | 'completed' | 'failed';
    ual?: string;
    datasetRoot?: string;
    profile?: {
        id: number;
        username: string;
        fullName: string;
        email: string;
        ual: string;
    };
    error?: string;
    message?: string;
    profileId?: number;
}

export interface Profile {
    id: number;
    full_name: string;
    username: string;
    email: string;
    location: string;
    bio?: string;
    skills: string[];
    experience: number;
    languages: string[];
    specializations: string[];
    github_username?: string;
    github_repos: string[];
    ual: string;
    dataset_root: string;
    publish_status: string;
    created_at: string;
    explorerUrl: string;
    reputation_score?: number; // Calculated reputation score
    avatar_url?: string;
}

// Project Data
export interface ProjectFormData {
    name: string;
    description: string;
    repositoryUrl: string;
    techStack: string[];
    category: string;
    liveUrl?: string;
}

export interface CreateProjectResponse {
    success: boolean;
    message: string;
    projectId: number;
    operationId: string;
    status: 'publishing';
    ownerUAL: string;
}

export interface ProjectStatusResponse {
    success: boolean;
    status: 'publishing' | 'completed' | 'failed';
    ual?: string;
    datasetRoot?: string;
    project?: {
        id: number;
        name: string;
        description: string;
        ownerUAL: string;
        ual: string;
    };
    error?: string;
    message?: string;
    projectId?: number;
}

export interface Project {
    id: number;
    owner_ual: string;
    name: string;
    description: string;
    repository_url: string;
    tech_stack: string[];
    category: string;
    live_url?: string;
    ual: string;
    dataset_root: string;
    publish_status: string;
    created_at: string;
    explorerUrl: string;
}

export interface ProjectsByOwnerResponse {
    success: boolean;
    count: number;
    owner: {
        username: string;
        fullName: string;
        ual: string;
    };
    projects: Project[];
}

// Endorsement Data
export interface Endorsement {
    id: number;
    endorser_ual: string;
    endorser_username: string;
    endorser_name: string;
    target_type: 'skill' | 'project';
    target_id: string;
    target_username?: string;
    skill_name?: string;
    project_id?: number;
    rating: number;
    message: string;
    trac_staked: number;
    ual?: string;
    dataset_root?: string;
    publish_status: string;
    created_at: string;
    withdrawn_at?: string;
}

export interface CreateEndorsementData {
    endorserUAL: string;
    endorserUsername: string;
    endorserName: string;
    targetType: 'skill' | 'project';
    targetId: string;
    targetUsername?: string;
    skillName?: string;
    projectId?: number;
    rating: number;
    message: string;
    tracStaked: number;
}

export interface CreateEndorsementResponse {
    success: boolean;
    message: string;
    endorsementId: number;
    operationId: string;
    status: 'publishing';
}

export interface EndorsementStatusResponse {
    success: boolean;
    status: 'publishing' | 'completed' | 'failed';
    endorsementId: number;
    ual?: string;
    datasetRoot?: string;
    endorsement?: {
        id: number;
        endorser: string;
        targetType: string;
        skillName?: string;
        rating: number;
        tracStaked: number;
        ual: string;
    };
    error?: string;
}

export interface EndorsementsResponse {
    success: boolean;
    count: number;
    endorsements: Endorsement[];
    stats: {
        totalEndorsements: number;
        totalTracStaked: number;
        averageRating: number;
        uniqueSkillsEndorsed?: number;
    };
    topSkills?: Array<{
        skill_name: string;
        endorsement_count: number;
        total_trac: number;
        average_rating: number;
    }>;
}

export interface GivenEndorsementsResponse {
    success: boolean;
    count: number;
    activeCount: number;
    totalStaked: number;
    endorsements: Endorsement[];
}

export interface AuthStatusResponse {
    authenticated: boolean;
    user?: Profile | null;
}

export interface AuthUserResponse {
    success: boolean;
    authenticated: boolean;
    user?: Profile;
    error?: string;
}

export interface LogoutResponse {
    success: boolean;
    message?: string;
    error?: string;
}

// Error Response
export interface ApiError {
    success: false;
    error: string;
    errors?: string[];
}
