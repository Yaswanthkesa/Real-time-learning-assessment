import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface User extends IUser {}
    
    interface Request {
      user?: {
        id: string;
        role?: 'teacher' | 'student';
        email?: string;
        name?: string;
      };
    }
  }
}

export {};
