export interface Permission {
  _id: string;
  key: string;
  name: string;
  description: string;
  group: string;
}

export interface GroupedPermissions {
  [key: string]: Permission[];
}
