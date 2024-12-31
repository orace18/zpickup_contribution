export interface User {
  _id: string; // Remplacez `id` par `_id` pour correspondre à la réponse du serveur
  phone_number: string;
  password: string;
  verification_code: string | null;
  birthday: string;
  user_type: string; // Ajoutez les valeurs spécifiques si nécessaire
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  token_version: number;
  address: string;
  email_address: string | null;
  firstname: string;
  lastname: string;
  sponsorship_code: string;
  race: string | null;
  zem?: string; // Ajoutez cette propriété car elle est présente dans certains objets
}
