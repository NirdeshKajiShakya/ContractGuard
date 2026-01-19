import { Zap, Lock, Rocket } from 'lucide-react';

export default function Footer() {
  return (
    <div className="mt-8 flex justify-center items-center gap-6 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" />
        <span>Powered by AI</span>
      </div>
      <div className="flex items-center gap-2">
        <Lock className="w-4 h-4" />
        <span>Your data is not stored</span>
      </div>
      <div className="flex items-center gap-2">
        <Rocket className="w-4 h-4" />
        <span>Instant analysis</span>
      </div>
    </div>
  );
}