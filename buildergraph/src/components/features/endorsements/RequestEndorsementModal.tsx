import React from 'react';
import { Card } from '../../ui/Card';

import { Button } from '../../ui/Button';

interface RequestEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RequestEndorsementModal: React.FC<RequestEndorsementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedDeveloper, setSelectedDeveloper] = React.useState('');
  const [selectedSkill, setSelectedSkill] = React.useState('');
  const [message, setMessage] = React.useState('');

  const mockDevelopers = [
    'sarah_chen',
    'mike_johnson',
    'alex_dev',
    'jane_doe',
  ];
  const skills = [
    'TypeScript',
    'React',
    'Node.js',
    'Solidity',
    'GraphQL',
    'Python',
  ];

  const handleSubmit = () => {
    console.log('Endorsement Request:', {
      developer: selectedDeveloper,
      skill: selectedSkill,
      message,
      sentAt: new Date().toISOString(),
    });
    alert('Endorsement request sent!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-semibold text-text-primary">
            Request Endorsement
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Select Developer */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              From Developer
            </label>
            <select
              value={selectedDeveloper}
              onChange={(e) => setSelectedDeveloper(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background-elevated border border-white/10 text-text-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a developer...</option>
              {mockDevelopers.map((dev) => (
                <option key={dev} value={dev}>
                  @{dev}
                </option>
              ))}
            </select>
          </div>

          {/* Select Skill */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              For Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background-elevated border border-white/10 text-text-primary focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select a skill...</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add context for why you're requesting this endorsement..."
              maxLength={300}
              className="w-full px-4 py-3 rounded-lg h-20 resize-none bg-background-elevated border border-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
            />
            <p className="text-text-secondary text-xs mt-2">
              {message.length}/300 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedDeveloper || !selectedSkill}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { RequestEndorsementModal };
