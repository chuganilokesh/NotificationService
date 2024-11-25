import { Injectable, OnModuleInit } from "@nestjs/common";
import { NotificationProcessorRequest } from "./globalProcessor.model";
import { GlobalNotificationProcessorValidator } from "./globalProcessor.validator";
import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TYPE,
} from "../../commonModels/notification";
import { AWSAppConfigService } from "../../CommonModules/aws/services/awsAppConfig.service";
import { EmailProcessorService } from "../emailProcessor/emailProcessor.service";
import { SMSProcessorService } from "../smsProcessor/smsProcessor.service";

@Injectable()
export class GlobalQueueProcessorService {
  constructor(
    private readonly validator: GlobalNotificationProcessorValidator,
    private readonly appConfig: AWSAppConfigService,
    private readonly emailProcessor: EmailProcessorService,
    private readonly smsService: SMSProcessorService
  ) {}

  async process(reqBody: NotificationProcessorRequest) {
    try {
      const validationResp =
        this.validator.notificationProcessorRequestValidator(reqBody);

      if (!validationResp.status) {
        //TODO: add Alert
        console.log("validation errror");
        return {
          status: true, //cannot process the validation error request again
          response: null,
        };
      }

      //Scheduled time notifications
      if (
        reqBody.type == NOTIFICATION_TYPE.SCHEDULED &&
        reqBody.scheduleTime.getTime() >
          Date.now() +
            this.appConfig.getAppConfig().CRON_JOB_SCHEDULE_TIME_IN_MIN *
              60 *
              60 *
              1000
      ) {
        //push the data into DB/dbProcessingQueue
        return {
          status: true,
          response: null,
        };
      }

      await this.processRequest(reqBody);
    } catch (err) {
      console.log("exception occured");
      return {
        status: false,
        error: err.message,
      };
    }
  }

  async processRequest(reqBody: NotificationProcessorRequest) {
    switch (reqBody.channel) {
      case NOTIFICATION_CHANNEL.EMAIL:
        await this.processEmailDeliveryWithRetry(reqBody);

      case NOTIFICATION_CHANNEL.SMS:
        await this.processSmsDelivery(reqBody);
    }
  }

  async processEmailDeliveryWithRetry(reqBody: NotificationProcessorRequest) {
    try {
      const resp = await this.emailProcessor.process(reqBody, {
        maxRetries: this.appConfig.getAppConfig().EMAIL_SERVICE_MAX_RETRY_COUNT,
        backoffPolicy:
          this.appConfig.getAppConfig().EMAIL_SERVICE_RETRY_BACK_OFF_POLICY,
        initialDelay:
          this.appConfig.getAppConfig().EMAIL_SERVICE_RETRY_INITIAL_DELAY,
      });
      if (!resp.status) {
        if (resp.code == "02") {
          const resp = await this.smsService.process();
          return resp;
        }
        throw new Error("emailDelivery failed");
      }

      return resp;
    } catch (err) {
      console.log("error occured", err.message);
      return {
        status: false,
        error: err.message,
      };
    }
  }

  async processSmsDelivery(reqBody: NotificationProcessorRequest) {
    const resp = await this.smsService.process();

    if (!resp.status) {
      if (resp.code == "02") {
        const emailProcessorResp = await this.emailProcessor.process(reqBody, {
          maxRetries:
            this.appConfig.getAppConfig().EMAIL_SERVICE_MAX_RETRY_COUNT,
          backoffPolicy:
            this.appConfig.getAppConfig().EMAIL_SERVICE_RETRY_BACK_OFF_POLICY,
          initialDelay:
            this.appConfig.getAppConfig().EMAIL_SERVICE_RETRY_INITIAL_DELAY,
        });
        return emailProcessorResp;
      }

      return resp;
    }

    return resp;
  }

  data = {
    channelMapping: {
      EMAIL: ["SMS"],
      WHATSAPP: ["SMS", "EMAIL"],
      SMS: ["EMAIL", "WHATSAPP"]
    },
  };

  async handleRetryLogic(channelType: NOTIFICATION_CHANNEL) {
    for(let channel of this.data.channelMapping[channelType]) {
        switch(channel) {
            case NOTIFICATION_CHANNEL.EMAIL:
                const resp = await this.emailProcessor()
        }
    }
  }

  
}
