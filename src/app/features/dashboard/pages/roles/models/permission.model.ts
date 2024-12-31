export interface Permission {
  _id: string;
  key: string;
  name: string;
  description: string;
  group: string;
  __v: number;
}

export interface PermissionsResponse {
  [groupName: string]: Permission[];
}
