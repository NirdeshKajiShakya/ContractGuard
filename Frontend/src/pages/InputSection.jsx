import { useRef } from 'react';
import { FileText, Upload, Shield, X } from 'lucide-react';

export default function InputSection({ contractText, setContractText, uploadedFile, setUploadedFile, analyzing, handleAnalyze }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setContractText(''); 
    }
   
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);

    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canAnalyze = (contractText.trim() || uploadedFile) && !analyzing;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Input Contract</h3>
      </div>

      <textarea
        value={contractText}
        onChange={(e) => {
          setContractText(e.target.value);
          if (uploadedFile) {
            setUploadedFile(null); 
          }
        }}
        placeholder="Paste your terms of service, privacy policy, or contract here..."
        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        disabled={uploadedFile}
      />

      {uploadedFile && (
        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <strong>Type:</strong> {uploadedFile.type || 'Unknown'} • <strong>Size:</strong> {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-indigo-100 rounded transition"
              title="Remove file"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition">
            <Upload className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Upload File</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Analyze Contract
            </>
          )}
        </button>
      </div>
    </div>
  );
}