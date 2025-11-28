# BuilderGraph Backend API Documentation

## Overview
Professional REST API for BuilderGraph with OriginTrail DKG integration. Supports async Knowledge Asset publishing with status tracking.

## Base URL
```
http://localhost:3002/api
```

## Profiles API

### POST /api/profiles
Create a new developer profile and publish to DKG.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "location": "San Francisco, CA",
  "bio": "Full stack developer passionate about Web3",
  "skills": ["React", "Node.js", "Solidity"],
  "experience": 5,
  "languages": ["JavaScript", "TypeScript", "Solidity"],
  "specializations": ["Web3", "Frontend", "Smart Contracts"],
  "githubUsername": "johndoe",
  "githubRepos": ["dapp-starter", "nft-marketplace"]
}
```

**Response (Immediate):**
```json
{
  "success": true,
  "message": "Profile created, DKG publishing in progress",
  "profileId": 1,
  "operationId": "profile-1732712345000-johndoe",
  "status": "publishing"
}
```

### GET /api/profiles/status/:operationId
Check profile DKG publishing status.

**Response (Publishing):**
```json
{
  "success": true,
  "status": "publishing",
  "message": "DKG asset publishing in progress",
  "profileId": 1
}
```

**Response (Completed):**
```json
{
  "success": true,
  "status": "completed",
  "ual": "did:dkg:otp:20430/0xabc.../12345",
  "datasetRoot": "0x123...",
  "profile": {
    "id": 1,
    "username": "johndoe",
    "fullName": "John Doe",
    "email": "john@example.com",
    "ual": "did:dkg:otp:20430/0xabc.../12345"
  }
}
```

### GET /api/profiles/:identifier
Get profile by ID or UAL.

**Parameters:**
- `identifier`: Database ID (number) or UAL (string)

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "full_name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "location": "San Francisco, CA",
    "bio": "Full stack developer...",
    "skills": ["React", "Node.js", "Solidity"],
    "experience": 5,
    "languages": ["JavaScript", "TypeScript"],
    "specializations": ["Web3", "Frontend"],
    "github_username": "johndoe",
    "github_repos": ["dapp-starter", "nft-marketplace"],
    "ual": "did:dkg:otp:20430/0xabc.../12345",
    "dataset_root": "0x123...",
    "publish_status": "completed",
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=...",
    "created_at": "2025-11-27T12:00:00.000Z"
  }
}
```

### GET /api/profiles
Get all profiles.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "profiles": [...]
}
```

---

## Projects API

### POST /api/projects
Create a new project and publish to DKG with owner linking.

**Request Body:**
```json
{
  "ownerUAL": "did:dkg:otp:20430/0xabc.../12345",
  "name": "DeFi Dashboard",
  "description": "A comprehensive dashboard for DeFi protocols",
  "repositoryUrl": "https://github.com/johndoe/defi-dashboard",
  "techStack": ["React", "Solidity", "Hardhat", "Graph Protocol"],
  "category": "web",
  "liveUrl": "https://defi-dashboard.example.com"
}
```

**Response (Immediate):**
```json
{
  "success": true,
  "message": "Project created, DKG publishing in progress",
  "projectId": 1,
  "operationId": "project-1732712345000-defi-dashboard",
  "status": "publishing",
  "ownerUAL": "did:dkg:otp:20430/0xabc.../12345"
}
```

### GET /api/projects/status/:operationId
Check project DKG publishing status.

**Response format:** Same as profiles status endpoint.

### GET /api/projects/owner/:ownerUAL
Get all projects by owner UAL.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "owner": {
    "username": "johndoe",
    "fullName": "John Doe",
    "ual": "did:dkg:otp:20430/0xabc.../12345"
  },
  "projects": [
    {
      "id": 1,
      "owner_ual": "did:dkg:otp:20430/0xabc.../12345",
      "name": "DeFi Dashboard",
      "description": "...",
      "repository_url": "https://github.com/...",
      "tech_stack": ["React", "Solidity"],
      "category": "web",
      "live_url": "https://...",
      "ual": "did:dkg:otp:20430/0xdef.../67890",
      "publish_status": "completed",
      "explorerUrl": "https://dkg.origintrail.io/explore?ual=...",
      "created_at": "2025-11-27T12:00:00.000Z"
    }
  ]
}
```

### GET /api/projects/:identifier
Get project by ID or UAL.

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "owner_ual": "did:dkg:otp:20430/0xabc.../12345",
    "name": "DeFi Dashboard",
    "description": "...",
    "repository_url": "https://github.com/...",
    "tech_stack": ["React", "Solidity", "Hardhat"],
    "category": "web",
    "live_url": "https://...",
    "ual": "did:dkg:otp:20430/0xdef.../67890",
    "dataset_root": "0x456...",
    "publish_status": "completed",
    "owner": {
      "username": "johndoe",
      "fullName": "John Doe",
      "ual": "did:dkg:otp:20430/0xabc.../12345"
    },
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=...",
    "created_at": "2025-11-27T12:00:00.000Z"
  }
}
```

### GET /api/projects
Get all projects.

**Response:**
```json
{
  "success": true",
  "count": 15,
  "projects": [...]
}
```

---

## Frontend Integration Guide

### Profile Creation Flow

```javascript
// 1. Submit profile form
const response = await fetch('/api/profiles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(profileData)
});

const { profileId, operationId } = await response.json();

// 2. Show loading state and poll for status
const pollStatus = async () => {
  const statusRes = await fetch(`/api/profiles/status/${operationId}`);
  const status = await statusRes.json();
  
  if (status.status === 'completed') {
    // Success! Redirect to dashboard with UAL
    window.location.href = `/dashboard?ual=${status.ual}`;
  } else if (status.status === 'failed') {
    // Show error
    showError('Publishing failed');
  } else {
    // Still publishing, poll again in 5 seconds
    setTimeout(pollStatus, 5000);
  }
};

pollStatus();
```

### Project Creation Flow

```javascript
// 1. Get owner UAL from logged-in user
const ownerUAL = getCurrentUserUAL();

// 2. Submit project form
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...projectData,
    ownerUAL
  })
});

const { projectId, operationId } = await response.json();

// 3. Poll for status (same pattern as profiles)
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Or for validation errors:

```json
{
  "success": false,
  "errors": [
    "Full name is required (min 2 characters)",
    "Valid email is required"
  ]
}
```

---

## Publish Status States

- `publishing` - DKG asset is being published (30-60 seconds)
- `completed` - Successfully published, UAL available
- `failed` - Publishing failed

---

## Notes

- Profile creation requires all fields in the request body
- Project creation requires a valid `ownerUAL` from an existing profile
- Publishing typically takes 30-60 seconds
- Poll status endpoint every 5 seconds while `status === 'publishing'`
- UALs are globally unique identifiers on the DKG
- All assets are verifiable on DKG Explorer

