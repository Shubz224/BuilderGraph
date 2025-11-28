import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import { SuccessCelebration } from '../../ui/SuccessCelebration';

const endorsementSchema = z.object({
  targetUsername: z.string().min(2, 'Username required'),
  skillName: z.string().min(2, 'Skill required'),
  rating: z.number().min(1).max(5),
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
  tracStaked: z.number().min(100, 'Minimum stake is 100 TRAC').max(10000, 'Maximum stake is 10,000 TRAC'),
});

type EndorsementFormData = z.infer<typeof endorsementSchema>;

interface GiveEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string;
  defaultSkill?: string;
}

const GiveEndorsementModal: React.FC<GiveEndorsementModalProps> = ({
  isOpen,
  onClose,
  targetUsername: initialTargetUsername,
  defaultSkill,
}) => {
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingStatus, setPublishingStatus] = useState<'idle' | 'publishing' | 'success' | 'error'>('idle');
  const [endorsementUAL, setEndorsementUAL] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<EndorsementFormData>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      targetUsername: initialTargetUsername || '',
      skillName: defaultSkill || '',
      rating: 5,
      tracStaked: 250,
    },
  });

  const messageValue = watch('message') || '';

  const handleCloseAndReset = () => {
    reset();
    setSelectedRating(5);
    setPublishingStatus('idle');
    setEndorsementUAL(null);
    setErrorMessage(null);
    onClose();
  };

  const onFormSubmit = async (data: EndorsementFormData) => {
    setIsSubmitting(true);
    setPublishingStatus('publishing');
    setErrorMessage(null);

    try {
      const userProfile = userStore.getUserProfile();
      const userUAL = userStore.getUserUAL();

      if (!userProfile || !userUAL) {
        setErrorMessage('Please create your profile first');
        setPublishingStatus('error');
        setIsSubmitting(false);
        return;
      }

      // First, fetch the target profile by username to get their UAL
      // Strip @ symbol if user included it
      const cleanUsername = data.targetUsername.replace(/^@/, '');
      console.log('Looking up target profile:', cleanUsername);
      const targetProfileResponse = await api.getProfileByUsername(cleanUsername);

      if (!targetProfileResponse.success || !targetProfileResponse.profile) {
        setErrorMessage(`User "${data.targetUsername}" not found. Please check the username.`);
        setPublishingStatus('error');
        setIsSubmitting(false);
        return;
      }

      const targetProfile = targetProfileResponse.profile;

      if (!targetProfile.ual) {
        setErrorMessage(`User "${data.targetUsername}" hasn't been published to DKG yet.`);
        setPublishingStatus('error');
        setIsSubmitting(false);
        return;
      }

      console.log('Target profile found:', targetProfile.username, 'UAL:', targetProfile.ual);

      // Create endorsement request
      const endorsementData = {
        endorserUAL: userUAL,
        endorserUsername: userProfile.username,
        endorserName: userProfile.full_name,
        targetType: 'skill' as const,
        targetId: targetProfile.ual, // Use the looked-up UAL
        targetUsername: data.targetUsername,
        skillName: data.skillName,
        rating: data.rating,
        message: data.message,
        tracStaked: data.tracStaked,
      };

      console.log('Creating endorsement...', endorsementData);

      const createResponse = await api.createEndorsement(endorsementData);

      if (!createResponse.success) {
        setErrorMessage((createResponse as any).error || 'Failed to create endorsement');
        setPublishingStatus('error');
        setIsSubmitting(false);
        return;
      }

      // Poll for publishing status
      console.log('Waiting for DKG publishing...');
      const statusResponse = await api.waitForEndorsementPublishing(
        createResponse.operationId,
        (status) => {
          console.log('Publishing status:', status.status);
        }
      );

      if (statusResponse.status === 'completed' && statusResponse.ual) {
        console.log('✅ Endorsement published!', statusResponse.ual);
        setEndorsementUAL(statusResponse.ual);
        setPublishingStatus('success');
      } else {
        setErrorMessage(statusResponse.error || 'Publishing failed');
        setPublishingStatus('error');
      }
    } catch (error) {
      console.error('Error creating endorsement:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
      setPublishingStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Success state
  if (publishingStatus === 'success' && endorsementUAL) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="max-w-md w-full">
          <SuccessCelebration
            title="Endorsement Published!"
            message="Your endorsement has been published to the DKG. The developer will be notified."
            ual={endorsementUAL}
          />
          <div className="mt-6 text-center">
            <button
              onClick={handleCloseAndReset}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-semibold text-text-primary">
            {publishingStatus === 'publishing' ? 'Publishing to DKG...' : 'Give Endorsement'}
          </h2>
          {publishingStatus !== 'publishing' && (
            <button
              onClick={handleCloseAndReset}
              className="text-text-secondary hover:text-text-primary transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Publishing Loader */}
        {publishingStatus === 'publishing' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
              <p className="text-text-primary font-medium mb-2">Publishing Endorsement to DKG</p>
              <p className="text-text-secondary text-sm text-center">
                Creating verifiable record on the Decentralized Knowledge Graph...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {publishingStatus === 'error' && errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => {
                setPublishingStatus('idle');
                setErrorMessage(null);
              }}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Form */}
        {publishingStatus === 'idle' && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Target Username */}
            <Input
              label="Developer Username"
              placeholder="@username"
              {...register('targetUsername')}
              error={errors.targetUsername?.message}
              disabled={!!initialTargetUsername}
            />

            {/* Skill */}
            <Input
              label="Skill to Endorse"
              placeholder="e.g., TypeScript, React, Solidity"
              {...register('skillName')}
              error={errors.skillName?.message}
            />

            {/* Rating */}
            <div>
              <label className="block text-text-primary font-medium mb-3">
                Rating
              </label>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedRating(i + 1)}
                    className={`
                      text-3xl transition-transform
                      ${i < selectedRating ? 'text-accent scale-110' : 'text-white/20'}
                    `}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                value={selectedRating}
                {...register('rating', { valueAsNumber: true })}
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                Endorsement Message
              </label>
              <textarea
                placeholder="Write why you're endorsing this skill..."
                maxLength={500}
                className={`
                  w-full px-4 py-3 rounded-lg h-24 resize-none
                  bg-background-elevated border border-white/10
                  text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
                  transition-colors duration-200
                  ${errors.message ? 'border-red-500' : ''}
                `}
                {...register('message')}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-text-secondary text-sm">
                  {messageValue.length}/500 characters
                </p>
                {errors.message && (
                  <p className="text-red-400 text-sm">{errors.message.message}</p>
                )}
              </div>
            </div>

            {/* TRAC Stake Amount */}
            <div>
              <label className="block text-text-primary font-medium mb-2">
                TRAC Stake Amount
              </label>
              <Input
                type="number"
                placeholder="250"
                min="100"
                max="10000"
                step="50"
                {...register('tracStaked', { valueAsNumber: true })}
                error={errors.tracStaked?.message}
              />
              <div className="mt-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-accent text-xs">
                  <strong>🔒 Skin in the Game:</strong> Your TRAC stake shows you truly believe in this skill. Higher stakes = stronger endorsement.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-white/5">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={handleCloseAndReset}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Endorse & Stake TRAC'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export { GiveEndorsementModal };
