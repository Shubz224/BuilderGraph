import React from 'react';
import { Card } from '../../ui/Card';

interface ProfileCompletionProps {
  percentage: number;
  items: { name: string; completed: boolean }[];
}

const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ percentage, items }) => {
  const completed = items.filter(item => item.completed).length;

  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Profile Completion
          </h3>
          <p className="text-text-secondary text-sm">
            {completed} of {items.length} steps completed
          </p>
        </div>
        <span className="text-2xl font-bold text-accent">{percentage}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-background rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`
              flex-shrink-0 w-5 h-5 rounded border-2
              flex items-center justify-center transition-all
              ${item.completed 
                ? 'bg-accent border-accent' 
                : 'border-white/20'
              }
            `}>
              {item.completed && (
                <svg className="w-3 h-3 text-background" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`
              transition-colors
              ${item.completed ? 'text-text-secondary line-through' : 'text-text-primary'}
            `}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export { ProfileCompletion };
