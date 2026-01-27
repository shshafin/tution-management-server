import { Schema, model } from 'mongoose';
import { ITeam } from './team.interface';

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true },
    photo: { type: String, required: true },
    bio: { type: String },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
    },
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const Team = model<ITeam>('Team', TeamSchema);
