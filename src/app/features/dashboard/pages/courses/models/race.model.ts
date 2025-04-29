export interface RaceHistory {
    _id: string;
    user: string;
    race: {
        _id: string;
        reference: string;
        longitude_start: number;
        latitude_start: number;
    };
    status: string;
    latitude: number;
    longitude: number;
    street: string;
    locality: string;
    country: string;
    created_at: Date;
    updated_at: Date;

}