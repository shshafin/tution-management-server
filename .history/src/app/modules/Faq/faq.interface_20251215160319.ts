import { Document } from 'mongoose';

export interface IFaq extends Document {
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}
