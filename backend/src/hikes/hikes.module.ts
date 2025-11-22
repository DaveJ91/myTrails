import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HikesService } from './hikes.service';
import { HikesController } from './hikes.controller';
import { Hike } from './hike.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hike])],
    providers: [HikesService],
    controllers: [HikesController],
})
export class HikesModule { }
