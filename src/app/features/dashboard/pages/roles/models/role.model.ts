export interface Role {
  _id?: string;
  key: string;
  name: string;
  description?: string;
  permissions: string[];
}
