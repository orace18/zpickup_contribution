import {User} from './users.model';

export interface Race {
  _id: string;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    phone_number: string;
    user_profile_image?: string;
    password: string;
    verification_code: string | null;
    birthday: string;
    user_type: string;
    created_at: string;
    updated_at: string;
    validated_at: string;
    token_version: number;
    sponsorship_code: string;
    race: string | null;
    fcm_token: string;
  };
  initial_longitude: number;
  initial_latitude: number;
  initial_datetime: string;
  reference: string;
  qrcode_start: string;
  qrcode_end: string;
  distance_traveled: number | null;
  status: RaceStatus;
  created_at: string;
  updated_at: string;
  service_duration?: number;
  service_km?: number;
  zem?: Zem;
  started_at?: string;
  ended_at?: string;
  start_datetime?: Date;
  pending_at?: Date;
  accepted_at?: Date;
  longitude_start?: number;
  latitude_start?: number;
  country_start?: string;
  street_start?: string;
  locality_start?: string;
  longitude_end?: number;
  latitude_end?: number;
  country_end?: string;
  street_end?: string;
  locality_end?: string;
  admin_bonus?: number;
  admin_percent?: number;
  customer_bonus?: number;
  customer_percent?: number;
  zem_bonus?: number;
  zem_percent?: number;
  amount_total?: number;
  amount_per_km?: number;
}

export type RaceStatus = 'pending' | 'accepted' | 'end' | 'stop' | 'start';

export interface Zem extends User{
  _id: string;
  card_type: string;
  card_number: string;
  card_image: string;
  zem_profile_image: string;
  image_of_residence_certificate: string;
  ifu_number_image: string;
  number_plate: string;
  plate_picture: string;
  profile_validation_status: string;
  service: boolean;
  validated_at: string;
  user: string;
  created_at: string;
  updated_at: string;
  service_latitude: number | null;
  service_longitude: number | null;
  ray?: string | null;
}


export interface ZemUser {
  _id: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  user_profile_image?: string;
}

