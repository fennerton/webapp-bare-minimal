export type LoginCredential = { login: string; password: string };

export type Authentication = {
  staffId: string;
  name: string;
  email: string;
  avatar: string;
  role: ApplicationRole;
};

export interface ApplicationRole {
  name: string;
  rights: string[];
}

export interface ApplicationRight {
  name: string,
  description: string,
  group: string,
}