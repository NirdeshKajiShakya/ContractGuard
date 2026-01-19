import { useState } from 'react';
import axios from 'axios';
import Header from './Header';
import InputSection from './InputSection';
import AnalysisSection from './AnalysisSection';
import Footer from './Footer';

export default function HomePage() {
  const [contractText, setContractText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!contractText.trim() && !uploadedFile) return;
    
    setAnalyzing(true);
    
    try {
      // For now, just simulate analysis with mock data
      // Later you can send uploadedFile to backend when ready
      setTimeout(() => {
        setAnalysis({
          riskLevel: 'medium',
          keyPoints: [
            {
              type: 'warning',
              title: 'Data Collection',
              description: 'The service collects your browsing history, location data, and contact information.'
            },
            {
              type: 'danger',
              title: 'Third-Party Sharing',
              description: 'Your data may be shared with advertising partners and affiliates without explicit consent.'
            },
            {
              type: 'info',
              title: 'Termination Rights',
              description: 'The company can terminate your account at any time without prior notice.'
            },
            {
              type: 'warning',
              title: 'Liability Limitation',
              description: 'The company limits its liability to $100, even in cases of data breaches or service failures.'
            },
            {
              type: 'safe',
              title: 'Right to Delete',
              description: 'You can request deletion of your personal data within 30 days.'
            }
          ],
          summary: 'This agreement contains several concerning clauses about data usage and company liability. Pay special attention to data sharing practices and termination conditions.'
        });
        setAnalyzing(false);
      }, 2000);
      
    } catch (error) {
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