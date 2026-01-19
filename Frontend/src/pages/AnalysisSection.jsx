import { Shield, AlertTriangle, CheckCircle, Info, FileText } from 'lucide-react';

export default function AnalysisSection({ analysis }) {
  // Calculate overall risk level based on risk scores
  const getOverallRiskLevel = () => {
    if (!analysis || !Array.isArray(analysis) || analysis.length === 0) return null;
    
    const avgRisk = analysis.reduce((sum, item) => sum + (item.riskScore || 0), 0) / analysis.length;
    const maxRisk = Math.max(...analysis.map(item => item.riskScore || 0));
    
    // Use max risk for overall level, but consider average too
    if (maxRisk >= 8) return 'high';
    if (maxRisk >= 5 || avgRisk >= 5) return 'medium';
    return 'low';
  };

  const getRiskColor = (level) => {
    switch(level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelFromScore = (score) => {
    if (score >= 8) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  const getRiskIcon = (score) => {
    const level = getRiskLevelFromScore(score);
    switch(level) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRiskBadgeColor = (score) => {
    const level = getRiskLevelFromScore(score);
    switch(level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const overallRiskLevel = getOverallRiskLevel();
  const hasAnalysis = analysis && Array.isArray(analysis) && analysis.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Analysis Results</h3>
      </div>

      {!hasAnalysis ? (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
          <Shield className="w-16 h-16 mb-3 opacity-20" />
          <p className="text-center">
            Your analysis will appear here once you submit a contract
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Risk Level */}
          {overallRiskLevel && (
            <div className="flex items-center gap-2 pb-3 border-b">
              <span className="text-sm text-gray-600">Overall Risk Level:</span>
              <span className={`font-bold uppercase ${getRiskColor(overallRiskLevel)}`}>
                {overallRiskLevel}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                ({analysis.length} {analysis.length === 1 ? 'issue' : 'issues'} found)
              </span>
            </div>
          )}

          {/* Summary Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Found <strong>{analysis.length}</strong> {analysis.length === 1 ? 'risky clause' : 'risky clauses'} 
              {' '}that require your attention. Review each item below for details and recommendations.
            </p>
          </div>

          {/* Analysis Items */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {analysis.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  {getRiskIcon(item.riskScore)}
                  <div className="flex-1 space-y-3">
                    {/* Risk Score Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getRiskBadgeColor(item.riskScore)}`}>
                        Risk Score: {item.riskScore}/10
                      </span>
                    </div>

                    {/* Clause */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <h4 className="font-semibold text-gray-800 text-sm">Risky Clause:</h4>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-gray-300 italic">
                        "{item.clause}"
                      </p>
                    </div>

                    {/* Explanation */}
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm mb-1">Why This Is Risky:</h4>
                      <p className="text-sm text-gray-600">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <h4 className="font-semibold text-green-800 text-sm mb-1 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Recommendation:
                      </h4>
                      <p className="text-sm text-green-700">
                        {item.recommendation}
                      </p>
                    </div>
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