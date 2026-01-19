import mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';
async function analyzeWithAI(contractText) {
    return new Promise((resolve, reject) => {

      const pythonScript = path.join(__dirname, '../../Ai/analyzer.py');
      
   
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

    res.status(200).send({data:analysis,message:"Contract analyzed successfully"});
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