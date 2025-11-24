import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

const endorsementSchema = z.object({
  developerUsername: z.string().min(2, 'Username required'),
  skill: z.string().min(2, 'Skill required'),
  rating: z.number().min(1).max(5),
  message: z.string().min(20, 'Message must be at least 20 characters').max(500),
  stakeAmount: z.number().min(10).max(1000),
});

type EndorsementFormData = z.infer<typeof endorsementSchema>;

interface GiveEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EndorsementFormData) => void;
}

const GiveEndorsementModal: React.FC<GiveEndorsementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedRating, setSelectedRating] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EndorsementFormData>({
    resolver: zodResolver(endorsementSchema),
    defaultValues: {
      rating: 5,
      stakeAmount: 50,
    },
  });

  const messageValue = watch('message') || '';

  const onFormSubmit = (data: EndorsementFormData) => {
    console.log('Endorsement Data:', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    onSubmit(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-semibold text-text-primary">
            Give Endorsement
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Developer Username */}
          <Input
            label="Developer Username"
            placeholder="@username"
            {...register('developerUsername')}
            error={errors.developerUsername?.message}
          />

          {/* Skill */}
          <Input
            label="Skill to Endorse"
            placeholder="e.g., TypeScript, React, Solidity"
            {...register('skill')}
            error={errors.skill?.message}
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
                  onClick={() => {
                    setSelectedRating(i + 1);
                  }}
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
              placeholder="Write your endorsement message..."
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

          {/* Stake Amount */}
          <div>
            <label className="block text-text-primary font-medium mb-2">
              Reputation to Stake
            </label>
            <Input
              type="number"
              placeholder="50"
              min="10"
              max="1000"
              {...register('stakeAmount', { valueAsNumber: true })}
              error={errors.stakeAmount?.message}
            />
            <p className="text-text-secondary text-xs mt-2">
              ⚠️ If this endorsement is disputed, you may lose staked reputation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" className="flex-1">
              Send Endorsement
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export { GiveEndorsementModal };
