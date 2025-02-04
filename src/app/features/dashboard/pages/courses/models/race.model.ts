import { Race } from "../../users/models/race.model";

export interface RaceHistory{
    _id: string;
    status: string;
    street: string;
    locality: string;
    country: string;
    race:string;
    otherRaceData: Race;
    created_at: Date;
    updated_at: Date;
}