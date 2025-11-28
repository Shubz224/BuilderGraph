import React from 'react';
import { Card } from '../../ui/Card';

interface EndorsementCardProps {
  id: string;
  endorser: string;
  skill: string;
  message: string;
  rating: number;
  stakeAmount: number;
  date: string;
  isGiven?: boolean;
  ual?: string;
}

const EndorsementCard: React.FC<EndorsementCardProps> = ({
  endorser,
  skill,
  message,
  rating,
  stakeAmount,
  date,
  isGiven = false,
  ual,
}) => {
  const explorerUrl = ual ? `https://dkg-testnet.origintrail.io/explore?ual=${encodeURIComponent(ual)}` : null;

  return (
    <Card>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-white/5">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {endorser}
          </h3>
          <p className="text-accent font-medium text-sm">
            Endorsed: <span className="text-accent">{skill}</span>
          </p>
        </div>
        {/* Stars */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={i < rating ? 'text-accent' : 'text-white/20'}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      {/* Message */}
      <p className="text-text-secondary mb-4 leading-relaxed">
        "{message}"
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🔒</span>
          </div>
          <span className="text-accent font-semibold">{stakeAmount} TRAC</span>
          <span className="text-text-muted text-xs">staked</span>
        </div>
        <span className="text-text-muted text-xs">{date}</span>
      </div>

      {/* DKG Verification */}
      {ual && explorerUrl && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-text-muted text-xs">Verified on DKG</span>
            </div>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 transition flex items-center gap-1"
            >
              View on Explorer →
            </a>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isGiven && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <button className="text-sm text-accent hover:text-accent/80 transition">
            Withdraw Stake
          </button>
        </div>
      )}
    </Card>
  );
};

export { EndorsementCard };
