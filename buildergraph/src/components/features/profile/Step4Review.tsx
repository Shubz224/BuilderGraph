import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

interface Step4ReviewProps {
  formData: any;
  onBack: () => void;
  onSubmit: () => void;
}

const Step4Review: React.FC<Step4ReviewProps> = ({ formData, onBack, onSubmit }) => {
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  const handleSubmit = () => {
    console.log('Final Form Data:', {
      ...formData,
      termsAccepted,
      timestamp: new Date().toISOString(),
    });
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="text-text-primary font-semibold mb-4">Profile Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h4 className="text-text-secondary text-sm font-medium mb-2">Basic Info</h4>
            <div className="space-y-1">
              <p className="text-text-primary font-medium">{formData.step1?.fullName}</p>
              <p className="text-text-secondary text-sm">@{formData.step1?.username}</p>
              <p className="text-text-secondary text-sm">{formData.step1?.location}</p>
            </div>
          </Card>

          <Card>
            <h4 className="text-text-secondary text-sm font-medium mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {formData.step2?.skills.slice(0, 3).map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-primary/20 text-accent rounded text-xs">
                  {skill}
                </span>
              ))}
              {formData.step2?.skills.length > 3 && (
                <span className="px-2 py-1 bg-primary/20 text-accent rounded text-xs">
                  +{formData.step2?.skills.length - 3}
                </span>
              )}
            </div>
          </Card>

          <Card>
            <h4 className="text-text-secondary text-sm font-medium mb-2">Experience</h4>
            <p className="text-text-primary font-medium">{formData.step2?.experience}+ years</p>
          </Card>

          <Card>
            <h4 className="text-text-secondary text-sm font-medium mb-2">GitHub</h4>
            <p className="text-accent font-medium">
              {formData.step3?.githubConnected ? '✓ Connected' : 'Not connected'}
            </p>
          </Card>
        </div>
      </div>

      {/* Terms */}
      <Card>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1"
          />
          <div>
            <p className="text-text-primary font-medium">
              I agree to the Terms of Service
            </p>
            <p className="text-text-secondary text-sm">
              I understand that my profile information will be published on the Decentralized Knowledge Graph and visible to recruiters.
            </p>
          </div>
        </label>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          ← Back
        </Button>
        <Button 
          size="lg" 
          className="flex-1" 
          onClick={handleSubmit}
          disabled={!termsAccepted}
        >
          Create Profile ✓
        </Button>
      </div>

      {!termsAccepted && (
        <p className="text-center text-red-400 text-sm">
          Please accept the terms to continue
        </p>
      )}
    </div>
  );
};

export { Step4Review };
