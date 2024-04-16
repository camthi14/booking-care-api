import cloudinary from "./cloudinary.util.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import config from "../config/index.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "booking",
  },
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const dirUpload = "src/assets/upload/";

//     if (!fs.existsSync(dirUpload)) {
//       fs.mkdirSync(dirUpload, { recursive: true });
//     }

//     cb(null, dirUpload);
//   },
//   filename: (req, file, cb) => {
//     const ext = file.originalname.split(".");
//     const newExt = ext[ext.length - 1];
//     cb(null, `${Date.now()}.${newExt}`);
//   },
// });

const upload = multer({ storage });

export default upload;
