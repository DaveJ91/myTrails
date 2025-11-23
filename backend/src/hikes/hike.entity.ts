import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hike {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @Column({ type: 'text', nullable: true })
    gpxContent: string;

    @Column('text', { array: true, default: [] })
    photos: string[];

    @Column('float', { nullable: true })
    distance: number; // in km

    @Column('float', { nullable: true })
    elevationGain: number; // in meters

    @Column({ nullable: true })
    location: string; // Start coordinates or place name

    @Column({ nullable: true })
    allTrailsUrl: string;

    @Column({ type: 'text', nullable: true })
    travelLogistics: string;

    @Column('simple-array', { nullable: true })
    countries: string[];

    @Column({ type: 'text', nullable: true })
    accommodation: string;

    @Column({ default: 'hiking' })
    activityType: 'hiking' | 'bicycletouring' | 'bikepacking';

    @Column({ type: 'text', nullable: true })
    coverImage: string;
}
