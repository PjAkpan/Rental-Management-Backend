// utils/fileUploadHelper.ts

import path from "path";
import fs from "fs";
import fileUpload from "express-fileupload";
import { getters } from "../config";

// Function to upload files
export const uploadFiles = async (
  userId: string,
  files: fileUpload.UploadedFile[],
  folderName: string,
) => {
  // Create the user-specific directory in the 'maintenance' folder if it doesn't exist
  const userUploadPath = path.join(
    __dirname,
    "..",
    "uploads",
    folderName,
    userId,
  );
  if (!fs.existsSync(userUploadPath)) {
    fs.mkdirSync(userUploadPath, { recursive: true });
  }

  const filePaths: string[] = [];

  // Loop through files and move them to the user's folder
  for (const file of files) {
    const filePath = path.join(userUploadPath, file.name);
    await file.mv(filePath); // Move file to the user-specific folder
    const fileUrl = `${getters.getAppUrls().backendAssetUrl}uploads/${folderName}/${userId}/${file.name}`;
    filePaths.push(fileUrl);
  }

  return filePaths; // Return an array of file paths
};
