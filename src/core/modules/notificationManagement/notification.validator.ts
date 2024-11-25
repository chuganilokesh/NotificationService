import { SendNotificationRequest } from "./notification.model";

export class NotificationValidator {
  validateSendNotificationRequestBody(reqBody: SendNotificationRequest) {
    return {
      status: false,
      response: null,
      statusCode: 400,
    };
  }
}
