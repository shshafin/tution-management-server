import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Soft Toy', 'Plastic Toy', 'Baby Accessories', 'Others'],
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Product = model<IProduct>('Product', ProductSchema);
