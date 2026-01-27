// Helper: Upload Multiple Images
const handleMultipleImageUploads = async (files: any[]) => {
  const imageUrls: string[] = [];

  // Loop through all files and upload them
  for (const file of files) {
    const imageName = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const path = file.path;

    // Upload each file
    const { secure_url }: any = await sendImageToCloudinary(imageName, path);
    imageUrls.push(secure_url);
  }

  return imageUrls;
};