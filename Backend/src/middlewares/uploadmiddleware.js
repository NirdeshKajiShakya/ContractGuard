import multer from 'multer';
import { fileURLToPath } from 'url';





const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
const allowedTypes = [ "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error('Only PDF or Docx files are allowed!'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

export default upload;

