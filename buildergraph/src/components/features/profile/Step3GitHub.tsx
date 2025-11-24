import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface Step3GitHubProps {
  onNext: (data: { githubConnected: boolean; repos: string[]; privacy: string }) => void;
  onBack: () => void;
}

const Step3GitHub: React.FC<Step3GitHubProps> = ({ onNext, onBack }) => {
  const [githubConnected, setGithubConnected] = useState(false);
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState('public');

  const mockRepos = [
    'DeFi Dashboard',
    'Smart Contract Auditor',
    'Web3 Utils Library',
    'Trading Bot',
  ];

  const toggleRepo = (repo: string) => {
    setSelectedRepos(prev =>
      prev.includes(repo) ? prev.filter(r => r !== repo) : [...prev, repo]
    );
  };

  const handleConnectGitHub = () => {
    console.log('Connecting to GitHub...');
    setGithubConnected(true);
  };

  const handleSubmit = () => {
    const data = {
      githubConnected,
      repos: selectedRepos,
      privacy,
    };
    console.log('Step 3 Data:', data);
    onNext(data);
  };

  return (
    <div className="space-y-6">
      {/* GitHub Connection Card */}
      <Card className={githubConnected ? 'bg-accent/10 border-accent/30' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {githubConnected ? '✓ GitHub Connected' : 'Connect GitHub'}
            </h3>
            <p className="text-text-secondary text-sm mt-1">
              {githubConnected 
                ? 'Your GitHub account is connected. You can now select repositories.' 
                : 'Connect your GitHub account to import your repositories automatically.'}
            </p>
          </div>
          <Button
            variant={githubConnected ? 'secondary' : 'primary'}
            onClick={handleConnectGitHub}
            disabled={githubConnected}
          >
            {githubConnected ? 'Connected ✓' : 'Connect'}
          </Button>
        </div>
      </Card>

      {/* Repository Selection */}
      {githubConnected && (
        <div>
          <label className="block text-text-primary font-semibold mb-4">
            Select Repositories to Feature
          </label>
          <div className="space-y-2">
            {mockRepos.map((repo) => (
              <div
                key={repo}
                onClick={() => toggleRepo(repo)}
                className={`
                  p-4 rounded-lg cursor-pointer transition-all border-2
                  ${selectedRepos.includes(repo)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background-card border-white/10 hover:border-primary/30'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center
                    ${selectedRepos.includes(repo)
                      ? 'bg-primary border-primary'
                      : 'border-white/20'
                    }
                  `}>
                    {selectedRepos.includes(repo) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-text-primary">{repo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Settings */}
      {githubConnected && (
        <div>
          <label className="block text-text-primary font-semibold mb-4">
            Private Contributions
          </label>
          <div className="space-y-2">
            {[
              { value: 'public', label: 'Show all contributions (public)', desc: 'Everyone can see your work' },
              { value: 'private', label: 'Hide private repos', desc: 'Private contributions stay private' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPrivacy(option.value)}
                className={`
                  w-full p-4 rounded-lg text-left transition-all border-2
                  ${privacy === option.value
                    ? 'bg-primary/10 border-primary'
                    : 'bg-background-card border-white/10 hover:border-primary/30'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${privacy === option.value ? 'bg-primary border-primary' : 'border-white/20'}
                  `}>
                    {privacy === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{option.label}</p>
                    <p className="text-text-secondary text-sm">{option.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-8">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button size="lg" className="flex-1" onClick={handleSubmit}>
          Review & Publish →
        </Button>
      </div>
    </div>
  );
};

export { Step3GitHub };
