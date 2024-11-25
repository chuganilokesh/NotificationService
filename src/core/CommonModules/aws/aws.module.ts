import { Module } from '@nestjs/common';
import { AWSAppConfigService } from './services/awsAppConfig.service';

@Module({
    imports: [],
    providers: [AWSAppConfigService],
    exports: [AWSAppConfigService],
  })
export class AWSModule {}