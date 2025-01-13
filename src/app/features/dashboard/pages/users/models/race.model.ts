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
  status: 'pending' | 'accepted' | 'end';
  pending_at: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  service_duration?: number;
  service_km?: number;
  zem?: Zem;
  latitude_start?: number;  // Changé de string à number
  longitude_start?: number; // Changé de string à number
  latitude_end?: number;
  longitude_end?: number;
  started_at?: string;     // Ajouté
  ended_at?: string;       // Ajouté
}

export interface Zem {
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
}

// Cette interface ZemUser n'apparaît pas directement dans la réponse API
// Si vous en avez besoin, voici comment elle pourrait être définie :
export interface ZemUser {
  _id: string;
  firstname: string;
  lastname: string;
  phone_number: string;
  user_profile_image?: string;  // Renommé de profile_picture pour correspondre au format de l'API
}
