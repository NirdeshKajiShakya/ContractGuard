import { useState } from 'react';
import Header from './Header';
import InputSection from './InputSection';
import AnalysisSection from './AnalysisSection';
import Footer from './Footer';
import api from '../api/axios';

export default function HomePage() {
  const [contractText, setContractText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);


  
  const handleAnalyze = async () => {
    if (!contractText.trim() && !uploadedFile) return;
    setAnalyzing(true);
    
    try {

const formData = new FormData();

if (uploadedFile) {
  formData.append("file", uploadedFile); // same name backend expects
}

if (contractText.trim()) {
  formData.append("text", contractText); // fallback text
}
const res = await api.post("/api/upload",formData,{
  headers: { "Content-Type": "multipart/form-data" }
})
      
console.log(res.data.data)
console.log(res.data.message)
setAnalysis(res.data.data);
    } 
    catch (error) {
      console.error('Error analyzing contract:', error);
      alert('Failed to analyze contract. Please try again.');
      setAnalyzing(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Don't Sign Blindly
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste or upload any terms of service, privacy policy, or contract. 
            We'll analyze it and highlight what you need to know.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <InputSection 
            contractText={contractText}
            setContractText={setContractText}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            analyzing={analyzing}
            handleAnalyze={handleAnalyze} />
            
          <AnalysisSection analysis={analysis} />
        </div>

        <Footer />
      </main>
    </div>
  );
}