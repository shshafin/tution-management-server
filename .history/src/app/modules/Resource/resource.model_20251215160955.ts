import { Schema, model } from 'mongoose';
import { IResource } from './resource.interface';

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const Resource = model<IResource>('Resource', ResourceSchema);
