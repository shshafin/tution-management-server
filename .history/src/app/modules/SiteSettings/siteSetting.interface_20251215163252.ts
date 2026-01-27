import { Document } from 'mongoose';

export interface ISiteSetting extends Document {
  siteName: string;
  logo: string; // URL
  email: string;
  phone: string;
  address: string;
  socialLinks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string; // New
    tiktok?: string; // New
    pinterest?: string; // New
    reddit?: string; // New
  };
  createdAt: Date;
  updatedAt: Date;
}
