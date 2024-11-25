import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { QueuePollerModule } from './core/queuePoller/queuePoller.module';
import { AWSModule } from './core/CommonModules/aws/aws.module';

@Module({
    imports: [AWSModule, QueuePollerModule],
    providers: [],
    exports: [],
  })
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        console.log('add middleware such as authMiddleware to authenticate request');
    }
}