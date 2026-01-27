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

const updateContactStatusInDB = async (id: string) => {
  // We just flip 'isRead' to true. No payload needed.
  const result = await Contact.findByIdAndUpdate(
    id,
    { isRead: true },
    { new: true }
  );
  return result;
};

export const ContactService = {
  createContactIntoDB,
  getAllContactsFromDB,
  deleteContactFromDB,
};
