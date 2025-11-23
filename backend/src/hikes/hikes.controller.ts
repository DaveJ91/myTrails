import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { HikesService } from './hikes.service';
import { Hike } from './hike.entity';

@Controller('hikes')
export class HikesController {
    constructor(private readonly hikesService: HikesService) { }

    @Get()
    findAll() {
        return this.hikesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.hikesService.findOne(id);
    }

    @Post()
    create(@Body() hike: Partial<Hike>) {
        return this.hikesService.create(hike);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() hike: Partial<Hike>) {
        return this.hikesService.update(id, hike);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.hikesService.remove(id);
    }

    @Post(':id/logistics')
    generateLogistics(@Param('id') id: string) {
        return this.hikesService.generateLogistics(id);
    }

    @Post(':id/accommodation')
    generateAccommodation(@Param('id') id: string) {
        return this.hikesService.generateAccommodation(id);
    }

    @Post('analyze-gpx')
    analyzeGpx(@Body() body: { gpxContent: string }) {
        return this.hikesService.analyzeGpx(body.gpxContent);
    }
}
