/**
 * Async Helper Utilities
 * Helper functions for handling async operations, polling, and retries
 */

/**
 * Poll a function with exponential backoff
 * @param {Function} fn - Async function to poll
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} initialDelay - Initial delay in ms (default: 2000)
 * @returns {Promise} Result of the function when it succeeds
 */
export async function pollWithBackoff(fn, maxAttempts = 30, initialDelay = 2000) {
    let attempt = 0;
    let delay = initialDelay;

    while (attempt < maxAttempts) {
        attempt++;

        try {
            const result = await fn();

            // If function returns a truthy result, consider it successful
            if (result) {
                return result;
            }

            // If no result yet, wait and try again
            if (attempt < maxAttempts) {
                await sleep(delay);
                // Exponential backoff with max 10 seconds
                delay = Math.min(delay * 1.5, 10000);
            }
        } catch (error) {
            // If it's the last attempt, throw the error
            if (attempt >= maxAttempts) {
                throw new Error(`Polling failed after ${maxAttempts} attempts: ${error.message}`);
            }

            // Otherwise, wait and retry
            await sleep(delay);
            delay = Math.min(delay * 1.5, 10000);
        }
    }

    throw new Error(`Polling timed out after ${maxAttempts} attempts`);
}

/**
 * Add timeout to a promise
 * @param {Promise} promise - Promise to add timeout to
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {string} errorMessage - Custom error message
 * @returns {Promise} Original promise or timeout error
 */
export async function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
    let timeoutHandle;

    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(errorMessage));
        }, timeoutMs);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        return result;
    } catch (error) {
        clearTimeout(timeoutHandle);
        throw error;
    }
}

/**
 * Retry a function with specified number of attempts
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise} Result of the function
 */
export async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt < maxRetries) {
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after error:`, error.message);
                await sleep(delay);
            }
        }
    }

    throw new Error(`Failed after ${maxRetries} retries: ${lastError.message}`);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Resolves after sleep duration
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch process items with concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} processFn - Async function to process each item
 * @param {number} concurrency - Max concurrent operations
 * @returns {Promise<Array>} Results array
 */
export async function batchProcess(items, processFn, concurrency = 5) {
    const results = [];
    const executing = [];

    for (const item of items) {
        const promise = processFn(item).then(result => {
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });

        results.push(promise);
        executing.push(promise);

        if (executing.length >= concurrency) {
            await Promise.race(executing);
        }
    }

    return Promise.all(results);
}

/**
 * Create a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);

        return new Promise((resolve) => {
            timeoutId = setTimeout(() => {
                resolve(fn.apply(this, args));
            }, delay);
        });
    };
}

export default {
    pollWithBackoff,
    withTimeout,
    retry,
    sleep,
    batchProcess,
    debounce
};
