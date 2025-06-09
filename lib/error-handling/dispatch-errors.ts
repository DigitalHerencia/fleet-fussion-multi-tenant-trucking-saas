import { toast } from '@/hooks/use-toast';

/**
 * Enhanced error handling and recovery system for dispatch operations
 */

export interface DispatchError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
  userAction?: string;
  timestamp: Date;
}

export interface ErrorRecoveryAction {
  label: string;
  action: () => Promise<void> | void;
  primary?: boolean;
}

// Error categories for dispatch operations
export enum DispatchErrorCode {
  // Validation errors
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  DRIVER_UNAVAILABLE = 'DRIVER_UNAVAILABLE',
  VEHICLE_UNAVAILABLE = 'VEHICLE_UNAVAILABLE',
  LOAD_IMMUTABLE = 'LOAD_IMMUTABLE',
  ASSIGNMENT_CONFLICT = 'ASSIGNMENT_CONFLICT',
  
  // Business rule violations
  MISSING_DRIVER_ASSIGNMENT = 'MISSING_DRIVER_ASSIGNMENT',
  MISSING_VEHICLE_ASSIGNMENT = 'MISSING_VEHICLE_ASSIGNMENT',
  EQUIPMENT_MISMATCH = 'EQUIPMENT_MISMATCH',
  WEIGHT_EXCEEDED = 'WEIGHT_EXCEEDED',
  
  // System errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  
  // Load operation errors
  LOAD_NOT_FOUND = 'LOAD_NOT_FOUND',
  DUPLICATE_REFERENCE = 'DUPLICATE_REFERENCE',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  
  // Real-time update errors
  LOCATION_UPDATE_FAILED = 'LOCATION_UPDATE_FAILED',
  STATUS_SYNC_FAILED = 'STATUS_SYNC_FAILED',
}

// Error classification and user-friendly messages
const ERROR_DEFINITIONS: Record<DispatchErrorCode, {
  message: string;
  recoverable: boolean;
  userAction?: string;
}> = {
  [DispatchErrorCode.INVALID_STATUS_TRANSITION]: {
    message: 'Cannot change load status due to business rules',
    recoverable: true,
    userAction: 'Check current status and allowed transitions',
  },
  [DispatchErrorCode.DRIVER_UNAVAILABLE]: {
    message: 'Selected driver is not available for assignment',
    recoverable: true,
    userAction: 'Choose a different driver or resolve conflicts',
  },
  [DispatchErrorCode.VEHICLE_UNAVAILABLE]: {
    message: 'Selected vehicle is not available for assignment',
    recoverable: true,
    userAction: 'Choose a different vehicle or resolve conflicts',
  },
  [DispatchErrorCode.LOAD_IMMUTABLE]: {
    message: 'Load cannot be modified in current status',
    recoverable: false,
    userAction: 'Load is in a final state and cannot be changed',
  },
  [DispatchErrorCode.ASSIGNMENT_CONFLICT]: {
    message: 'Assignment conflicts with existing load assignments',
    recoverable: true,
    userAction: 'Resolve conflicting assignments first',
  },
  [DispatchErrorCode.MISSING_DRIVER_ASSIGNMENT]: {
    message: 'Driver assignment required for this operation',
    recoverable: true,
    userAction: 'Assign a driver before proceeding',
  },
  [DispatchErrorCode.MISSING_VEHICLE_ASSIGNMENT]: {
    message: 'Vehicle assignment required for this operation',
    recoverable: true,
    userAction: 'Assign a vehicle before proceeding',
  },
  [DispatchErrorCode.EQUIPMENT_MISMATCH]: {
    message: 'Vehicle equipment does not match load requirements',
    recoverable: true,
    userAction: 'Choose compatible vehicle or update requirements',
  },
  [DispatchErrorCode.WEIGHT_EXCEEDED]: {
    message: 'Load weight exceeds vehicle capacity',
    recoverable: true,
    userAction: 'Choose a vehicle with higher capacity',
  },
  [DispatchErrorCode.DATABASE_ERROR]: {
    message: 'Database operation failed',
    recoverable: true,
    userAction: 'Please try again in a moment',
  },
  [DispatchErrorCode.NETWORK_ERROR]: {
    message: 'Network connection problem',
    recoverable: true,
    userAction: 'Check your connection and try again',
  },
  [DispatchErrorCode.AUTHORIZATION_ERROR]: {
    message: 'You do not have permission for this action',
    recoverable: false,
    userAction: 'Contact administrator for access',
  },
  [DispatchErrorCode.RATE_LIMIT_ERROR]: {
    message: 'Too many requests, please slow down',
    recoverable: true,
    userAction: 'Wait a moment before trying again',
  },
  [DispatchErrorCode.LOAD_NOT_FOUND]: {
    message: 'Load could not be found',
    recoverable: false,
    userAction: 'Refresh the page or check load reference',
  },
  [DispatchErrorCode.DUPLICATE_REFERENCE]: {
    message: 'Load reference number already exists',
    recoverable: true,
    userAction: 'Use a different reference number',
  },
  [DispatchErrorCode.INVALID_DATE_RANGE]: {
    message: 'Invalid pickup or delivery date range',
    recoverable: true,
    userAction: 'Check dates and ensure delivery is after pickup',
  },
  [DispatchErrorCode.LOCATION_UPDATE_FAILED]: {
    message: 'Failed to update load location',
    recoverable: true,
    userAction: 'Location will be retried automatically',
  },
  [DispatchErrorCode.STATUS_SYNC_FAILED]: {
    message: 'Failed to sync load status',
    recoverable: true,
    userAction: 'Status will be retried automatically',
  },
};

/**
 * Create a standardized dispatch error
 */
export function createDispatchError(
  code: DispatchErrorCode,
  details?: any,
  customMessage?: string
): DispatchError {
  const definition = ERROR_DEFINITIONS[code];
  
  return {
    code,
    message: customMessage || definition.message,
    details,
    recoverable: definition.recoverable,
    userAction: definition.userAction,
    timestamp: new Date(),
  };
}

/**
 * Enhanced error handler with recovery suggestions
 */
export class DispatchErrorHandler {
  private static instance: DispatchErrorHandler;
  private errorLog: DispatchError[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  static getInstance(): DispatchErrorHandler {
    if (!DispatchErrorHandler.instance) {
      DispatchErrorHandler.instance = new DispatchErrorHandler();
    }
    return DispatchErrorHandler.instance;
  }

  /**
   * Handle error with automatic recovery and user notification
   */
  async handleError(
    error: any,
    context: string,
    operationId?: string
  ): Promise<{
    error: DispatchError;
    recoveryActions: ErrorRecoveryAction[];
    shouldRetry: boolean;
  }> {
    let dispatchError: DispatchError;

    // Convert various error types to DispatchError
    if (error instanceof Error) {
      dispatchError = this.classifyError(error, context);
    } else if (typeof error === 'string') {
      dispatchError = createDispatchError(DispatchErrorCode.DATABASE_ERROR, null, error);
    } else {
      dispatchError = error as DispatchError;
    }

    // Log error
    this.errorLog.push(dispatchError);
    console.error('Dispatch Error:', {
      code: dispatchError.code,
      message: dispatchError.message,
      context,
      details: dispatchError.details,
      timestamp: dispatchError.timestamp,
    });

    // Determine retry logic
    const shouldRetry = this.shouldRetryOperation(dispatchError, operationId);

    // Generate recovery actions
    const recoveryActions = this.generateRecoveryActions(dispatchError, context);

    // Show user notification
    this.showUserNotification(dispatchError, shouldRetry);

    return {
      error: dispatchError,
      recoveryActions,
      shouldRetry,
    };
  }

  /**
   * Classify generic errors into dispatch-specific error codes
   */
  private classifyError(error: Error, context: string): DispatchError {
    const message = error.message.toLowerCase();

    // Network/connection errors
    if (message.includes('network') || message.includes('fetch')) {
      return createDispatchError(DispatchErrorCode.NETWORK_ERROR, error);
    }

    // Database errors
    if (message.includes('database') || message.includes('prisma') || message.includes('sql')) {
      return createDispatchError(DispatchErrorCode.DATABASE_ERROR, error);
    }

    // Permission errors
    if (message.includes('unauthorized') || message.includes('permission')) {
      return createDispatchError(DispatchErrorCode.AUTHORIZATION_ERROR, error);
    }

    // Business rule violations
    if (message.includes('driver') && message.includes('unavailable')) {
      return createDispatchError(DispatchErrorCode.DRIVER_UNAVAILABLE, error);
    }

    if (message.includes('vehicle') && message.includes('unavailable')) {
      return createDispatchError(DispatchErrorCode.VEHICLE_UNAVAILABLE, error);
    }

    if (message.includes('status') && message.includes('transition')) {
      return createDispatchError(DispatchErrorCode.INVALID_STATUS_TRANSITION, error);
    }

    if (message.includes('reference') && message.includes('exists')) {
      return createDispatchError(DispatchErrorCode.DUPLICATE_REFERENCE, error);
    }

    // Load not found
    if (message.includes('not found')) {
      return createDispatchError(DispatchErrorCode.LOAD_NOT_FOUND, error);
    }

    // Default to database error
    return createDispatchError(DispatchErrorCode.DATABASE_ERROR, error);
  }

  /**
   * Determine if operation should be retried
   */
  private shouldRetryOperation(error: DispatchError, operationId?: string): boolean {
    if (!error.recoverable || !operationId) {
      return false;
    }

    const retryCount = this.retryAttempts.get(operationId) || 0;
    
    // Check retry limit
    if (retryCount >= this.maxRetries) {
      this.retryAttempts.delete(operationId);
      return false;
    }

    // Only retry certain types of errors
    const retryableErrors = [
      DispatchErrorCode.DATABASE_ERROR,
      DispatchErrorCode.NETWORK_ERROR,
      DispatchErrorCode.RATE_LIMIT_ERROR,
      DispatchErrorCode.LOCATION_UPDATE_FAILED,
      DispatchErrorCode.STATUS_SYNC_FAILED,
    ];

    if (retryableErrors.includes(error.code as DispatchErrorCode)) {
      this.retryAttempts.set(operationId, retryCount + 1);
      return true;
    }

    return false;
  }

  /**
   * Generate contextual recovery actions
   */
  private generateRecoveryActions(error: DispatchError, context: string): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (error.code) {
      case DispatchErrorCode.DRIVER_UNAVAILABLE:
        actions.push({
          label: 'Select Different Driver',
          action: () => {
            // This would trigger driver selection dialog
            console.log('Open driver selection');
          },
          primary: true,
        });
        actions.push({
          label: 'View Driver Conflicts',
          action: () => {
            console.log('Show driver conflicts');
          },
        });
        break;

      case DispatchErrorCode.VEHICLE_UNAVAILABLE:
        actions.push({
          label: 'Select Different Vehicle',
          action: () => {
            console.log('Open vehicle selection');
          },
          primary: true,
        });
        actions.push({
          label: 'View Vehicle Status',
          action: () => {
            console.log('Show vehicle status');
          },
        });
        break;

      case DispatchErrorCode.INVALID_STATUS_TRANSITION:
        actions.push({
          label: 'View Valid Transitions',
          action: () => {
            console.log('Show status transition guide');
          },
          primary: true,
        });
        break;

      case DispatchErrorCode.DUPLICATE_REFERENCE:
        actions.push({
          label: 'Generate New Reference',
          action: () => {
            console.log('Auto-generate reference number');
          },
          primary: true,
        });
        break;

      case DispatchErrorCode.NETWORK_ERROR:
      case DispatchErrorCode.DATABASE_ERROR:
        actions.push({
          label: 'Retry Operation',
          action: async () => {
            // This would trigger the original operation retry
            console.log('Retrying operation');
          },
          primary: true,
        });
        actions.push({
          label: 'Save as Draft',
          action: () => {
            console.log('Save current state');
          },
        });
        break;

      default:
        if (error.recoverable) {
          actions.push({
            label: 'Try Again',
            action: () => {
              console.log('Generic retry');
            },
            primary: true,
          });
        }
        break;
    }

    // Always add a "Dismiss" action
    actions.push({
      label: 'Dismiss',
      action: () => {
        // Just close the error notification
      },
    });

    return actions;
  }

  /**
   * Show user-friendly error notification
   */
  private showUserNotification(error: DispatchError, willRetry: boolean): void {
    const title = willRetry ? 'Operation Failed - Retrying' : 'Operation Failed';
    
    let description = error.message;
    if (error.userAction) {
      description += `. ${error.userAction}`;
    }
    if (willRetry) {
      description += ' The operation will be retried automatically.';
    }

    // Use toast notification (in a real app, this would be called from client component)
    console.log('Show toast:', {
      title,
      description,
      variant: error.recoverable ? 'default' : 'destructive',
    });
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): DispatchError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
    this.retryAttempts.clear();
  }
}

/**
 * Utility function for handling async operations with error recovery
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  context: string,
  operationId?: string
): Promise<{
  success: boolean;
  data?: T;
  error?: DispatchError;
  recoveryActions?: ErrorRecoveryAction[];
}> {
  const errorHandler = DispatchErrorHandler.getInstance();

  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const { error: dispatchError, recoveryActions, shouldRetry } = 
      await errorHandler.handleError(error, context, operationId);

    // If should retry, attempt the operation again with exponential backoff
    if (shouldRetry) {
      const retryCount = errorHandler['retryAttempts'].get(operationId || '') || 1;
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000); // Max 10s delay
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        const data = await operation();
        errorHandler['retryAttempts'].delete(operationId || '');
        return { success: true, data };
      } catch (retryError) {
        // Handle retry failure
        const { error: finalError, recoveryActions: finalActions } = 
          await errorHandler.handleError(retryError, `${context} (retry failed)`, operationId);
        
        return {
          success: false,
          error: finalError,
          recoveryActions: finalActions,
        };
      }
    }

    return {
      success: false,
      error: dispatchError,
      recoveryActions,
    };
  }
}

/**
 * Validate operation and show user-friendly error messages
 */
export function validateAndShowErrors(
  validation: { isValid: boolean; errors: string[]; warnings: string[] },
  context: string
): boolean {
  if (!validation.isValid) {
    validation.errors.forEach(error => {
      console.log('Validation Error:', error);
      // In real implementation, show toast notification
    });
    return false;
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.log('Validation Warning:', warning);
      // In real implementation, show warning toast
    });
  }

  return true;
}
