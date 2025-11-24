import React from 'react';
import { Card } from '../../ui/Card';

interface EndorsementStatsProps {
  receivedCount: number;
  totalStaked: number;
  avgRating: number;
}

const EndorsementStats: React.FC<EndorsementStatsProps> = ({
  receivedCount,
  totalStaked,
  avgRating,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <h3 className="text-text-secondary text-sm font-medium mb-2">
          Total Endorsements
        </h3>
        <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {receivedCount}
        </div>
        <p className="text-text-secondary text-xs mt-2">
          From peer developers
        </p>
      </Card>

      <Card>
        <h3 className="text-text-secondary text-sm font-medium mb-2">
          Reputation Staked
        </h3>
        <div className="text-4xl font-bold text-accent">
          {totalStaked.toLocaleString()}
        </div>
        <p className="text-text-secondary text-xs mt-2">
          TRAC tokens at risk
        </p>
      </Card>

      <Card>
        <h3 className="text-text-secondary text-sm font-medium mb-2">
          Average Rating
        </h3>
        <div className="flex items-baseline gap-2">
          <div className="text-4xl font-bold text-text-primary">
            {avgRating.toFixed(1)}
          </div>
          <span className="text-2xl text-accent">★</span>
        </div>
        <p className="text-text-secondary text-xs mt-2">
          Out of 5 stars
        </p>
      </Card>
    </div>
  );
};

export { EndorsementStats };
