import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_TYPE,
} from "../../commonModels/notification";

export interface SendNotificationRequest {
  notifications: notificationPayload[];
  sourceOrigin: string;
}

export interface notificationPayload {
  type: NOTIFICATION_TYPE;
  priority: NOTIFICATION_PRIORITY;
  customerId: string;
  message: string;
  channel: NOTIFICATION_CHANNEL;
  scheduleTime?: Date; //if type is scheduled then scheduleTime is required
  templateId: string;
}
