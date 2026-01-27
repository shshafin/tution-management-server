import { Document } from 'mongoose';

export interface IResource extends Document {
  title: string;
  fileUrl: string; // The Cloudinary URL for the PDF
  createdAt: Date;
  updatedAt: Date;
}
