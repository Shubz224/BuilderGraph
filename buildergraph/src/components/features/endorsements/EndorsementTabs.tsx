import React from 'react';

interface EndorsementTabsProps {
  activeTab: 'received' | 'given';
  onTabChange: (tab: 'received' | 'given') => void;
  receivedCount: number;
  givenCount: number;
}

const EndorsementTabs: React.FC<EndorsementTabsProps> = ({
  activeTab,
  onTabChange,
  receivedCount,
  givenCount,
}) => {
  return (
    <div className="flex gap-8 border-b border-white/10 mb-8">
      <button
        onClick={() => onTabChange('received')}
        className={`
          py-4 px-2 font-semibold transition-all relative
          ${activeTab === 'received'
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        Received Endorsements
        <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent rounded-full text-xs">
          {receivedCount}
        </span>
        {activeTab === 'received' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
        )}
      </button>

      <button
        onClick={() => onTabChange('given')}
        className={`
          py-4 px-2 font-semibold transition-all relative
          ${activeTab === 'given'
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary'
          }
        `}
      >
        Given Endorsements
        <span className="ml-2 px-2 py-0.5 bg-accent/20 text-accent rounded-full text-xs">
          {givenCount}
        </span>
        {activeTab === 'given' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
        )}
      </button>
    </div>
  );
};

export { EndorsementTabs };
