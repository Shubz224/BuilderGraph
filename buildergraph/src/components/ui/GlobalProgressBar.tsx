import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishingStore } from '../../stores/publishingStore';

export const GlobalProgressBar: React.FC = () => {
    const navigate = useNavigate();
    const [state, setState] = useState(publishingStore.getState());
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Subscribe to publishing store
        const unsubscribe = publishingStore.subscribe((newState) => {
            setState(newState);

            // Show when publishing starts
            if (newState.status === 'publishing') {
                setIsVisible(true);
                setIsDismissed(false);
            }

            // Auto-dismiss success after 5 seconds
            if (newState.status === 'success') {
                setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(() => publishingStore.reset(), 300);
                }, 5000);
            }
        });

        return unsubscribe;
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsVisible(false);
        setTimeout(() => publishingStore.reset(), 300);
    };

    const handleViewItem = () => {
        if (state.itemUAL) {
            if (state.itemType === 'profile') {
                // Navigate to the user's profile
                // We might need the username here, but for now we can redirect to dashboard or construct URL if we had username
                // Since we don't have username in store, let's redirect to dashboard which usually shows profile or has link
                navigate('/dashboard');
            } else {
                navigate('/dashboard/projects');
            }
            handleDismiss();
        }
    };

    if (!isVisible || state.status === 'idle' || isDismissed) {
        return null;
    }

    const isProfile = state.itemType === 'profile';

    return (
        <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
            <div className="bg-background-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[320px] max-w-[400px]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {state.status === 'publishing' && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                            {state.status === 'success' && (
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                            {state.status === 'error' && (
                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-semibold text-text-primary">
                                    {state.status === 'publishing' && `Publishing ${isProfile ? 'Profile' : 'Project'}`}
                                    {state.status === 'success' && 'Published Successfully!'}
                                    {state.status === 'error' && 'Publishing Failed'}
                                </h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {state.itemName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-text-muted hover:text-text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                {state.status === 'publishing' && (
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-text-secondary">Publishing to DKG</span>
                            <span className="text-xs font-medium text-text-primary">{state.progress}%</span>
                        </div>
                        <div className="h-2 bg-background-elevated rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                                style={{ width: `${state.progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-text-muted mt-3">
                            You can navigate to other pages while this completes
                        </p>
                    </div>
                )}

                {/* Success State */}
                {state.status === 'success' && (
                    <div className="px-5 py-4">
                        <p className="text-sm text-text-secondary mb-3">
                            Your {isProfile ? 'profile' : 'project'} is now on the Decentralized Knowledge Graph!
                        </p>
                        {state.itemUAL && (
                            <div className="bg-background-elevated rounded-lg p-3 mb-3">
                                <p className="text-xs text-text-muted mb-1">{isProfile ? 'Profile' : 'Project'} UAL</p>
                                <code className="text-xs text-accent break-all">{state.itemUAL}</code>
                            </div>
                        )}
                        <button
                            onClick={handleViewItem}
                            className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
                        >
                            {isProfile ? 'View Profile' : 'View Projects'}
                        </button>
                    </div>
                )}

                {/* Error State */}
                {state.status === 'error' && (
                    <div className="px-5 py-4">
                        <p className="text-sm text-red-400 mb-3">{state.error}</p>
                        <button
                            onClick={handleDismiss}
                            className="w-full px-4 py-2 bg-background-elevated text-text-primary rounded-lg hover:bg-background-elevated/80 transition-colors text-sm font-medium"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
