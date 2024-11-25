import { BACK_OFF_POLICY, RetryOptions } from "../../commonModels/retryMechanism";
import { NotificationProcessorRequest } from "../globalProcessor/globalProcessor.model";


export class EmailProcessorService {
  async process(reqBody: NotificationProcessorRequest,retryOptions: RetryOptions) {
    let delay = retryOptions.initialDelay;
    const retriesLeft = retryOptions.maxRetries;
    try {
        const resp = await this.processEmailDelivery(reqBody);
        if (!resp.status && resp.code === 'RETRY') {
            throw new Error('email delivery failed');
        }
    } catch (err) {
        console.log('failed to send notification', err?.message)
        if (retriesLeft > 0) {
            delay = retryOptions.backoffPolicy === BACK_OFF_POLICY.EXPONENTIAL ? delay * 2 : delay;
            console.log(`retrying in ${delay} ms`);

            await this.delay(delay)
        }
        else {
            return {
                status: false,
                error: '',
                code: '02' //retry with smsService
            }
        }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async processEmailDelivery(reqBody: NotificationProcessorRequest) {
    return {
      status: true,
      response: null,
      code: "00",
    };
  }
}
