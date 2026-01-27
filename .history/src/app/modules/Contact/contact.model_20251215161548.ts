import { Schema, model } from 'mongoose';
import { IContact } from './contact.interface';

const ContactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Contact = model<IContact>('Contact', ContactSchema);
