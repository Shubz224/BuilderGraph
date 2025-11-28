import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { userStore } from '../stores/userStore';
import { publishingStore } from '../stores/publishingStore';
import { SuccessCelebration } from '../components/ui/SuccessCelebration';

const GitHubCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');
  const [userUAL, setUserUAL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const success = searchParams.get('success');

      if (success === 'true') {
        // Fetch user data from the backend
        try {
          setMessage('Fetching your profile...');
          const response = await api.getCurrentUser();

          if (response.success && response.authenticated && response.user) {
            const user = response.user;

            // Check if DKG profile is being published or needs to be published
            if (!user.ual && user.publish_status !== 'completed') {
              // Profile is being published to DKG - start background publishing
              publishingStore.startPublishing('profile', 'Your Profile');
              publishingStore.monitorProfilePublishing();

              // Redirect to dashboard immediately
              navigate('/dashboard');
              return;
            } else if (user.ual) {
              // Profile already has UAL - direct success
              userStore.saveUserProfile(user);
              setUserUAL(user.ual);
              setStatus('success');
              setMessage('Successfully logged in with GitHub!');
            } else {
              // No UAL and no publishing - something went wrong
              setStatus('error');
              setMessage('Profile creation failed. Please try again.');
            }
          } else {
            setStatus('error');
            setMessage('Failed to retrieve user information');
          }
        } catch (error) {
          console.error('Callback error:', error);
          setStatus('error');
          setMessage('An error occurred during authentication');
        }
      } else {
        setStatus('error');
        setMessage('GitHub authentication was cancelled or failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleCelebrationComplete = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Show success celebration
  if (status === 'success' && userUAL) {
    return (
      <SuccessCelebration
        title="Welcome Back!"
        message="Your profile is ready!"
        ual={userUAL}
        onComplete={handleCelebrationComplete}
        autoRedirectSeconds={5}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                    <svg
                      className="animate-spin h-8 w-8 text-purple-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Authenticating...
                </h2>
                <p className="text-gray-300">{message}</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
                    <svg
                      className="h-8 w-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Authentication Failed
                </h2>
                <p className="text-gray-300 mb-6">{error || message}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors duration-200"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={handleRetry}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;
