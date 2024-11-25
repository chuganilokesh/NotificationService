import { NOTIFICATION_CHANNEL, NOTIFICATION_PRIORITY, NOTIFICATION_TYPE } from "../../commonModels/notification";

export interface EmailProcessorRequest {
    type: NOTIFICATION_TYPE;
    priority: NOTIFICATION_PRIORITY;
    customerId: string;
    sourceOrigin: string;
    message: string;
    channel: NOTIFICATION_CHANNEL;
    scheduleTime?: Date; //if type is scheduled then scheduleTime is required
    templateId: string;
}