import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as cloudinary from 'cloudinary';

import { AppModule } from './app.module';
import HttpExceptionFilter from './utils/filters/httpException.filter';
import { ExcludeNullInterceptor } from './utils/interceptors/excludeNull.interceptor';
import { SerializationInterceptor } from './utils/interceptors/serialization.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    credentials: true,
    origin: configService.get('CLIENT_ORIGIN'),
  });
  app.setGlobalPrefix('/api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const mappedValidationErrors = validationErrors.map((error) => ({
          [error.property]: Object.values(error.constraints)[0],
        }));
        return new BadRequestException(mappedValidationErrors);
      },
    }),
  );
  app.useGlobalInterceptors(new ExcludeNullInterceptor());
  app.useGlobalInterceptors(new SerializationInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(cookieParser());
  cloudinary.v2.config({
    api_key: configService.get('CLOUDINARY_API_KEY'),
    api_secret: configService.get('CLOUDINARY_API_SECRET'),
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
  });
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
