import React from 'react';
import { Container } from '../components/ui/Container';
import {
  ReputationScore,
  ReputationBreakdown,
  ActivityFeed,
  QuickActions,
  ProfileCompletion
} from '../components/features/reputation';
import { mockUser, mockProjects } from '../data/mockData';
import {
  IoCodeSlash,
  IoTrendingUp,
  IoPeople,
  IoBulb,
  IoSave,
  IoRocket,
  IoStar,
  IoEye,
  IoFolder,
  IoLogoGithub,
  IoHandRight
} from 'react-icons/io5';

const Dashboard: React.FC = () => {
  // Mock data
  const breakdownItems = [
    { label: 'Code Quality', value: 35, icon: <IoCodeSlash className="text-2xl" /> },
    { label: 'Consistency', value: 25, icon: <IoTrendingUp className="text-2xl" /> },
    { label: 'Peer Endorsements', value: 20, icon: <IoPeople className="text-2xl" /> },
    { label: 'Project Diversity', value: 20, icon: <IoBulb className="text-2xl" /> },
  ];

  const activities = [
    {
      id: '1',
      type: 'commit' as const,
      title: 'Pushed 5 commits to DeFi Dashboard',
      description: '+347 lines, -123 lines',
      timestamp: '2 hours ago',
      icon: <IoSave className="text-xl" />,
      color: 'from-primary to-accent',
    },
    {
      id: '2',
      type: 'endorsement' as const,
      title: 'Received endorsement from Sarah Chen',
      description: 'TypeScript expertise verified',
      timestamp: '1 day ago',
      icon: <IoStar className="text-xl" />,
      color: 'from-accent to-primary',
    },
    {
      id: '3',
      type: 'project' as const,
      title: 'Added new project: Smart Contract Auditor',
      description: '567 stars on GitHub',
      timestamp: '3 days ago',
      icon: <IoRocket className="text-xl" />,
      color: 'from-primary/50 to-accent/50',
    },
  ];

  const quickActions = [
    {
      id: '1',
      label: 'Add Project',
      icon: <IoFolder className="text-3xl" />,
      description: 'Showcase your work',
      onClick: () => console.log('Add project clicked'),
    },
    {
      id: '2',
      label: 'Import from GitHub',
      icon: <IoLogoGithub className="text-3xl" />,
      description: 'Auto-sync repos',
      onClick: () => console.log('Import from GitHub clicked'),
    },
    {
      id: '3',
      label: 'Request Endorsement',
      icon: <IoHandRight className="text-3xl" />,
      description: 'Get peer validation',
      onClick: () => console.log('Request endorsement clicked'),
    },
  ];

  const completionItems = [
    { name: 'Complete basic profile', completed: true },
    { name: 'Add profile picture', completed: true },
    { name: 'Connect GitHub', completed: true },
    { name: 'Add at least 3 projects', completed: false },
    { name: 'Receive 5 endorsements', completed: false },
  ];

  // Stats for hero section
  const heroStats = [
    {
      label: 'TOTAL COMMITS',
      value: '1,247',
      change: '+127',
      icon: <IoSave className="text-3xl" />,
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      label: 'ACTIVE PROJECTS',
      value: mockProjects.length.toString(),
      change: '+2',
      icon: <IoRocket className="text-3xl" />,
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'ENDORSEMENTS',
      value: '47',
      change: '+5',
      icon: <IoStar className="text-3xl" />,
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      label: 'PROFILE VIEWS',
      value: '2.3K',
      change: '+234',
      icon: <IoEye className="text-3xl" />,
      gradient: 'from-emerald-500 to-teal-600'
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(123,97,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,217,255,0.1),transparent_50%)]" />

        <Container maxWidth="2xl" className="py-12 relative z-10">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-3 tracking-tight">
              WELCOME BACK
            </h1>
            <p className="text-xl text-accent font-medium">
              {mockUser.fullName}
            </p>
            <p className="text-text-secondary mt-2">
              Verified Developer on the Decentralized Knowledge Graph
            </p>
          </div>

          {/* Hero Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="group relative bg-background-card/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl rounded-full`} />
                <div className="relative">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-xs text-text-secondary font-semibold tracking-wider mb-2">
                    {stat.label}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </div>
                    <div className="text-xs text-accent font-semibold">
                      {stat.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <Container maxWidth="2xl" className="py-12">
        {/* Reputation Overview Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              REPUTATION OVERVIEW
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reputation Score */}
            <div className="lg:col-span-1">
              <ReputationScore
                score={mockUser.reputationScore}
                trend={mockUser.reputationTrend}
              />
            </div>

            {/* Breakdown */}
            <div className="lg:col-span-2">
              <ReputationBreakdown items={breakdownItems} />
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              QUICK ACTIONS
            </h2>
          </div>
          <QuickActions actions={quickActions} />
        </div>

        {/* Profile & Activity Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              ACTIVITY & PROGRESS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileCompletion
              percentage={mockUser.profileCompletion}
              items={completionItems}
            />
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Recent Projects Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
            <h2 className="text-3xl font-bold text-text-primary tracking-tight">
              RECENT PROJECTS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockProjects.map((project, index) => (
              <div
                key={project.id}
                className="group relative bg-background-card rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <IoRocket className="text-2xl text-accent" />
                  </div>

                  {/* Description */}
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-gradient-to-r from-primary/20 to-accent/20 text-accent rounded-full text-xs font-semibold border border-primary/30 hover:border-accent/50 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-3 py-1 bg-white/5 text-text-secondary rounded-full text-xs font-semibold">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-text-secondary text-sm">
                    <div className="flex items-center gap-2">
                      <IoStar className="text-accent" />
                      <span className="font-semibold">{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IoSave className="text-primary" />
                      <span className="font-semibold">{project.commits}</span>
                    </div>
                    <div className="flex-1" />
                    <button className="text-accent hover:text-primary transition-colors font-semibold text-xs">
                      VIEW →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
