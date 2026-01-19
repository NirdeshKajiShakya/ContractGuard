import express from 'express';
import upload from '../middlewares/uploadmiddleware.js';
import analyzePDF from '../Controller/uploadController.js';

const router = express.Router();
router.post('/upload', upload.single('file'), analyzePDF )
export default router;
