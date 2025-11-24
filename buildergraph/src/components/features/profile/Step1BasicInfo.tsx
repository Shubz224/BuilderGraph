import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';


const step1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Only alphanumeric, underscore, and dash allowed'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(2, 'Location required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1BasicInfoProps {
  onNext: (data: Step1FormData) => void;
}

const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({ onNext }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      location: '',
      bio: '',
    },
  });

  const bioValue = watch('bio') || '';

  const onSubmit = (data: Step1FormData) => {
    console.log('Step 1 Data:', data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Alex Johnson"
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        {/* Username */}
        <Input
          label="Username"
          placeholder="alex_dev"
          {...register('username')}
          error={errors.username?.message}
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="alex@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Location */}
        <Input
          label="Location"
          placeholder="San Francisco, CA"
          {...register('location')}
          error={errors.location?.message}
        />

        {/* Bio */}
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Bio (Optional)
          </label>
          <textarea
            placeholder="Tell us about yourself..."
            maxLength={500}
            className={`
              w-full px-4 py-3 rounded-lg h-24 resize-none
              bg-background-elevated border border-white/10
              text-text-primary placeholder-text-muted
              focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30
              transition-colors duration-200
            `}
            {...register('bio')}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-text-secondary text-sm">
              {bioValue.length}/500 characters
            </p>
            {errors.bio && (
              <p className="text-red-400 text-sm">{errors.bio.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full mt-8"
      >
        Continue to Skills →
      </Button>
    </form>
  );
};

export { Step1BasicInfo };
