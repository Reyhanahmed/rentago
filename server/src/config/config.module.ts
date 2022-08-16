import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import validationSchema from './validationSchema';

const ENV = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV === 'development' ? '.env' : '.env.production',
      validationSchema,
    }),
  ],
})
export class ConfigurationModule {}
