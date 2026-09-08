export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
}

export type AuthUser = Omit<User, 'password'>;