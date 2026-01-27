import { Document } from 'mongoose';

export type TProductCategory =
  | 'Plush'
  | 'Pet'
  | 'Educational'
  | 'Electronic'
  | 'Wooden'
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
