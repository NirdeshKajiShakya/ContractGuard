import express from 'express';
import upload from '../middlewares/uploadmiddleware.js';
import analyzePDF from '../Controller/uploadController.js';
import humanizeContract from '../Controller/humanizeController.js';

const router = express.Router();
router.post('/upload', upload.single('file'), analyzePDF )
router.post('/humanize',upload.single('file'),humanizeContract)
export default router;
