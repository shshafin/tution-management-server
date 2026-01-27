import { Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string; // Rich text (HTML) from frontend editor
  coverImage: string;
  category: 'News' | 'Event' | 'Tips' | 'Stories';
  author: string; // e.g., "GSL Admin" or "John Doe"
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
