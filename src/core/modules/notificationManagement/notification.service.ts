import { SendNotificationRequest } from "./notification.model";

export class NotificationCoreService {
  async sendNotification(reqBody: SendNotificationRequest) {
    try {
      const resp = await this.sendNotificationHandler(reqBody);
      //transaduce the response
      return resp;
    } catch (err) {
      console.log(err);

      return {
        status: false,
        error: err?.message,
      };
    }
  }

  private async sendNotificationHandler(reqBody: SendNotificationRequest) {
    reqBody.notifications.forEach((notification) => {
      //push  the notification payload to sns
    });
  }
}
