import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HikesModule } from './hikes/hikes.module';
import { Hike } from './hikes/hike.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'mytrails',
      entities: [Hike],
      synchronize: true, // Auto-create tables (dev only)
    }),
    HikesModule,
  ],
})
export class AppModule { }
