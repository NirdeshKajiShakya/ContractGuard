import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const fileFilter = (req, file, cb) => {

  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true); 
  } else {
    cb(new Error('Only PDF files are allowed!'), false); 
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});


export const uploadPDF = upload.single('file');


// export const uploadMultiplePDFs = upload.array('files', 10); 

export default upload;

