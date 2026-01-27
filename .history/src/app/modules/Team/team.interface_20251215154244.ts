import { Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  designation: string;
  photo: string;
  bio?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  displayOrder?: number; // To control who shows up first (e.g. CEO = 1)
  createdAt: Date;
  updatedAt: Date;
}
