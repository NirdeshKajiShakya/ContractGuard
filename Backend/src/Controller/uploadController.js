import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeWithAI(contractText) {
    return new Promise((resolve, reject) => {

      const pythonScript = path.join(__dirname, '../../../Ai/analyzer.py');
      
   
      const python = spawn('python3', [pythonScript]);
      
      let dataString = '';
      let errorString = '';
      

      python.stdin.write(JSON.stringify({ text: contractText }));
      python.stdin.end();
      
      python.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      

      python.stderr.on('data', (data) => {
        errorString += data.toString();
      });
      
 
      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorString}`));
        } else {
          try {
            const result = JSON.parse(dataString);
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse Python output: ${e.message}`));
          }
        }
      });
    });
  }
  function formatAnalysisForFrontend(rawAnalysis) {
    if (!rawAnalysis?.analysis || !Array.isArray(rawAnalysis.analysis)) return [];
  
    return rawAnalysis.analysis.map((item) => ({
      clause: item.clause_text.trim(),
      riskScore: item.risk_score,
      explanation: item.explanation.trim(),
      recommendation: item.recommendation.trim()
    }));
  }
const analyzePDF = async (req,res)=>{
    console.log("analyzing pdf api hitting")
    try {
        let contractText = "";
        if (req.file) {
            const mimeType = req.file.mimetype;
      
            if (mimeType === "application/pdf") {
              const pdfData = await pdfParse(req.file.buffer);
              contractText = pdfData.text;
            }
            else if (
                mimeType ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              ) {
                const result = await mammoth.extractRawText({
                  buffer: req.file.buffer
                });
                contractText = result.value;
              }


        }
        if ( !contractText && req.body.text) {
            contractText = req.body.text;
            if(contractText){
              console.log("sucessfuly fetched contract text")
            }
       
          }
contractText = contractText.replace(/\r\n/g, '\n');
contractText = contractText.replace(/\n{2,}/g, '\n');
contractText = contractText.replace(/[ \t]+/g, ' ');
contractText = contractText.replace(/\f/g, '');
contractText = contractText.trim();

          if (!contractText || contractText.trim().length < 50) {
            return res.status(400).json({
              error: "Contract text is too short or missing"
            });
          }
    const analysis = await analyzeWithAI(contractText);
    const cleanAnalysis = formatAnalysisForFrontend(analysis);
    res.status(200).send({data:cleanAnalysis,message:"Contract analyzed successfully"});
    } catch (error) {
        console.log(
            error.message
        )
        res.status(500).send({
            message: error.message
        })
    }
}
export default analyzePDF;