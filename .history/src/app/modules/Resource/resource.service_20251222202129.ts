import { Resource } from './resource.model';
import { IResource } from './resource.interface';

const createResourceIntoDB = async (payload: IResource) => {
  return await Resource.create(payload);
};

const getAllResourcesFromDB = async () => {
  return await Resource.find().sort({ createdAt: -1 });
};

const deleteResourceFromDB = async (id: string) => {
  return await Resource.findByIdAndDelete(id);
};

export const ResourceService = {
  createResourceIntoDB,
  getAllResourcesFromDB,
  deleteResourceFromDB,
};
