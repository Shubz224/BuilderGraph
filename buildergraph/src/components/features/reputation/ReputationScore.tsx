import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';

interface ReputationScoreProps {
  score: number;
  maxScore?: number;
  trend?: string;
}

const ReputationScore: React.FC<ReputationScoreProps> = ({
  score,
  maxScore = 10000,
  trend = '+12% this month'
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate counter
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < score) {
        current += Math.ceil(score / 30);
        setDisplayScore(Math.min(current, score));
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [score]);

  const percentage = (displayScore / maxScore) * 100;

  return (
    <Card hoverable className="text-center h-full flex flex-col justify-between">
      {/* Gradient Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl opacity-50 rounded-full" />

      <div className="relative z-10">
        {/* Title */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Reputation Score
          </h3>
          <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full" />
        </div>

        {/* Large Score Number */}
        <div className="mb-8">
          <div className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            {displayScore.toLocaleString()}
          </div>
          <div className="text-text-secondary text-sm">
            out of {maxScore.toLocaleString()}
          </div>
        </div>

        {/* Circular Progress */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="10"
              strokeDasharray={`${(2 * Math.PI * 54 * percentage) / 100} ${2 * Math.PI * 54}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7B61FF" />
                <stop offset="100%" stopColor="#00D9FF" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <div className="text-3xl font-bold text-text-primary mb-1">
                {Math.round(percentage)}%
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wide">Complete</div>
            </div>
          </div>
        </div>

        {/* Trend - Bottom */}
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-accent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-sm font-semibold">{trend}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export { ReputationScore };
