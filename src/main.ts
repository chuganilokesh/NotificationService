import { VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import * as process from 'process';

import { AppModule } from './app.module';
import { AWSAppConfigService } from './core/CommonModules/aws/services/awsAppConfig.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    cors: true,
  });

  const awsAppConfigService: AWSAppConfigService = app.get<AWSAppConfigService>(AWSAppConfigService);
  await awsAppConfigService.onModuleInit();

  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, PUT, PATCH, POST, DELETE, OPTIONS',
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.setGlobalPrefix('notifications');

  const PORT = process.env.PORT || 8080;
  await app.listen(PORT);
}

bootstrap();
