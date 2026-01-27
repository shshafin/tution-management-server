import QueryBuilder from '../../builder/QueryBuilder'; // তোর পাথ অনুযায়ী ইমপোর্ট করিস
import { TPackage } from './package.interface';
import { Package } from './package.model';

const createPackageIntoDB = async (payload: TPackage) => {
  return await Package.create(payload);
};

// টিউটরদের জন্য শুধু একটিভ প্যাকেজ (এখানে সাধারণত পেজিনেশন লাগে না, সব একবারে দেখায়)
const getActivePackagesFromDB = async () => {
  return await Package.find({ isActive: true }).sort('price');
};

const getAllPackagesForAdminFromDB = async (query: Record<string, unknown>) => {
  const searchableFields = ['name']; // নাম দিয়ে সার্চ করা যাবে

  const packageQuery = new QueryBuilder(Package.find(), query)
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await packageQuery.modelQuery;
  const meta = await packageQuery.countTotal();

  return { meta, result };
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
