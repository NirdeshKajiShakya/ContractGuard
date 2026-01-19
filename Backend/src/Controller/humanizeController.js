import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const humanizeWithAI = async (text) => {
    console.log("api hitting for humanizing with AI");
  
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, '../../../Ai/humanizer.py');
      const python = spawn('python', [pythonScript]);
  
      let dataString = '';
      let errorString = '';
  
      python.stdin.write(JSON.stringify({ text }));
      python.stdin.end();
  
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
  
      python.stderr.on('data', (data) => {
        errorString += data.toString();
      });
  
      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorString || dataString}`));
        } else {
          try {
            if (!dataString || dataString.trim().length === 0) {
              reject(new Error('Python script returned empty output'));
              return;
            }
            resolve(JSON.parse(dataString));
          } catch (e) {
            reject(
              new Error(
                `Failed to parse Python output: ${e.message}. Output was: ${dataString.substring(0, 200)}`
              )
            );
          }
        }
      });
    });
  };
  

const humanizeContract = async (req, res) => {
  try {
    let contractText = '';

    if (req.file) {
      const mimeType = req.file.mimetype;

      if (mimeType === 'application/pdf') {
        const pdfParser = new PDFParse({ data: req.file.buffer });
        const pdfData = await pdfParser.getText();
        contractText = pdfData.text;
        await pdfParser.destroy();
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        contractText = result.value;
      } else if (mimeType.startsWith('image/')) {
        const ocrResult = await Tesseract.recognize(req.file.buffer, 'eng');
        contractText = ocrResult?.data?.text || '';
      } else if (mimeType === 'text/plain') {
        contractText = req.file.buffer.toString('utf-8');
      }
    }

    if (!contractText && req.body.text) {
      contractText = req.body.text;
    }

    contractText = contractText
      .replace(/\r\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\f/g, '')
      .trim();
console.log(contractText)
    if (!contractText || contractText.length < 10) {
      return res.status(400).json({ error: 'Text is too short or missing' });
    }

    const humanized = await humanizeWithAI(contractText);

  
    return res
      .status(200)
      .json({
        humanizedText: humanized.humanized_text || '',
        keyPoints: humanized.key_points || [],
        meta: {
          originalLength: humanized.original_length,
          simplifiedLength: humanized.simplified_length,
          warnings: humanized.warnings,
        },
        message: 'Text humanized successfully',
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

export default humanizeContract;

