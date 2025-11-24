export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  email: string;
  location: { city: string; country: string };
  bio: string;
  reputationScore: number;
  profileCompletion: number;
  skills: string[];
  memberSince: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  stars: number;
  commits: number;
  codeQualityScore: number;
  testCoverage: number;
 // lastUpdated:string;
}

export interface Endorsement {
  id: string;
  endorser: string;
  skill: string;
  message: string;
  rating: number;
  stakeAmount: number;
}
