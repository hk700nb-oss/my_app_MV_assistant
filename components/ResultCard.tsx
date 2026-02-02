
import React from 'react';
import { ReviewResult, ReviewScores } from '../types';
import { DIMENSIONS } from '../constants';

interface ResultCardProps {
  result: ReviewResult;
}

const RadarChart: React.FC<{ scores: ReviewScores }> = ({ scores }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  
  // Calculate polygon points
  const points = DIMENSIONS.map((dim, i) => {
    const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
    const score = scores[dim.key] || 0;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Background circles
  const levels = [0.2, 0.4, 0.6, 0.8, 1];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grids */}
        {levels.map((level) => {
          const r = level * radius;
          const gridPoints = DIMENSIONS.map((_, i) => {
            const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(' ');
          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4"
            />
          );
        })}
        
        {/* Axis lines */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          const labelX = center + (radius + 40) * Math.cos(angle);
          const labelY = center + (radius + 20) * Math.sin(angle);
          
          return (
            <g key={dim.key}>
              <line x1={center} y1={center} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" />
              <text
                x={labelX}
                y={labelY}
                fill="#94a3b8"
                fontSize="12"
                textAnchor="middle"
                className="font-medium"
              >
                {dim.label}
              </text>
            </g>
          );
        })}

        {/* Data polygon */}
        <polygon
          points={points}
          fill="rgba(59, 130, 246, 0.3)"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {DIMENSIONS.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / DIMENSIONS.length - Math.PI / 2;
          const score = scores[dim.key] || 0;
          const r = (score / 100) * radius;
          const x = center + r * Math.cos(angle);
          const y = center + r * Math.sin(angle);
          return (
            <circle
              key={dim.key}
              cx={x}
              cy={y}
              r="4"
              fill="#3b82f6"
              className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
            />
          );
        })}
      </svg>
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score Header */}
      <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-green-500/30">
                评审完成
              </span>
              <h2 className="text-3xl font-bold text-white">评审报告</h2>
            </div>
            <p className="text-slate-400 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-file-video text-blue-400"></i>
              作品：{result.fileName}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {DIMENSIONS.map(dim => (
                <div key={dim.key} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 group transition-all hover:border-slate-500/50">
                  <div className="text-slate-500 text-xs mb-1 font-medium">{dim.label}</div>
                  <div className="text-2xl font-bold transition-transform group-hover:scale-110 origin-left" style={{ color: dim.color }}>{result.scores[dim.key]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-3xl border-2 border-blue-500/30 shadow-2xl min-w-[200px]">
            <span className="text-sm text-blue-300 font-bold mb-2 uppercase tracking-widest">综合评分</span>
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              {Math.round(result.totalScore)}
            </span>
            <div className="w-full h-1 bg-slate-700 rounded-full mt-4 overflow-hidden">
               <div className="h-full bg-blue-500" style={{ width: `${result.totalScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visualization */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 h-[400px] flex items-center justify-center shadow-lg">
          <RadarChart scores={result.scores} />
        </div>

        {/* Dimension Descriptions */}
        <div className="space-y-4">
          {DIMENSIONS.map(dim => (
            <div key={dim.key} className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-700">
                    <i className={`fa-solid ${dim.icon}`} style={{ color: dim.color }}></i>
                  </div>
                  <h4 className="font-bold text-slate-200">{dim.label}</h4>
                </div>
                <span className="text-xs font-mono text-slate-500">权重: {dim.weight * 100}%</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic">
                {(result.details as any)[`${dim.key}Desc`]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestion */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-blue-900/20 p-8 rounded-2xl border border-blue-500/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
           <i className="fa-solid fa-quote-right text-8xl"></i>
        </div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
            <i className="fa-solid fa-pen-nib text-blue-400"></i>
          </div>
          专家级综合评审建议
        </h3>
        <p className="text-slate-300 leading-relaxed text-justify relative z-10 font-light text-lg">
          {result.details.overallSuggestion}
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
