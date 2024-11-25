import {
    Body,
    Controller,
    Post,
  } from '@nestjs/common';
import { SendNotificationRequest } from './notification.model';
import { NotificationValidator } from './notification.validator';
import { NotificationCoreService } from './notification.service';

@Controller('notification')
export class NotificationManagementController {
    constructor(
        private readonly notificationValidator: NotificationValidator,
        private readonly notificationCoreService: NotificationCoreService
        ) {}

  @Post('/register')
  async registerCustomer(
    @Body() reqBody: SendNotificationRequest
  ) {
    try {
    console.log('request payload', reqBody);
    const validateResp = await this.notificationValidator.validateSendNotificationRequestBody(reqBody);
    if (!validateResp.status) return validateResp;

    const serviceResp = await this.notificationCoreService.sendNotification(reqBody);
    console.log('response payload', reqBody);
    return serviceResp;
    } catch(err) {
        return {
            status: false,
            error: 'internal server error',
            statusCode: 500
        }
    }
  }
}