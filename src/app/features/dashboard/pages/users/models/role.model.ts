export interface Role {
  _id: string;
  name: string;
  description: string;
}


export type CardType = 'identity_card' | 'cip_card' | 'passport_card';


export interface CardTypeLabels {
  [key: string]: string;
}
