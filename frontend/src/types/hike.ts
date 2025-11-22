export interface Hike {
    id: string;
    title: string;
    description: string;
    date: string;
    gpxContent: string;
    photos: string[];
    distance?: number;
    elevationGain?: number;
    location?: string;
    allTrailsUrl?: string;
    travelLogistics?: string;
    accommodation?: string;
    countries?: string[];
}
