# BuilderGraph DKG Backend

Backend service for BuilderGraph that integrates with the OriginTrail Decentralized Knowledge Graph (DKG). This service converts profile and project form data to JSON-LD format and publishes them as Knowledge Assets to the DKG network.

## Features

- ✅ **Profile Management**: Create developer profiles and publish to DKG
- ✅ **Project Management**: Create projects linked to user profiles via UAL
- ✅ **DKG Integration**: Automatic asset publishing to local DKG node
- ✅ **Database Storage**: SQLite database for profiles and projects with UALs
- ✅ **JSON-LD Conversion**: Schema.org compliant data formatting

## Architecture

```
Frontend (React) → Backend API (Express) → DKG Node (port 9200) → Blockchain
                         ↓
                    Database (SQLite)
```

## Prerequisites

- Node.js 18+ 
- DKG Node running on port 9200
- npm or pnpm

## Installation

1. **Install dependencies**:
```bash
cd buildergraph-backend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Initialize database** (optional, auto-created on first run):
```bash
npm run setup-db
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3002` by default.

## API Endpoints

### Health Check
```bash
GET /health
```

### Profiles

#### Create Profile
```bash
POST /api/profiles
Content-Type: application/json

{
  "fullName": "Alex Johnson",
  "username": "alex_dev",
  "email": "alex@example.com",
  "location": "San Francisco, CA",
  "bio": "Full-stack developer passionate about Web3",
  "skills": ["React", "TypeScript", "Solidity", "Node.js"],
  "githubUsername": "alex_dev"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "id": 1,
    "username": "alex_dev",
    "fullName": "Alex Johnson",
    "ual": "did:dkg:otp:20430/0x.../12345",
    "dkgAssetId": 123,
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=..."
  }
}
```

#### Get Profile by ID
```bash
GET /api/profiles/:id
```

#### Get Profile by UAL
```bash
GET /api/profiles/ual/:ual
```

#### List All Profiles
```bash
GET /api/profiles
```

### Projects

#### Create Project
```bash
POST /api/projects
Content-Type: application/json

{
  "userUal": "did:dkg:otp:20430/0x.../12345",
  "name": "DeFi Dashboard",
  "description": "A comprehensive dashboard for DeFi protocols",
  "repositoryUrl": "https://github.com/alex_dev/defi-dashboard",
  "techStack": "React,TypeScript,Node.js,Solidity",
  "category": "web",
  "liveUrl": "https://defi-dashboard.example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "name": "DeFi Dashboard",
    "userUal": "did:dkg:otp:20430/0x.../12345",
    "ual": "did:dkg:otp:20430/0x.../67890",
    "dkgAssetId": 124,
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=..."
  }
}
```

#### Get Project by ID
```bash
GET /api/projects/:id
```

#### Get Projects by User UAL
```bash
GET /api/projects/user/:userUal
```

#### List All Projects
```bash
GET /api/projects
```

## Database Schema

### Profiles Table
- `id` - Primary key
- `full_name` - User's full name
- `username` - Unique username
- `email` - Email address
- `location` - Location string
- `bio` - Biography
- `skills` - JSON array of skills
- `github_username` - GitHub username
- `github_repos` - JSON array of repos
- `ual` - DKG Universal Asset Locator
- `dkg_asset_id` - DKG asset ID
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### Projects Table
- `id` - Primary key
- `user_ual` - Foreign key to profile UAL
- `name` - Project name
- `description` - Project description
- `repository_url` - GitHub repository URL
- `tech_stack` - JSON array of technologies
- `category` - Project category
- `live_url` - Live demo URL
- `ual` - DKG Universal Asset Locator
- `dkg_asset_id` - DKG asset ID
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## JSON-LD Format

### Profile (Schema.org Person)
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alex Johnson",
  "alternateName": "alex_dev",
  "email": "alex@example.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "San Francisco, CA"
  },
  "description": "Full-stack developer...",
  "knowsAbout": ["React", "TypeScript", "Solidity"],
  "sameAs": "https://github.com/alex_dev"
}
```

### Project (Schema.org SoftwareSourceCode)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "DeFi Dashboard",
  "description": "A dashboard for DeFi protocols",
  "codeRepository": "https://github.com/user/project",
  "programmingLanguage": ["React", "TypeScript", "Node.js"],
  "applicationCategory": "web",
  "url": "https://demo.example.com",
  "creator": {
    "@id": "did:dkg:otp:20430/0x.../12345"
  }
}
```

## Environment Variables

```env
PORT=3002                                    # Server port
NODE_ENV=development                         # Environment
DATABASE_PATH=./database/buildergraph.db     # SQLite database path
DKG_API_URL=http://localhost:9200           # DKG node API URL
DKG_BLOCKCHAIN=otp:20430                    # DKG blockchain identifier
DKG_EXPLORER_BASE=https://dkg.origintrail.io # DKG explorer base URL
FRONTEND_URL=http://localhost:5173          # Frontend URL for CORS
```

## Testing

### Using cURL

**Create a profile**:
```bash
curl -X POST http://localhost:3002/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "location": "San Francisco",
    "bio": "Test bio",
    "skills": ["React", "Node.js"],
    "githubUsername": "testuser"
  }'
```

**Create a project**:
```bash
curl -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userUal": "did:dkg:otp:20430/0x.../12345",
    "name": "Test Project",
    "description": "A test project",
    "repositoryUrl": "https://github.com/test/project",
    "techStack": "React,Node.js",
    "category": "web"
  }'
```

## Frontend Integration

Update your frontend forms to call these endpoints:

```typescript
// Profile submission
const handleProfileSubmit = async (profileData) => {
  const response = await fetch('http://localhost:3002/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  
  const result = await response.json();
  if (result.success) {
    // Save UAL to local storage or state
    localStorage.setItem('userUal', result.profile.ual);
    // Redirect to dashboard
    navigate('/dashboard');
  }
};

// Project submission
const handleProjectSubmit = async (projectData) => {
  const userUal = localStorage.getItem('userUal');
  
  const response = await fetch('http://localhost:3002/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...projectData,
      userUal
    })
  });
  
  const result = await response.json();
  if (result.success) {
    // Handle success
    navigate('/dashboard/projects');
  }
};
```

## Troubleshooting

### DKG Node Connection Error
- Ensure DKG node is running on port 9200
- Check `DKG_API_URL` in `.env`

### Database Errors
- Run `npm run setup-db` to reinitialize
- Check file permissions for database directory

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL

## License

MIT
