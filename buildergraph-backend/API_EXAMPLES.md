# BuilderGraph Backend - API Examples

## Profile Creation Examples

### Example 1: Basic Profile
```bash
curl -X POST http://localhost:3002/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Sarah Chen",
    "username": "sarah_dev",
    "email": "sarah@example.com",
    "location": "New York, NY",
    "bio": "Blockchain developer specializing in smart contracts",
    "skills": ["Solidity", "Rust", "Web3.js", "React"],
    "githubUsername": "sarahchen"
  }'
```

### Example 2: Minimal Profile
```bash

```

### Example 3: Full Profile with GitHub
```bash
curl -X POST http://localhost:3002/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Maria Garcia",
    "username": "maria_codes",
    "email": "maria@example.com",
    "location": "Barcelona, Spain",
    "bio": "Full-stack developer with 5 years experience in Web3",
    "skills": ["TypeScript", "React", "Node.js", "Solidity", "Python"],
    "githubUsername": "mariagarcia"
  }'
```

## Project Creation Examples

### Example 1: Web Application
```bash
curl -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userUal": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322",
    "name": "NFT Marketplace",
    "description": "A decentralized marketplace for trading NFTs with low fees",
    "repositoryUrl": "https://github.com/sarah_dev/nft-marketplace",
    "techStack": "React,TypeScript,Solidity,Hardhat,IPFS",
    "category": "web",
    "liveUrl": "https://nft-marketplace.example.com"
  }'
```

### Example 2: Smart Contract Library
```bash
curl -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userUal": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322",
    "name": "DeFi Utils",
    "description": "A collection of reusable smart contract utilities for DeFi protocols",
    "repositoryUrl": "https://github.com/sarah_dev/defi-utils",
    "techStack": "Solidity,Foundry,OpenZeppelin",
    "category": "library"
  }'
```

### Example 3: Developer Tool
```bash
curl -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userUal": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322",
    "name": "Web3 CLI",
    "description": "Command-line tool for interacting with Web3 protocols",
    "repositoryUrl": "https://github.com/maria_codes/web3-cli",
    "techStack": "Node.js,TypeScript,Commander.js,Ethers.js",
    "category": "tool",
    "liveUrl": "https://www.npmjs.com/package/web3-cli"
  }'
```

## Retrieval Examples

### Get Profile by ID
```bash
curl http://localhost:3002/api/profiles/1
```

### Get Profile by UAL
```bash
curl "http://localhost:3002/api/profiles/ual/did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322"
```

### List All Profiles
```bash
curl http://localhost:3002/api/profiles
```

### Get Project by ID
```bash
curl http://localhost:3002/api/projects/1
```

### Get All Projects for a User
```bash
curl "http://localhost:3002/api/projects/user/did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322"
```

### List All Projects
```bash
curl http://localhost:3002/api/projects
```

## JavaScript/Fetch Examples

### Create Profile (Frontend)
```javascript
async function createProfile(profileData) {
  try {
    const response = await fetch('http://localhost:3002/api/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Profile created!');
      console.log('UAL:', result.profile.ual);
      console.log('Explorer:', result.profile.explorerUrl);
      
      // Save UAL for future use
      localStorage.setItem('userUal', result.profile.ual);
      
      return result.profile;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
const profile = await createProfile({
  fullName: "Alex Johnson",
  username: "alex_dev",
  email: "alex@example.com",
  location: "San Francisco, CA",
  bio: "Full-stack developer",
  skills: ["React", "Node.js", "Solidity"],
  githubUsername: "alex_dev"
});
```

### Create Project (Frontend)
```javascript
async function createProject(projectData) {
  try {
    // Get user UAL from storage
    const userUal = localStorage.getItem('userUal');
    
    if (!userUal) {
      alert('Please create a profile first!');
      return;
    }

    const response = await fetch('http://localhost:3002/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...projectData,
        userUal
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Project created!');
      console.log('UAL:', result.project.ual);
      console.log('Explorer:', result.project.explorerUrl);
      
      return result.project;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}

// Usage
const project = await createProject({
  name: "DeFi Dashboard",
  description: "A comprehensive dashboard for DeFi protocols",
  repositoryUrl: "https://github.com/alex_dev/defi-dashboard",
  techStack: "React,TypeScript,Node.js,Solidity",
  category: "web",
  liveUrl: "https://defi-dashboard.example.com"
});
```

### Get User's Projects
```javascript
async function getUserProjects(userUal) {
  try {
    const response = await fetch(
      `http://localhost:3002/api/projects/user/${encodeURIComponent(userUal)}`
    );

    const result = await response.json();
    
    if (result.success) {
      console.log(`Found ${result.count} projects`);
      return result.projects;
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
  }
}

// Usage
const userUal = localStorage.getItem('userUal');
const projects = await getUserProjects(userUal);
```

## Expected Response Formats

### Successful Profile Creation
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "id": 1,
    "username": "alex_dev",
    "fullName": "Alex Johnson",
    "ual": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322",
    "dkgAssetId": 123,
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322"
  }
}
```

### Successful Project Creation
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "name": "DeFi Dashboard",
    "userUal": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318322",
    "ual": "did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318323",
    "dkgAssetId": 124,
    "explorerUrl": "https://dkg.origintrail.io/explore?ual=did:dkg:otp:20430/0x5cac41237127f94c2d21dae0b14bfefa99880630/318323"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Missing required fields: fullName, username, email"
}
```

## Testing Workflow

1. **Start DKG Node** (in separate terminal):
```bash
cd dkg-node
npm run dev
```

2. **Start Backend** (in separate terminal):
```bash
cd buildergraph-backend
npm run dev
```

3. **Create a Profile**:
```bash
curl -X POST http://localhost:3002/api/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "skills": ["React", "Node.js"]
  }'
```

4. **Copy the UAL from response** and use it to create a project:
```bash
curl -X POST http://localhost:3002/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "userUal": "PASTE_UAL_HERE",
    "name": "Test Project",
    "description": "A test project",
    "repositoryUrl": "https://github.com/test/project",
    "techStack": "React,Node.js",
    "category": "web"
  }'
```

5. **Verify in DKG Explorer**: Open the `explorerUrl` from the response to see your asset on the DKG network!
