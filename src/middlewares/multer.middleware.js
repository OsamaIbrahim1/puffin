import multer from "multer";
import { allowedExtensions } from "../utils/allowedExtentions.js";
import generateUniqueString from "../utils/generate-Unique-String.js";

export const multerMiddleHost = ({ extensions = allowedExtensions.images }) => {
  // diskStorage
  const storage = multer.diskStorage({
    filename: (req, file, cb) => {
      const uniqueFilename = generateUniqueString(5) + "_" + file.originalname;
      cb(null, uniqueFilename);
    },
  });

  // fileFilters
  const fileFilters = (req, file, cb) => {
    if (extensions.includes(file.mimetype.splite("/")[1])) {
      return cb(null, true);
    }
    cb(new Error("Image format is not allowed!", false));
  };
  const file = multer({ fileFilters, storage });
  return file;
};
