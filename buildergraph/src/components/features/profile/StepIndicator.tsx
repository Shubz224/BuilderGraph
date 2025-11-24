import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  steps 
}) => {
  return (
    <div className="mb-12">
      {/* Step numbers */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <React.Fragment key={stepNum}>
              {/* Circle */}
              <div className="flex flex-col items-center flex-1">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg mb-2
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-accent text-background' 
                    : isActive 
                    ? 'bg-gradient-to-r from-primary to-accent text-white' 
                    : 'bg-background-card text-text-secondary border-2 border-white/10'
                  }
                `}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span className={`
                  text-sm font-medium text-center
                  ${isActive ? 'text-text-primary' : 'text-text-secondary'}
                `}>
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {stepNum < totalSteps && (
                <div className={`
                  flex-1 h-1 mx-2 mt-6 rounded
                  ${isCompleted 
                    ? 'bg-accent' 
                    : 'bg-white/5'
                  }
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-background-card rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

export { StepIndicator };
