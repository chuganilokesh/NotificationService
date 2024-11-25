export enum BACK_OFF_POLICY { 
    FIXED = 'FIXED',
    EXPONENTIAL = 'EXPONENTIAL'
}

export interface RetryOptions {
    maxRetries: number;
    backoffPolicy: BACK_OFF_POLICY;
    initialDelay: number;
}