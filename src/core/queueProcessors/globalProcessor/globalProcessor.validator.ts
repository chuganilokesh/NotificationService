import { NotificationProcessorRequest } from "./globalProcessor.model";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GlobalNotificationProcessorValidator {
    notificationProcessorRequestValidator(reqBody: NotificationProcessorRequest) {
        return {
            status: true,
            response: null
        }
    }
}