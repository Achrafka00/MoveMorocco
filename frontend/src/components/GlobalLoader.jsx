import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * GlobalLoader component
 * Intercepts all window.fetch calls to trigger a global loading toast.
 * Tracks active request count to handle concurrent requests properly.
 */
const GlobalLoader = () => {
    const { loading, dismiss } = useToast();
    const activeRequests = useRef(0);
    const loaderId = useRef(null);

    useEffect(() => {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            // Only show loader if no requests are currently active
            if (activeRequests.current === 0) {
                loaderId.current = loading('Wait a moment...');
            }
            activeRequests.current++;

            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                activeRequests.current--;
                // If all requests completed, dismiss loader
                if (activeRequests.current === 0 && loaderId.current) {
                    dismiss(loaderId.current);
                    loaderId.current = null;
                }
            }
        };

        // Cleanup on unmount
        return () => {
            window.fetch = originalFetch;
        };
    }, [loading, dismiss]);

    return null;
};

export default GlobalLoader;
