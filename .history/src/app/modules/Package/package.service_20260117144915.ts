import { TPackage } from './package.interface';
import { Package } from './package.model';

const createPackageIntoDB = async (payload: TPackage) => {
  const result = await Package.create(payload);
  return result;
};

const getAllPackagesFromDB = async () => {
  // টিউটররা শুধু একটিভ প্যাকেজগুলো দেখবে
  const result = await Package.find({ isActive: true });
  return result;
};

export const PackageService = {
  createPackageIntoDB,
  getAllPackagesFromDB,
};
