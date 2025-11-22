import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hike } from './hike.entity';

@Injectable()
export class HikesService {
    constructor(
        @InjectRepository(Hike)
        private hikesRepository: Repository<Hike>,
    ) { }

    findAll(): Promise<Hike[]> {
        return this.hikesRepository.find({ order: { date: 'DESC' } });
    }

    async findOne(id: string): Promise<Hike> {
        const hike = await this.hikesRepository.findOneBy({ id });
        if (!hike) {
            throw new NotFoundException(`Hike with ID "${id}" not found`);
        }
        return hike;
    }

    create(hike: Partial<Hike>): Promise<Hike> {
        if (hike.gpxContent) {
            const { distance, elevationGain, location } = this.calculateGpxMetrics(hike.gpxContent);
            hike.distance = distance;
            hike.elevationGain = elevationGain;
            hike.location = location;
        }
        const newHike = this.hikesRepository.create(hike);
        return this.hikesRepository.save(newHike);
    }

    private calculateGpxMetrics(gpxContent: string): { distance: number; elevationGain: number; location: string } {
        const DOMParser = require('@xmldom/xmldom').DOMParser;
        const doc = new DOMParser().parseFromString(gpxContent, 'text/xml');
        const trkpts = doc.getElementsByTagName('trkpt');

        let totalDistance = 0;
        let totalElevationGain = 0;
        let lastLat = 0;
        let lastLon = 0;
        let lastEle = 0;

        if (trkpts.length > 0) {
            const firstPt = trkpts[0];
            const firstLat = parseFloat(firstPt.getAttribute('lat'));
            const firstLon = parseFloat(firstPt.getAttribute('lon'));
            lastLat = firstLat;
            lastLon = firstLon;

            const eleNode = firstPt.getElementsByTagName('ele')[0];
            if (eleNode && eleNode.textContent) {
                lastEle = parseFloat(eleNode.textContent);
            }

            for (let i = 1; i < trkpts.length; i++) {
                const pt = trkpts[i];
                const lat = parseFloat(pt.getAttribute('lat'));
                const lon = parseFloat(pt.getAttribute('lon'));

                // Distance
                totalDistance += this.getDistanceFromLatLonInKm(lastLat, lastLon, lat, lon);

                // Elevation
                const currentEleNode = pt.getElementsByTagName('ele')[0];
                if (currentEleNode && currentEleNode.textContent) {
                    const currentEle = parseFloat(currentEleNode.textContent);
                    const diff = currentEle - lastEle;
                    if (diff > 0) {
                        totalElevationGain += diff;
                    }
                    lastEle = currentEle;
                }

                lastLat = lat;
                lastLon = lon;
            }

            return {
                distance: parseFloat(totalDistance.toFixed(2)),
                elevationGain: parseFloat(totalElevationGain.toFixed(0)),
                location: `${firstLat.toFixed(4)}, ${firstLon.toFixed(4)}`
            };
        }

        return { distance: 0, elevationGain: 0, location: '' };
    }

    private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    async update(id: string, hike: Partial<Hike>): Promise<Hike> {
        if (hike.gpxContent) {
            const { distance, elevationGain, location } = this.calculateGpxMetrics(hike.gpxContent);
            hike.distance = distance;
            hike.elevationGain = elevationGain;
            hike.location = location;
        }
        await this.hikesRepository.update(id, hike);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.hikesRepository.delete(id);
    }

    async generateLogistics(id: string): Promise<string> {
        const hike = await this.findOne(id);
        if (!hike) {
            throw new NotFoundException(`Hike with ID "${id}" not found`);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);

            // Try multiple model names as fallbacks
            const modelNames = [
                // 1. The 'Latest' alias (Best for set-and-forget)
                "gemini-flash-latest",

                // 2. The current specific stable version (Best for reliability)
                "gemini-2.5-flash",

                // 3. High-intelligence fallback (If Flash fails)
                "gemini-2.5-pro",

                // 4. Cutting edge (The one you were trying to use earlier!)
                "gemini-3-pro-preview"
            ];

            let model;
            let lastError;

            for (const modelName of modelNames) {
                try {
                    model = genAI.getGenerativeModel({ model: modelName });

                    const prompt = `I am planning a hike at ${hike.title} ${hike.location ? `near ${hike.location}` : ''}. 
                    Please provide travel logistics from Dublin, Ireland. 

                    I want well laid out very pretty markdown

                    It should be extremely easy to read and understand

                    Give me an estimate of the cost (a range) for each of the different transport options
                    Include nearest airports, bus and rail options to reach the trailhead. 
                    Keep it concise and practical.`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    return response.text();
                } catch (error) {
                    console.log(`Failed with model ${modelName}:`, error.message);
                    lastError = error;
                    continue;
                }
            }

            throw lastError || new Error('All model attempts failed');
        } catch (error) {
            console.error('Error generating logistics:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw new Error(`Failed to generate logistics: ${error.message}`);
        }
    }

    async generateAccommodation(id: string): Promise<string> {
        const hike = await this.findOne(id);
        if (!hike) {
            throw new NotFoundException(`Hike with ID "${id}" not found`);
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);

            // Try multiple model names as fallbacks
            const modelNames = [
                "gemini-flash-latest",
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "gemini-3-pro-preview"
            ];

            let model;
            let lastError;

            for (const modelName of modelNames) {
                try {
                    model = genAI.getGenerativeModel({ model: modelName });

                    const prompt = `I am planning a hike at ${hike.title} ${hike.location ? `near ${hike.location}` : ''}. 
                    Please provide information about Huts and Wildcamping options.
                    
                    I want well laid out very pretty markdown.
                    It should be extremely easy to read and understand.
                    
                    Include:
                    - List of nearby mountain huts (Refugios/Hütten) with approximate costs and booking info if available.
                    - Wildcamping regulations in this specific area (is it allowed? tolerated? strictly forbidden?).
                    - Recommended spots if wildcamping is possible.
                    
                    Keep it concise and practical.`;

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    return response.text();
                } catch (error) {
                    console.log(`Failed with model ${modelName}:`, error.message);
                    lastError = error;
                    continue;
                }
            }

            throw lastError || new Error('All model attempts failed');
        } catch (error) {
            console.error('Error generating accommodation info:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw new Error(`Failed to generate accommodation info: ${error.message}`);
        }
    }
}
