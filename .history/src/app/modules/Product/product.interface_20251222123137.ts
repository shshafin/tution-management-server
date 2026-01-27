import { Document } from 'mongoose';

export type TProductCategory =
  | 'Soft Toy'
  | 'Plastic Toy'
  | 'B'
  | 'Others';

export interface IProduct extends Document {
  name: string;
  category: TProductCategory;
  images: string[]; // Array of image URLs
  description: string;
  price?: number; // Optional
  isFeatured: boolean; // For Home Page Slider
  createdAt: Date;
  updatedAt: Date;
}
