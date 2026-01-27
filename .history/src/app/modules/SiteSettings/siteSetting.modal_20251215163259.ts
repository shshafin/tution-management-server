import { Schema, model } from 'mongoose';
import { ISiteSetting } from './siteSetting.interface';

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    siteName: { type: String, default: 'GSL Export' },
    logo: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    socialLinks: {
      facebook: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      pinterest: { type: String },
      reddit: { type: String },
    },
  },
  { timestamps: true },
);

export const SiteSetting = model<ISiteSetting>(
  'SiteSetting',
  SiteSettingSchema,
);
