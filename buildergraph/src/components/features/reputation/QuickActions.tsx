import React from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const gradients = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-pink-500 to-rose-600',
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <div
          key={action.id}
          onClick={action.onClick}
          className="group relative bg-background-card rounded-xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Gradient Border Effect on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

          {/* Gradient Glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradients[index]} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />

          <div className="relative z-10">
            {/* Icon with background */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-background-elevated border border-white/10 mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">
              {action.icon}
            </div>

            {/* Label */}
            <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
              {action.label}
            </h3>

            {/* Description */}
            <p className="text-text-secondary text-sm mb-4 leading-relaxed">
              {action.description}
            </p>

            {/* Action Arrow */}
            <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
              <span>Take Action</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Hover Lift Effect Shadow */}
          <div className={`absolute -inset-1 bg-gradient-to-br ${gradients[index]} opacity-0 group-hover:opacity-20 blur-xl -z-10 transition-opacity duration-300`} />
        </div>
      ))}
    </div>
  );
};

export { QuickActions };
