
import { ISiteSetting } from './siteSetting.interface';

// Get the Settings (Public)
const getSiteSettingsFromDB = async () => {
  // Returns the first document found (since there's only one)
  return await SiteSetting.findOne();
};

// Create or Update (Admin)
const updateSiteSettingsInDB = async (payload: Partial<ISiteSetting>) => {
  // Try to find the existing settings
  const isExist = await SiteSetting.findOne();

  if (!isExist) {
    // If no settings exist yet, create the first one
    return await SiteSetting.create(payload);
  } else {
    // If exists, update the first one found
    // We use the ID of the existing document to update it safely
    return await SiteSetting.findByIdAndUpdate(isExist._id, payload, {
      new: true,
      runValidators: true,
    });
  }
};

export const SiteSettingService = {
  getSiteSettingsFromDB,
  updateSiteSettingsInDB,
};
