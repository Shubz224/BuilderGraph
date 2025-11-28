import { api } from '../services/api';
import { userStore } from './userStore';

/**
 * Publishing Store - Global state management for project publishing
 * Allows background publishing with progress tracking across all pages
 */

type PublishingStatus = 'idle' | 'publishing' | 'success' | 'error';
type ItemType = 'project' | 'profile';

interface PublishingState {
    status: PublishingStatus;
    progress: number;
    itemType: ItemType | null;
    itemName: string | null;
    itemUAL: string | null;
    error: string | null;
}

type StateListener = (state: PublishingState) => void;

class PublishingStore {
    private state: PublishingState = {
        status: 'idle',
        progress: 0,
        itemType: null,
        itemName: null,
        itemUAL: null,
        error: null,
    };

    private listeners: Set<StateListener> = new Set();

    /**
     * Subscribe to state changes
     */
    subscribe(listener: StateListener): () => void {
        this.listeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Notify all listeners of state change
     */
    private notify(): void {
        this.listeners.forEach((listener) => listener(this.state));
    }

    /**
     * Get current state
     */
    getState(): PublishingState {
        return { ...this.state };
    }

    /**
     * Start publishing an item
     */
    startPublishing(itemType: ItemType, itemName: string): void {
        this.state = {
            status: 'publishing',
            progress: 0,
            itemType,
            itemName,
            itemUAL: null,
            error: null,
        };
        this.notify();
    }

    /**
     * Update publishing progress
     */
    updateProgress(progress: number): void {
        if (this.state.status === 'publishing') {
            this.state = {
                ...this.state,
                progress: Math.min(Math.max(progress, 0), 100),
            };
            this.notify();
        }
    }

    /**
     * Mark publishing as successful
     */
    setSuccess(itemUAL: string): void {
        this.state = {
            ...this.state,
            status: 'success',
            progress: 100,
            itemUAL,
            error: null,
        };
        this.notify();
    }

    /**
     * Mark publishing as failed
     */
    setError(error: string): void {
        this.state = {
            ...this.state,
            status: 'error',
            error,
        };
        this.notify();
    }

    /**
     * Reset to idle state
     */
    reset(): void {
        this.state = {
            status: 'idle',
            progress: 0,
            itemType: null,
            itemName: null,
            itemUAL: null,
            error: null,
        };
        this.notify();
    }

    /**
     * Check if currently publishing
     */
    isPublishing(): boolean {
        return this.state.status === 'publishing';
    }

    /**
     * Monitor profile publishing status
     */
    async monitorProfilePublishing(): Promise<void> {
        if (this.state.status !== 'publishing' || this.state.itemType !== 'profile') {
            return;
        }

        const maxAttempts = 100; // 5 minutes max (100 * 3s)
        let attempts = 0;

        while (attempts < maxAttempts) {
            attempts++;

            // Check if we should stop polling (e.g. user cancelled or state changed externally)
            if (this.state.status !== 'publishing') {
                return;
            }

            try {
                // Fetch updated user data
                const response = await api.getCurrentUser();

                if (response.success && response.authenticated && response.user) {
                    const user = response.user;

                    // Update progress
                    // We simulate progress since we don't get exact percentage from backend for profile
                    this.updateProgress(Math.min(10 + (attempts * 2), 90));

                    if (user.publish_status === 'completed' && user.ual) {
                        // Publishing completed successfully!
                        console.log('🎉 Profile published successfully!', user.ual);

                        // Save to localStorage
                        userStore.saveUserProfile(user);

                        this.setSuccess(user.ual);
                        return;
                    } else if (user.publish_status === 'failed') {
                        // Publishing failed
                        this.setError('DKG profile publishing failed');
                        return;
                    }
                    // Otherwise, keep polling (status is 'publishing' or 'pending')
                }
            } catch (error) {
                console.error('Polling error:', error);
                this.setError(error instanceof Error ? error.message : 'Failed to publish profile to DKG');
                return;
            }

            // Wait 3 seconds before next poll
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        // Timeout
        if (this.state.status === 'publishing') {
            this.setError('Profile publishing timed out. Please try again later.');
        }
    }
    /**
     * Monitor project publishing status
     */
    async monitorProjectPublishing(operationId: string): Promise<void> {
        if (this.state.status !== 'publishing' || this.state.itemType !== 'project') {
            return;
        }

        try {
            // Wait for publishing to complete with progress updates
            const finalStatus = await api.waitForProjectPublishing(
                operationId,
                (status) => {
                    // We can map status steps to progress if available, or just increment
                    // For now, let's just ensure we show some progress
                    // The API polling inside waitForProjectPublishing doesn't give percentage, 
                    // but we can simulate or just rely on the fact that it's "publishing"
                    // Let's increment progress slowly if we could, but here we just get status updates
                    // We can assume if we get a status update, we are making progress
                    this.updateProgress(Math.min(this.state.progress + 10, 90));
                }
            );

            if (finalStatus.success && finalStatus.status === 'completed' && finalStatus.ual) {
                console.log('🎉 Project published successfully!', finalStatus);
                this.setSuccess(finalStatus.ual);
            } else {
                console.error('❌ Project publishing failed:', finalStatus);
                this.setError(finalStatus.error || 'Project publishing failed');
            }
        } catch (error) {
            console.error('❌ Project publishing error:', error);
            this.setError(error instanceof Error ? error.message : 'Failed to publish project');
        }
    }
}

export const publishingStore = new PublishingStore();
export default publishingStore;
