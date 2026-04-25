export type AdminUserSummary = {
  id: number;
  fullName: string;
  email: string;
  department: string | null;
  active: boolean;
  roles: string[];
};
