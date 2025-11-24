import React from 'react';
import { Card } from '../../ui/Card';

interface BreakdownItem {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface ReputationBreakdownProps {
  items: BreakdownItem[];
}

const ReputationBreakdown: React.FC<ReputationBreakdownProps> = ({ items }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  const getColor = (index: number) => {
    const colors = [
      'from-primary to-accent',
      'from-accent to-primary',
      'from-primary/50 to-accent/50',
      'from-accent/50 to-primary/50',
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="h-full">
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-2">
          Reputation Breakdown
        </h3>
        <div className="w-12 h-1 bg-gradient-to-r from-primary to-accent rounded-full" />
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {items.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div
              key={index}
              className="relative bg-background-elevated rounded-xl p-4 border border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getColor(index)} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-3xl mb-3">{item.icon}</div>

                {/* Label */}
                <div className="text-xs text-text-secondary font-semibold uppercase tracking-wide mb-2">
                  {item.label}
                </div>

                {/* Value */}
                <div className="text-3xl font-bold text-text-primary mb-3">
                  {item.value}%
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getColor(index)} transition-all duration-700 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10">
        <div className="text-xs text-text-secondary leading-relaxed">
          Reputation is calculated from <span className="text-primary font-semibold">code quality</span>,
          <span className="text-accent font-semibold"> consistency</span>,
          <span className="text-primary font-semibold"> peer endorsements</span>, and
          <span className="text-accent font-semibold"> project diversity</span>.
        </div>
      </div>
    </Card>
  );
};

export { ReputationBreakdown };
