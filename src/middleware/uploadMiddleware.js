import multer from 'multer';
import path from 'path';
import heicConvert from 'heic-convert';
import fs from 'fs';

// Define storage for the uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const userId = req.params.userId;
    const timestamp = Date.now();
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const newFileName = `${timestamp}-${originalName}-${userId}-pp${path.extname(file.originalname)}`; // Keep the original extension
    cb(null, newFileName); // Use the newly formatted filename
  },
});

const uploadPP = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|heic/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    // const error = new CustomError(
    //   'File upload only supports the following filetypes - ' + filetypes,
    //   400
    // );
    cb(null, false); // just set to null and handle on controller if file are unsupported
    // cb(error); // Pass the error to the callback somehow it will ECONNRESET
  },
});

// Middleware for converting HEIC to JPEG
const convertHEICtoJPEG = async (req, res, next) => {
  if (!req.file) return next(); // If no file, continue

  const inputPath = req.file.path;
  const originalName = path.basename(
    req.file.filename,
    path.extname(req.file.filename)
  ); // Get original name without extension

  // Check if the uploaded file is HEIC
  if (path.extname(req.file.filename).toLowerCase() !== '.heic') {
    return next(); // If not HEIC, continue without conversion
  }

  // Set the output filename, keeping the original name and changing the extension to .jpg
  const outputPath = path.join('uploads', `${originalName}.jpg`);

  try {
    const buffer = await fs.promises.readFile(inputPath);
    const convertedImage = await heicConvert({
      buffer,
      format: 'JPEG',
      quality: 1,
    });

    await fs.promises.writeFile(outputPath, convertedImage);
    fs.unlinkSync(inputPath); // Remove original HEIC file
    // Update req.file with new file information
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath); // Update filename to the new JPG filename

    next(); // Proceed to the next middleware
  } catch (error) {
    return next(error);
  }
};

const uploadProfilePictureMiddleware = (req, res, next) => {
  uploadPP.single('profilePicture')(req, res, (err) => {
    if (err) {
      // Handle other errors
      return next(err);
    }
    // Continue if everything is fine
    next();
  });
};

export { uploadProfilePictureMiddleware, convertHEICtoJPEG };
