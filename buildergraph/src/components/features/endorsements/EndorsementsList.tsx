import React, { useState, useEffect } from 'react';
import { Container } from '../../ui/Container';
import { Button } from '../../ui/Button';
import { EndorsementCard } from './EndorsementCard';
import { EndorsementTabs } from './EndorsementTabs';
import { GiveEndorsementModal } from './GiveEndorsementModal';
import { RequestEndorsementModal } from './RequestEndorsementModal';
import { EndorsementStats } from './EndorsementStats';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import type { Endorsement } from '../../../types/api.types';

const EndorsementsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [receivedEndorsements, setReceivedEndorsements] = useState<Endorsement[]>([]);
  const [givenEndorsements, setGivenEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEndorsements: 0, totalTracStaked: 0, averageRating: 0 });

  useEffect(() => {
    loadEndorsements();
  }, []);

  const loadEndorsements = async () => {
    const userUAL = userStore.getUserUAL();
    if (!userUAL) {
      setLoading(false);
      return;
    }

    try {
      // Load received endorsements
      const receivedResponse = await api.getEndorsementsByUser(userUAL);
      if (receivedResponse.success) {
        setReceivedEndorsements(receivedResponse.endorsements);
        setStats(receivedResponse.stats);
      }

      // Load given endorsements
      const givenResponse = await api.getGivenEndorsements(userUAL);
      if (givenResponse.success) {
        setGivenEndorsements(givenResponse.endorsements);
      }
    } catch (error) {
      console.error('Failed to load endorsements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              Build trust through peer validation with TRAC stakes
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowGiveModal(true)}>
              Give Endorsement
            </Button>
          </div>
        </div>

        {/* Stats */}
        <EndorsementStats
          receivedCount={stats.totalEndorsements}
          totalStaked={stats.totalTracStaked}
          avgRating={stats.averageRating}
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
                    id={endorsement.id.toString()}
                    endorser={endorsement.endorser_name}
                    skill={endorsement.skill_name || ''}
                    message={endorsement.message}
                    rating={endorsement.rating}
                    stakeAmount={endorsement.trac_staked}
                    date={new Date(endorsement.created_at).toLocaleDateString()}
                    isGiven={false}
                    ual={endorsement.ual}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-secondary mb-4">
                  No endorsements yet. Share your portfolio and ask colleagues to endorse you!
                </p>
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
                    id={endorsement.id.toString()}
                    endorser={`→ ${endorsement.target_username || 'Project'}`}
                    skill={endorsement.skill_name || endorsement.target_type}
                    message={endorsement.message}
                    rating={endorsement.rating}
                    stakeAmount={endorsement.trac_staked}
                    date={new Date(endorsement.created_at).toLocaleDateString()}
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
        onClose={() => {
          setShowGiveModal(false);
          loadEndorsements(); // Reload after creating
        }}
      />

      <RequestEndorsementModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
};

export { EndorsementsList };
