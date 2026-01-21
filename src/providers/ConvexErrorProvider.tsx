import { useEffect, ReactNode } from 'react';
import { ConvexError } from 'convex/values';
import { showErrorToast } from '../services/ToastService';

// Check if an error is a ConvexError (works across module boundaries)
function isConvexError(error: unknown): error is ConvexError<string> {
  if (error instanceof ConvexError) {
    return true;
  }
  // Fallback check for cases where instanceof fails (e.g., different module instances)
  if (error && typeof error === 'object' && error.constructor?.name === 'ConvexError') {
    return true;
  }
  return false;
}

// Extract a user-friendly message from ConvexError
function getErrorMessage(error: unknown): string {
  if (isConvexError(error)) {
    const data = error.data;
    // Handle string data
    if (typeof data === 'string') {
      return data;
    }
    // Handle object data with a message field
    if (data && typeof data === 'object' && 'message' in data) {
      return String((data as { message: unknown }).message);
    }
    // Fallback to stringifying the data
    return JSON.stringify(data);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

interface ConvexErrorProviderProps {
  children: ReactNode;
}

/**
 * Provider that catches unhandled ConvexErrors from mutations and shows them as toasts.
 * Wrap your app with this component to automatically display error toasts for any
 * mutation that throws a ConvexError without explicit error handling.
 */
export function ConvexErrorProvider({ children }: ConvexErrorProviderProps) {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;

      if (isConvexError(error)) {
        const message = getErrorMessage(error);
        showErrorToast(message);
        console.error('[ConvexError]', error.data);
        // Prevent the error from appearing in console as unhandled
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}
