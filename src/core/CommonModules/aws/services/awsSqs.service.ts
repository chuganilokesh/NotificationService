import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AWSSqsService {
    async receiveMessage(params: AWS.SQS.ReceiveMessageRequest): Promise<string[]> {
        console.log('recieveMessages');
        return ['message1', 'message2'];
      }
    
    async deleteMessage(params: AWS.SQS.DeleteMessageRequest): Promise<any> {
        console.log('deleteMessage');
    }
}