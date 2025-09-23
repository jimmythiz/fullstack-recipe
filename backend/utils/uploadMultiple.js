import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  timeout: 120000,
});

const uploadMultiple = asyncHandler(async (req, res, next) => {
  // Check if any files exist
  if (!req.files || Object.keys(req.files).length === 0) {

    req.files = {};
    return next();
  }

  try {
    const uploadedFiles = {};

    for (const fieldname in req.files) {
      const files = req.files[fieldname];
      
      if (files && files.length > 0) {
        const uploadPromises = files.map((file) =>
          cloudinary.uploader.upload_stream(
            { 
              resource_type: "auto", 
              folder: "recipes",
              transformation: [
                { quality: "auto" },
                { fetch_format: "auto" }
              ]
            },
            (error, result) => {
              if (error) throw error;
              return result;
            }
          )
        );

        // For memory storage, we need to use upload_stream
        const results = await Promise.all(
          files.map(file => 
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                { 
                  resource_type: "auto", 
                  folder: "recipes",
                  transformation: [
                    { quality: "auto" },
                    { fetch_format: "auto" }
                  ]
                },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              ).end(file.buffer);
            })
          )
        );

        uploadedFiles[fieldname] = results.map(result => ({
          url: result.secure_url,
          public_id: result.public_id
        }));
      }
    }

    req.files = uploadedFiles;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

export default uploadMultiple;