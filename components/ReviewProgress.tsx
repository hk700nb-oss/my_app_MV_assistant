
import React, { useEffect, useState } from 'react';
import { DIMENSIONS } from '../constants';

interface ReviewProgressProps {
  isAnalyzing: boolean;
}

const ReviewProgress: React.FC<ReviewProgressProps> = ({ isAnalyzing }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev < DIMENSIONS.length ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mt-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <i className="fa-solid fa-sync fa-spin text-blue-400"></i>
        深度智能评审中...
      </h3>
      <div className="space-y-6">
        {DIMENSIONS.map((dim, index) => (
          <div key={dim.key} className="relative">
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${index < currentStep ? 'text-green-400' : 'text-slate-400'}`}>
                {dim.label} {index < currentStep ? '✓' : ''}
              </span>
              <span className="text-xs text-slate-500">权重 {dim.weight * 100}%</span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${index < currentStep ? 'bg-green-500 w-full' : index === currentStep ? 'bg-blue-500 animate-pulse w-2/3' : 'w-0'}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-400 italic text-center">
        Gemini 3 Pro 正在处理视频帧与音轨，请稍候...
      </p>
    </div>
  );
};

export default ReviewProgress;
