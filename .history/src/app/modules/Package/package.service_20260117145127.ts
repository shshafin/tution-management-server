import { TPackage } from './package.interface';
import { Package } from './package.model';

const createPackageIntoDB = async (payload: TPackage) => {
  return await Package.create(payload);
};

// Tutor-der jonno shudhu active gulo
const getActivePackagesFromDB = async () => {
  return await Package.find({ isActive: true });
};

// Admin-er 
const getAllPackagesForAdminFromDB = async () => {
  return await Package.find().sort('-createdAt');
};

const getSinglePackageFromDB = async (id: string) => {
  return await Package.findById(id);
};

const updatePackageIntoDB = async (id: string, payload: Partial<TPackage>) => {
  return await Package.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const deletePackageFromDB = async (id: string) => {
  return await Package.findByIdAndDelete(id);
};

export const PackageService = {
  createPackageIntoDB,
  getActivePackagesFromDB,
  getAllPackagesForAdminFromDB, 
  getSinglePackageFromDB,
  updatePackageIntoDB,
  deletePackageFromDB,
};
