const PLACEHOLDER_RE =
  /^(n\/a|na|none|nil|null|-|—|--|tbd|not provided|দেওয়া হয়নি|দেয়া হয়নি|নাই|না)$/i;

export const JOB_LOCATION_REQUIRED_MESSAGE =
  'জব পোস্টের জন্য এলাকা সিলেক্ট এবং বাসার বিস্তারিত ঠিকানা আবশ্যক';

export const isBlankAddress = (value: unknown): boolean => {
  if (typeof value !== 'string') return true;
  const trimmed = value.trim();
  return !trimmed || PLACEHOLDER_RE.test(trimmed);
};

export const isValidBdCoordinates = (coords: unknown): boolean => {
  if (!Array.isArray(coords) || coords.length !== 2) return false;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return false;
  return lng >= 87.5 && lng <= 93.0 && lat >= 20.3 && lat <= 27.0;
};

export const isCompleteJobLocation = (location: any): boolean => {
  if (!location || typeof location !== 'object') return false;
  const detailed =
    typeof location.detailedAddress === 'string'
      ? location.detailedAddress.trim()
      : '';
  return (
    !isBlankAddress(location.shortArea) &&
    !isBlankAddress(location.mapAddress) &&
    !isBlankAddress(detailed) &&
    detailed.length >= 5 &&
    isValidBdCoordinates(location.coordinates)
  );
};
