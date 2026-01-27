import { sendImageToCloudinary } from '../utils/sendImageToCloudinary';

// Helper to handle image upload
const handleImageUpload = async (req: Request) => {
  if (req.file) {
    const imageName = `${req?.body.name || 'user'}-${Date.now()}`;
    const path = req.file.path;
    const { secure_url }: any = await sendImageToCloudinary(imageName, path);
    return secure_url;
  }
  return null;
};

export default handleImageUpload;
