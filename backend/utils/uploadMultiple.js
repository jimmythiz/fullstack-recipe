import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  timeout: 120000, // 2 min timeout
});

const uploadMultiple = asyncHandler(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    req.files = {};
    return next();
  }

  try {
    const uploadedFiles = {};

    for (const fieldname in req.files) {
      const files = req.files[fieldname];

      if (files && files.length > 0) {
        const results = await Promise.all(
          files.map(
            (file) =>
              new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                  {
                    resource_type: "auto",
                    folder: "recipes",
                    transformation: [
                      { quality: "auto" },
                      { fetch_format: "auto" },
                    ],
                  },
                  (error, result) => {
                    if (error) {
                      console.error("Cloudinary upload error:", error);
                      return reject(
                        new Error(
                          error.message || "Cloudinary upload failed"
                        )
                      );
                    }
                    resolve(result);
                  }
                );

                uploadStream.end(file.buffer);
              })
          )
        );

        uploadedFiles[fieldname] = results.map((result) => ({
          url: result.secure_url,
          public_id: result.public_id,
        }));
      }
    }

    req.files = uploadedFiles;
    next();
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      message: "File upload failed",
      error: error.message,
    });
  }
});

export default uploadMultiple;
