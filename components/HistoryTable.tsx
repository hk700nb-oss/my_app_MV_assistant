
import React from 'react';
import { ReviewResult } from '../types';

interface HistoryTableProps {
  history: ReviewResult[];
  onDelete: (id: string) => void;
  onExport: () => void;
  onView: (result: ReviewResult) => void;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history, onDelete, onExport, onView }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">评审历史记录</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg text-sm font-medium"
        >
          <i className="fa-solid fa-file-export"></i>
          导出详细报表 (CSV)
        </button>
      </div>

      <div className="overflow-x-auto bg-slate-800/50 rounded-xl border border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">作品名称 (点击查看)</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">总分</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">详细得分 (音/技/融/创)</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">时间</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-200">
                  <button 
                    onClick={() => onView(item)}
                    className="text-left hover:text-blue-400 hover:underline transition-all duration-200 focus:outline-none"
                  >
                    {item.fileName}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-sm font-bold border border-blue-500/20">
                    {item.totalScore}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex gap-2 text-xs text-slate-400">
                    <span title="音乐">{item.scores.music}</span>/
                    <span title="技术">{item.scores.tech}</span>/
                    <span title="融合">{item.scores.fusion}</span>/
                    <span title="创意">{item.scores.creative}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                    title="删除记录"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
