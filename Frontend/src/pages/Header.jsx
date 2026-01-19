import { Shield } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
        <Shield className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">ContractGuard</h1>
        <span className="text-sm text-gray-500 ml-2">AI-Powered Terms Analyzer</span>
      </div>
    </header>
  );
}