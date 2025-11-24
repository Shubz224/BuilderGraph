import React from 'react';
import { Card } from '../../ui/Card';

interface Activity {
  id: string;
  type: 'commit' | 'endorsement' | 'project' | 'skill';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-6">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 pb-4 border-b border-white/5 last:border-0">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-lg
              bg-gradient-to-r ${activity.color}
              flex items-center justify-center text-lg
            `}>
              {activity.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-text-primary font-medium truncate">
                {activity.title}
              </p>
              <p className="text-text-secondary text-sm">
                {activity.description}
              </p>
              <p className="text-text-muted text-xs mt-1">
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-accent hover:text-accent/80 transition">
        Load more →
      </button>
    </Card>
  );
};

export { ActivityFeed };
