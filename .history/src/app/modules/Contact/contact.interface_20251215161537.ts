import { Document } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean; // To mark if admin saw it
  createdAt: Date;
  updatedAt: Date;
}
