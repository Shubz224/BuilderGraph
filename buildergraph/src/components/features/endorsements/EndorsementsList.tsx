import React, { useState } from 'react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { EndorsementCard } from './EndorsementCard';
import { EndorsementTabs } from './EndorsementTabs';
import { GiveEndorsementModal } from './GiveEndorsementModal';
import { RequestEndorsementModal } from './RequestEndorsementModal';
import { EndorsementStats } from './EndorsementStats';
import { mockEndorsements } from '../../../data/mockData';

const EndorsementsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const receivedEndorsements = mockEndorsements;
  const givenEndorsements = mockEndorsements.slice(0, 1);

  return (
    <div className="min-h-screen pb-20">
      <Container maxWidth="2xl" className="py-12">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Endorsements
            </h1>
            <p className="text-text-secondary">
              Build trust through peer validation
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setShowRequestModal(true)}
            >
              Request Endorsement
            </Button>
            <Button onClick={() => setShowGiveModal(true)}>
              Give Endorsement
            </Button>
          </div>
        </div>

        {/* Stats */}
        <EndorsementStats
          receivedCount={receivedEndorsements.length}
          totalStaked={
            receivedEndorsements.reduce((sum, e) => sum + e.stakeAmount, 0)
          }
          avgRating={4.5}
        />

        {/* Tabs */}
        <EndorsementTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          receivedCount={receivedEndorsements.length}
          givenCount={givenEndorsements.length}
        />

        {/* Endorsements Grid */}
        {activeTab === 'received' ? (
          <div>
            {receivedEndorsements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {receivedEndorsements.map((endorsement) => (
                  <EndorsementCard
                    key={endorsement.id}
                    {...endorsement}
                    isGiven={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">
                  No endorsements yet. Share your portfolio and ask colleagues to endorse you!
                </p>
                <Button variant="secondary">
                  Share Your Profile
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {givenEndorsements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {givenEndorsements.map((endorsement) => (
                  <EndorsementCard
                    key={endorsement.id}
                    {...endorsement}
                    isGiven={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">
                  You haven't given any endorsements yet.
                </p>
                <Button onClick={() => setShowGiveModal(true)}>
                  Give Your First Endorsement
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>

      {/* Modals */}
      <GiveEndorsementModal
        isOpen={showGiveModal}
        onClose={() => setShowGiveModal(false)}
        onSubmit={() => setShowGiveModal(false)}
      />

      <RequestEndorsementModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
};

export { EndorsementsList };
