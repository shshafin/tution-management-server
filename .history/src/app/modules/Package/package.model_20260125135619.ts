import { Schema, model } from 'mongoose';
import { TPackage } from './package.interface';

const packageSchema = new Schema<TPackage>(
  {
    name: { type: String, required: true },
    credits: { type: Number, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Package = model<TPackage>('Package', packageSchema);
