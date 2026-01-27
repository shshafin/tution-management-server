import { Faq } from './faq.model';
import { IFaq } from './faq.interface';

const createFaqIntoDB = async (payload: IFaq) => {
  return await Faq.create(payload);
};

const getAllFaqsFromDB = async () => {
  return await Faq.find().sort({ createdAt: -1 });
};

const deleteFaqFromDB = async (id: string) => {
  return await Faq.findByIdAndDelete(id);
};

export const FaqService = {
  createFaqIntoDB,
  getAllFaqsFromDB,
  deleteFaqFromDB,
};
