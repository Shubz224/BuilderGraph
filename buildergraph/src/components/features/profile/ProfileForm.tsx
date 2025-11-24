import React, { useState } from 'react';
import { Container } from '../../ui/Container';
import { StepIndicator } from './StepIndicator';
import { Step1BasicInfo } from './Step1BasicInfo';
import { Step2Skills } from './Step2Skills';
import { Step3GitHub } from './Step3GitHub';
import { Step4Review } from './Step4Review';

const ProfileForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: null,
    step2: null,
    step3: null,
  });

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

  const handleStep4Submit = () => {
    // Create complete profile data structure
    const completeProfileData = {
      ...(formData.step1 || {}),
      ...(formData.step2 || {}),
      ...(formData.step3 || {}),
      profileCreatedAt: new Date().toISOString(),
      profileId: `DEV-${Date.now()}`,
    };

    // Log complete profile data as JSON
    console.log('DEVELOPER PROFILE CREATED:');
    console.log(completeProfileData);

    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

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
