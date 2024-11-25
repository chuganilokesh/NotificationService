import { Injectable, OnModuleInit } from '@nestjs/common';
import { BACK_OFF_POLICY } from '../../../commonModels/retryMechanism';

@Injectable()
export class AWSAppConfigService implements OnModuleInit {
    private appConfig: AppConfig;
    onModuleInit() {
        console.log('call aws app config service and updateapConfig variable periodically');
    }

    getAppConfig(): AppConfig {
        return this.appConfig;
    }
}

export interface AppConfig {
    HIGH_PRIORITY_QUEUE: string;
    MEDIUM_PRIORITY_QUEUE: string;
    LOW_PRIORITY_QUEUE: string;
    DEFAULT_QUEUE_POINTS: number;
    DEFAULT_QUEUE_DURATION: number;
    MAX_SQS_MESSAGES: number;
    SQS_WAIT_TIME_IN_SEC: number;
    CRON_JOB_SCHEDULE_TIME_IN_MIN: number;
    EMAIL_SERVICE_MAX_RETRY_COUNT: number;
    EMAIL_SERVICE_RETRY_BACK_OFF_POLICY: BACK_OFF_POLICY
    EMAIL_SERVICE_RETRY_INITIAL_DELAY: number;
}