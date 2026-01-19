import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function AnalysisSection({ analysis }) {
  const getRiskColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPointIcon = (type) => {
    switch(type) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'safe': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
      </div>

      {!analysis ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <Shield className="w-16 h-16 mb-3 opacity-20" />
          <p className="text-center">
            Your analysis will appear here once you submit a contract
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Risk Level */}
          <div className="flex items-center gap-2 pb-3 border-b">
            <span className="text-sm text-gray-600">Risk Level:</span>
            <span className={`font-bold uppercase ${getRiskColor(analysis.riskLevel)}`}>
              {analysis.riskLevel}
            </span>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">{analysis.summary}</p>
          </div>

          {/* Key Points */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analysis.keyPoints.map((point, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition">
                <div className="flex items-start gap-3">
                  {getPointIcon(point.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">
                      {point.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}