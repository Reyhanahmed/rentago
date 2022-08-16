import { Module } from '@nestjs/common';
import { ApartmentsModule } from './apartments/apartments.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';

import { ConfigurationModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigurationModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    FilesModule,
    ApartmentsModule,
    CaslModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
