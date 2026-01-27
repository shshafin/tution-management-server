/* eslint-disable no-console */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';
import config from '../config';

// Ensure config exists
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = (imageName: string, path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: imageName.trim() }, // trim() removes accidental spaces
      function (error, result) {
        if (error) {
          // If upload fails, try to delete the local file so it doesn't clutter
          fs.unlink(path, (err) => {
            if (err)
              console.log('Error deleting local file after failed upload');
          });
          return reject(error);
        }

        // Upload successful -> Resolve first
        resolve(result);

        // Then delete local file
        fs.unlink(path, (err) => {
          if (err) {
            console.log('Error deleting local file:', err);
          } else {
            console.log('File is deleted from local uploads.');
          }
        });
      },
    );
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
