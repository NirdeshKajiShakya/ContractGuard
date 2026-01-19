import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import InputSection from './InputSection';
import AnalysisSection from './AnalysisSection';
import HumanizeSection from './HumanizeSection';
import Footer from './Footer';

export default function HomePage() {
  const [contractText, setContractText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  
  // Separate state for Humanize section
  const [humanizeInput, setHumanizeInput] = useState('');
  const [humanizeFile, setHumanizeFile] = useState(null);
  const [humanizedText, setHumanizedText] = useState('');
  const [humanizing, setHumanizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!contractText.trim() && !uploadedFile) return;
    
    setAnalyzing(true);
    
    try {
      // When backend is ready, replace this with actual API call
      const response = await axios.post('http://localhost:5000/api/analysis/analyze', {
        contractText: contractText || uploadedFile.name
      });
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      alert('Failed to analyze contract. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleHumanize = async () => {
    if (!humanizeInput.trim() && !humanizeFile) {
      alert('Please enter or upload text to humanize');
      return;
    }
    
    setHumanizing(true);
    
    try {
      // When backend is ready, replace this with actual API call
      const response = await axios.post('http://localhost:5000/api/analysis/humanize', {
        contractText: humanizeInput || humanizeFile.name
      });
      
      setHumanizedText(response.data.humanizedText);
    } catch (error) {
      console.error('Error humanizing contract:', error);
      alert('Failed to humanize contract. Please try again.');
    } finally {
      setHumanizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(humanizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Analysis Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InputSection 
            contractText={contractText}
            setContractText={setContractText}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            analyzing={analyzing}
            handleAnalyze={handleAnalyze}
          />
          <AnalysisSection analysis={analysis} />
        </div>

        {/* Humanize Section */}
        <div className="mb-8">
          <HumanizeSection 
            humanizeInput={humanizeInput}
            setHumanizeInput={setHumanizeInput}
            humanizeFile={humanizeFile}
            setHumanizeFile={setHumanizeFile}
            humanizedText={humanizedText}
            humanizing={humanizing}
            handleHumanize={handleHumanize}
            copied={copied}
            handleCopy={handleCopy}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}