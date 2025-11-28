import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../ui/Container';
import { StepIndicator } from './StepIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Skills } from './Step2Skills';
import { Step3GitHub } from './Step3GitHub';
import { Step4Review } from './Step4Review';
import { DKGPublishingLoader } from '../../ui/DKGPublishingLoader';
import { SuccessCelebration } from '../../ui/SuccessCelebration';
import { api } from '../../../services/api';
import { userStore } from '../../../stores/userStore';
import type { ProfileFormData } from '../../../types/api.types';

const ProfileForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{
    step1: any;
    step2: any;
    step3: any;
  }>({
    step1: null,
    step2: null,
    step3: null,
  });

  // Publishing states
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [userUAL, setUserUAL] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const steps = ['Basic Info', 'Skills', 'GitHub', 'Review'];

  const handleStep1Next = (data: any) => {
    setFormData({ ...formData, step1: data });
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Next = (data: any) => {
    setFormData({ ...formData, step2: data });
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep3Next = (data: any) => {
    setFormData({ ...formData, step3: data });
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep4Submit = async () => {
    setIsPublishing(true);
    setPublishError(null);
    setProgress(10);

    try {
      // Combine all form data
      const profileData: ProfileFormData = {
        fullName: formData.step1?.fullName || '',
        username: formData.step1?.username || '',
        email: formData.step1?.email || '',
        location: formData.step1?.location || '',
        bio: formData.step1?.bio || '',
        skills: formData.step2?.skills || [],
        experience: formData.step2?.experience || 0,
        languages: formData.step2?.languages || [],
        specializations: formData.step2?.specializations || [],
        githubUsername: formData.step3?.githubUsername || '',
        githubRepos: formData.step3?.githubRepos || [],
      };

      console.log('📤 Submitting profile:', profileData);

      // Call API to create profile
      const createResponse = await api.createProfile(profileData);

      if (!createResponse.success) {
        const errorMsg = 'error' in createResponse ? createResponse.error : 'Failed to create profile';
        throw new Error(errorMsg);
      }

      setProgress(30);

      console.log('✅ Profile creation started:', createResponse);

      // Wait for publishing to complete with progress updates
      const finalStatus = await api.waitForProfilePublishing(
        createResponse.operationId,
        (status) => {
          console.log('📊 Status update:', status);
          // Update progress based on polling (gradually increase)
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      );

      if (!finalStatus.success || finalStatus.status === 'failed') {
        throw new Error(finalStatus.error || 'Publishing failed');
      }

      setProgress(100);

      console.log('🎉 Profile published successfully!', finalStatus);

      // Save UAL and profile data
      if (finalStatus.ual) {
        userStore.saveUserUAL(finalStatus.ual);
        setUserUAL(finalStatus.ual);

        // Fetch and cache full profile data
        const profileResponse = await api.getProfile(finalStatus.ual);
        if (profileResponse.success) {
          userStore.saveUserProfile(profileResponse.profile);
        }
      }

      // Show success celebration
      setIsPublishing(false);
      setPublishSuccess(true);
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      setIsPublishing(false);
      setPublishError(error instanceof Error ? error.message : 'Failed to create profile');
    }
  };

  const handleCelebrationComplete = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleRetry = () => {
    setPublishError(null);
    setProgress(0);
    handleStep4Submit();
  };

  // Show loading screen while publishing
  if (isPublishing) {
    return <DKGPublishingLoader message="Publishing your developer profile" progress={progress} />;
  }

  // Show success celebration
  if (publishSuccess && userUAL) {
    return (
      <SuccessCelebration
        title="Profile Created!"
        message="Hey Developer, your profile is created!"
        ual={userUAL}
        onComplete={handleCelebrationComplete}
        autoRedirectSeconds={5}
      />
    );
  }

  // Show error state
  if (publishError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Container maxWidth="md">
          <div className="bg-background-card rounded-xl p-8 border border-red-500/20 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Publishing Failed</h2>
            <p className="text-text-secondary">{publishError}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 bg-background-elevated text-text-primary rounded-xl hover:bg-background-elevated/80 transition-colors"
              >
                ← Go Back
              </button>
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Container maxWidth="md" className="py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Create Your Developer Profile
          </h1>
          <p className="text-text-secondary">
            Build your verifiable reputation on the Decentralized Knowledge Graph
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />

        {/* Form Steps */}
        <div className="bg-background-card rounded-xl p-8 border border-white/5">
          {currentStep === 1 && (
            <Step1BasicInfo onNext={handleStep1Next} />
          )}
          {currentStep === 2 && (
            <Step2Skills
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <Step3GitHub
              onNext={handleStep3Next}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <Step4Review
              formData={formData}
              onBack={() => setCurrentStep(3)}
              onSubmit={handleStep4Submit}
            />
          )}
        </div>
      </Container>
    </div>
  );
};

export { ProfileForm };
