import { Injectable, OnModuleInit } from "@nestjs/common";
import { AWSAppConfigService } from "../CommonModules/aws/services/awsAppConfig.service";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { AWSSqsService } from "../CommonModules/aws/services/awsSqs.service";
import { GlobalQueueProcessorService } from "../queueProcessors/globalProcessor/globalProcessor.service";

@Injectable()
export class QueuePollerService implements OnModuleInit {
  constructor(
    private readonly appConfig: AWSAppConfigService,
    private readonly awsSqsService: AWSSqsService,
    private readonly globalQueueProcessorService: GlobalQueueProcessorService
  ) {}

  private async setupQueueListeners() {
    const queueUrlList = this.fetchQueueUrlList();
    const defaultPoints = this.appConfig.getAppConfig().DEFAULT_QUEUE_POINTS;
    const defaultDuration =
      this.appConfig.getAppConfig().DEFAULT_QUEUE_DURATION;

    let queueProcessingRateLimiter = new RateLimiterMemory({
      points: defaultPoints,
      duration: defaultDuration,
      blockDuration: Math.round(defaultDuration / defaultPoints),
    });

    queueUrlList.forEach((queueUrl) => {
      this.spawnWorkers(queueProcessingRateLimiter, 1, queueUrl, queueUrl);
    });
  }

  private spawnWorkers(
    rateLimiter: RateLimiterMemory,
    workerCount,
    queueUrl,
    eventName
  ) {
    //create possible workers for a queue
    for (let i = 0; i < workerCount; i++) {
      try {
        this.consumeMessages(rateLimiter, queueUrl, eventName).then(() =>
          console.info("Worker completed")
        );
      } catch (err) {
        console.error("Exception occurred", { error: err.message || err.name });
        break;
      }
    }
    return true;
  }

  private async consumeMessages(
    rateLimiter: RateLimiterMemory,
    queueUrl: string,
    eventName: string
  ) {
    while (true) {
      try {
        const messages: string[] = await this.recieveMessagesFromQueue(
          queueUrl
        );

        for (const message of messages) {
          console.log("received queue message", message);
          await this.process(
            message,
            rateLimiter,
            eventName,
            queueUrl
          );
        }
      } catch (err) {
        console.log("exception occured");
        break;
      }
    }
  }

  //rate limiting and processing
  private async process(
    message: string,
    rateLimiter: RateLimiterMemory,
    eventName: string,
    queueUrl: string
  ): Promise<any> {
    return new Promise((resolve) => {
      const isJsonBody = this.isJson(message);
      let msgBody;
      if (isJsonBody.status) {
        msgBody = isJsonBody.response;
      } else {
        console.log("incorrect payload format");
        return {
          status: false,
        };
      }

      return rateLimiter
        .consume(eventName, 1)
        .then(async (res) => {
          const processResponse = await this.globalQueueProcessorService.process(msgBody);
          return resolve(processResponse);
        })
        .catch((err) => {
          console.log(err.message);
          setTimeout(async () => {
            const processResponse = await this.process(
              message,
              rateLimiter,
              eventName,
              queueUrl
            );
            resolve(processResponse);
          }, 1000);
        });
    });
  }

  private isJson(str: string) {
    try {
      const json = JSON.parse(str);
      return {
        status: true,
        response: json,
      };
    } catch (err) {
      return {
        status: false,
      };
    }
  }

  private async recieveMessagesFromQueue(queueUrl: string): Promise<string[]> {
    const params = {
      QueueUrl: queueUrl,
      MaxNumberOfMessages: this.appConfig.getAppConfig().MAX_SQS_MESSAGES,
      WaitTimeSeconds: this.appConfig.getAppConfig().SQS_WAIT_TIME_IN_SEC,
    };
    return await this.awsSqsService.receiveMessage(params);
  }

  private fetchQueueUrlList(): string[] {
    const highPriorityQueue = this.appConfig.getAppConfig().HIGH_PRIORITY_QUEUE;
    const mediumPriorityQueue =
      this.appConfig.getAppConfig().MEDIUM_PRIORITY_QUEUE;
    const lowPriorityQueue = this.appConfig.getAppConfig().LOW_PRIORITY_QUEUE;
    return [highPriorityQueue, mediumPriorityQueue, lowPriorityQueue];
  }

  async onModuleInit(): Promise<void> {
    this.setupQueueListeners();
  }
}
