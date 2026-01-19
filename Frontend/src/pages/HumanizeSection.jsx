import React, { useRef } from 'react';
import { Sparkles, Copy, CheckCircle, Upload, FileText, X, ArrowRight } from 'lucide-react';

export default function HumanizeSection({ 
  humanizeInput,
  setHumanizeInput,
  humanizeFile,
  setHumanizeFile,
  humanizedText, 
  humanizing, 
  handleHumanize, 
  copied, 
  handleCopy 
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHumanizeFile(file);
      setHumanizeInput('');
    }
    e.target.value = '';
  };

  const handleRemoveFile = () => {
    setHumanizeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canHumanize = (humanizeInput.trim() || humanizeFile) && !humanizing;

  return (
    <div className="relative">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-20"></div>

      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #4f39f6 0%, #7c3aed 100%)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Humanize Legal Text
          </h2>
          <p className="text-gray-600">Transform complex legal jargon into simple, understandable language</p>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500" style={{ background: 'linear-gradient(135deg, #4f39f6 0%, #7c3aed 100%)' }}></div>
            <div className="relative bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4f39f6' }}></div>
                  Input Your Text
                </label>
                {humanizeInput && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {humanizeInput.length} characters
                  </span>
                )}
              </div>
              
              <textarea
                value={humanizeInput}
                onChange={(e) => {
                  setHumanizeInput(e.target.value);
                  if (humanizeFile) {
                    setHumanizeFile(null);
                  }
                }}
                placeholder="Paste your complex legal text here... We'll make it easy to understand."
                className="w-full h-40 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl resize-none text-gray-700 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-transparent focus:ring-4"
                style={{ '--tw-ring-color': 'rgba(79, 57, 246, 0.1)' }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 4px rgba(79, 57, 246, 0.1)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                disabled={humanizeFile}
              />

              {/* File Upload Display */}
              {humanizeFile && (
                <div className="mt-4 p-4 rounded-xl border-2 transition-all" style={{ backgroundColor: '#f8f7ff', borderColor: '#4f39f6' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4f39f6' }}>
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{humanizeFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {humanizeFile.type || 'Unknown'} • {(humanizeFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all group"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <div className="relative overflow-hidden group h-12 border-2 border-dashed rounded-xl transition-all hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2" style={{ borderColor: humanizeFile ? '#4f39f6' : '#d1d5db' }}>
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Upload File</span>
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
                  onClick={handleHumanize}
                  disabled={!canHumanize}
                  className="relative overflow-hidden group h-12 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                  style={{ 
                    background: canHumanize ? 'linear-gradient(135deg, #4f39f6 0%, #7c3aed 100%)' : '',
                    transform: canHumanize ? 'scale(1)' : 'scale(0.98)'
                  }}
                  onMouseEnter={(e) => {
                    if (canHumanize) {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 57, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canHumanize) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                >
                  {humanizing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Humanize</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {(humanizedText || humanizing) && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Humanized Result
                  </label>
                  {humanizedText && (
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md"
                      style={{ 
                        backgroundColor: copied ? '#10b981' : '#f3f4f6',
                        color: copied ? '#ffffff' : '#374151'
                      }}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="min-h-40 max-h-96 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-y-auto border border-green-200">
                  {humanizing ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full" style={{ border: '3px solid rgba(79, 57, 246, 0.2)' }}></div>
                        <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '3px solid #4f39f6', borderTopColor: 'transparent' }}></div>
                      </div>
                      <p className="text-gray-600 font-medium mt-4">Converting to simple language...</p>
                      <p className="text-sm text-gray-500 mt-2">This won't take long</p>
                    </div>
                  ) : (
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {humanizedText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!humanizedText && !humanizing && (
            <div className="text-center py-12 px-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">Ready to Humanize</p>
              <p className="text-sm text-gray-500">Your simplified text will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}