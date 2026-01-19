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
      const pythonScriptPath = path.join(__dirname, '../../../ai/humanizer.py');
      console.log(`Python script path: ${pythonScriptPath}`);
      
      const pythonProcess = spawn('python', [pythonScriptPath], {
        timeout: 120000 // 2 minute timeout
      });

      // Send contract text as JSON to Python script
      const inputData = JSON.stringify({ contract_text: text });
      console.log(`Sending ${text.length} characters to Python script`);
      
      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();

      let dataString = '';
      let errorString = '';
  
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
  
      pythonProcess.stderr.on('data', (data) => {
        const errMsg = data.toString();
        console.error('PYTHON STDERR:', errMsg);
        errorString += errMsg;
      });

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
  
      pythonProcess.on('close', (code) => {
        console.log(`Python process closed with code ${code}`);
        console.log('PYTHON STDOUT:', dataString);
        
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorString || dataString}`));
        } else {
          try {
            if (!dataString || dataString.trim().length === 0) {
              reject(new Error('Python script returned empty output'));
              return;
            }
            
            const result = JSON.parse(dataString);
            
            // Check if Python returned an error
            if (result.error) {
              reject(new Error(`Python script error: ${result.error}`));
              return;
            }
            
            resolve(result);
          } catch (e) {
            console.error('Failed to parse JSON:', e.message);
            console.error('Raw output:', dataString);
            reject(
              new Error(
                `Failed to parse Python output: ${e.message}. Output was: ${dataString.substring(0, 500)}`
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

    contractText = req.body.contract_text || req.body.text || contractText;

    if (!contractText) {
        return res.status(400).json({ error: 'No contract text provided' });
    }

    contractText = contractText
      .replace(/\r\n/g, '\n')
      .replace(/\n{2,}/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\f/g, '')
      .trim();

    console.log(`Contract text length: ${contractText.length} characters`);

    if (!contractText || contractText.length < 10) {
      return res.status(400).json({ error: 'Text is too short or missing' });
    }

    const humanized = await humanizeWithAI(contractText);
    
    console.log('Humanization result received:', {
      hasHumanizedText: !!humanized.humanized_text,
      textLength: humanized.humanized_text?.length || 0,
      keyPointsCount: humanized.key_points?.length || 0,
      hasWarnings: !!humanized.warnings
    });

    const response = {
      humanizedText: humanized.humanized_text || '',
      keyPoints: humanized.key_points || [],
      meta: {
        originalLength: humanized.original_length,
        simplifiedLength: humanized.simplified_length,
        warnings: humanized.warnings || [],
      },
      message: 'Text humanized successfully',
    };
    
    console.log('Sending response to frontend:', JSON.stringify(response).substring(0, 200) + '...');
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in humanizeContract:', error);
    return res.status(500).json({ 
      error: 'Failed to humanize contract',
      message: error.message,
      details: error.stack
    });
  }
};

export default humanizeContract;

