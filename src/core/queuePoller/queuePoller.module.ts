import { Module } from '@nestjs/common';
import { QueuePollerService } from "./queuePoller.service";

@Module({
  imports: [],
  providers: [QueuePollerService],
  exports: [QueuePollerService],
})
export class QueuePollerModule {}
