import { TPackage } from './package.interface';
import { Package } from './package.model';

const createPackageIntoDB = async (payload: TPackage) => {
  const result = await Package.create(payload);
  return result;
};

const getAllPackagesFromDB = async () => {
  const result = await Package.find({ isActive: true });
  return result;
};


const getSinglePackageFromDB = async (id: string) => {
  const result = await Package.findById(id);
  return result;
};


const updatePackageIntoDB = async (id: string, payload: Partial<TPackage>) => {
  const result = await Package.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};


const deletePackageFromDB = async (id: string) => {
  const result = await Package.findByIdAndDelete(id);
  return result;
};

export const PackageService = {
  createPackageIntoDB,
  getAllPackagesFromDB,
  getSinglePackageFromDB, // নতুন
  updatePackageIntoDB,    // নতুন
  deletePackageFromDB,    // নতুন
};