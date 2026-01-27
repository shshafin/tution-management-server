import { Contact } from './contact.model';
import { IContact } from './contact.interface';

const createContactIntoDB = async (payload: IContact) => {
  return await Contact.create(payload);
};

const getAllContactsFromDB = async () => {
  // Newest messages first
  return await Contact.find().sort({ createdAt: -1 });
};

const deleteContactFromDB = async (id: string) => {
  return await Contact.findByIdAndDelete(id);
};

export const ContactService = {
  createContactIntoDB,
  getAllContactsFromDB,
  deleteContactFromDB,
};
