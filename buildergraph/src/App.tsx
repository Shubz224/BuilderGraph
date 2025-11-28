import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AddProject from './pages/AddProject';
import Endorsements from './pages/Endorsements';
import PublicProfile from './pages/PublicProfile';
import RecruiterDashboard from './pages/RecruiterDashboard';
import GitHubCallback from './pages/GitHubCallback';

import { GlobalProgressBar } from './components/ui/GlobalProgressBar';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background flex flex-col">
        <GlobalProgressBar />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route path="/dashboard/projects/:id" element={<ProjectDetail />} />
            <Route path="/dashboard/projects/add" element={<AddProject />} />
            <Route path="/dashboard/endorsements" element={<Endorsements />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/auth/callback" element={<GitHubCallback />} />
            <Route path="/:username" element={<PublicProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
