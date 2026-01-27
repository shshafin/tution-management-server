import { Schema, model } from 'mongoose';
import { IBlog } from './blog.interface';

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: true },
    category: {
      type: String,
      enum: ['News', 'Event', 'Tips', 'Stories'],
      default: 'News',
    },
    author: { type: String, default: 'Admin' },
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

export const Blog = model<IBlog>('Blog', BlogSchema);
