
import React, { useState, useEffect } from 'react';
import { ReviewResult } from './types';
import { analyzeVideo } from './services/geminiService';
import ReviewProgress from './components/ReviewProgress';
import ResultCard from './components/ResultCard';
import HistoryTable from './components/HistoryTable';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<ReviewResult | null>(null);
  const [history, setHistory] = useState<ReviewResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reviewHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Sync history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('reviewHistory', JSON.stringify(history));
  }, [history]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        setError("文件大小不能超过 100MB");
        return;
      }
      
      // Reset states for new file
      setSelectedFile(file);
      setUploadProgress(0);
      setIsUploadComplete(false);
      setIsUploading(true);
      setError(null);

      // Simulate/Handle reading progress
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      reader.onload = () => {
        setUploadProgress(100);
        setIsUploading(false);
        setIsUploadComplete(true);
      };
      reader.onerror = () => {
        setError("文件读取失败");
        setIsUploading(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const startReview = async () => {
    if (!selectedFile || !isUploadComplete) return;

    setIsAnalyzing(true);
    setError(null);
    setCurrentResult(null);
    
    try {
      const result = await analyzeVideo(selectedFile);
      setCurrentResult(result);
      setHistory(prev => [result, ...prev]);
      // Reset for next potential upload
      setSelectedFile(null);
      setIsUploadComplete(false);
      setUploadProgress(0);
    } catch (err: any) {
      console.error(err);
      setError("评审过程发生错误。这可能是由于网络不稳定、视频格式不支持或 API 限制导致的。请稍后重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const viewRecord = (result: ReviewResult) => {
    setCurrentResult(result);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('result-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      if (currentResult?.id === id) setCurrentResult(null);
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const clearHistory = () => {
    if (window.confirm('确定要清除所有评审历史吗？此操作不可撤销。')) {
      setHistory([]);
      setCurrentResult(null);
      localStorage.removeItem('reviewHistory');
    }
  };

  const exportToCSV = () => {
    if (history.length === 0) return;

    const headers = ["作品名", "总分", "音乐创作", "视觉技术", "视听融合", "创意叙事", "评审建议", "时间"];
    const rows = history.map(item => [
      `"${item.fileName.replace(/"/g, '""')}"`,
      item.totalScore,
      item.scores.music,
      item.scores.tech,
      item.scores.fusion,
      item.scores.creative,
      `"${item.details.overallSuggestion.replace(/"/g, '""')}"`,
      new Date(item.timestamp).toLocaleString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `AIGC_MV_Assistant_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-24 selection:bg-blue-500/30">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="bg-slate-900/60 border-b border-slate-800 py-6 px-4 md:px-8 mb-12 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-wand-magic-sparkles text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
                AIGC MV <span className="text-blue-400">评委助理</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">创作助手 v1.3</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">评审引擎</span>
              <span className="text-xs text-blue-400 font-mono">Gemini 3 Pro</span>
            </div>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 uppercase tracking-tighter"
              >
                <i className="fa-solid fa-trash-can"></i> 清除历史
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        <section className={`transition-all duration-700 ${currentResult ? 'mb-12 opacity-90 scale-[0.98]' : 'mb-20'}`}>
          {!currentResult && !isAnalyzing && (
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">开启作品深度分析</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                基于画面一致性、音轨美学、节奏融合及叙事逻辑，为您提供专业的竞赛级评审反馈。
              </p>
            </div>
          )}

          <div className={`
            bg-slate-800/40 rounded-3xl p-1 border-2 border-dashed transition-all duration-500 relative group
            ${selectedFile ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-slate-700 hover:border-slate-500'}
          `}>
            <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
              <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} disabled={isAnalyzing || isUploading} />
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500
                ${selectedFile ? 'bg-blue-600 shadow-xl shadow-blue-600/40 scale-110' : 'bg-slate-900 border border-slate-700 group-hover:bg-slate-800'}
              `}>
                <i className={`fa-solid ${selectedFile ? (isUploadComplete ? 'fa-check scale-125' : 'fa-spinner fa-spin') : 'fa-cloud-arrow-up'} text-3xl text-white`}></i>
              </div>
              <span className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
                {selectedFile ? selectedFile.name : "上传 MV 作品文件"}
              </span>
              
              {/* Upload Progress Bar */}
              {selectedFile && (
                <div className="w-64 mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{isUploadComplete ? '文件准备就绪' : '正在上传文件...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${isUploadComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!selectedFile && (
                <p className="text-sm text-slate-500 px-8 text-center mt-2">
                  拖拽视频文件到此区域开始。最高支持 100MB，支持主流格式。
                </p>
              )}
            </label>
            {selectedFile && !isAnalyzing && (
               <button 
                onClick={(e) => {
                  e.preventDefault(); 
                  setSelectedFile(null);
                  setIsUploadComplete(false);
                  setUploadProgress(0);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
               >
                 <i className="fa-solid fa-xmark"></i>
               </button>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-sm mb-8 max-w-2xl w-full flex items-center gap-3 animate-bounce">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {error}
              </div>
            )}
            
            <button
              onClick={startReview}
              disabled={!selectedFile || !isUploadComplete || isAnalyzing}
              className={`
                group relative px-12 py-5 rounded-2xl text-xl font-black transition-all shadow-2xl overflow-hidden
                ${!selectedFile || !isUploadComplete || isAnalyzing 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50' 
                  : 'bg-white text-slate-900 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  深度评审中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  开始智能评审
                  <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </span>
              )}
            </button>
            {!isUploadComplete && selectedFile && !isAnalyzing && (
              <p className="text-xs text-slate-500 mt-3 animate-pulse">等待文件上传完成...</p>
            )}
          </div>
        </section>

        <div className="relative">
          <ReviewProgress isAnalyzing={isAnalyzing} />
          {currentResult && !isAnalyzing && (
            <div id="result-view" className="mb-20 scroll-mt-header">
              <ResultCard result={currentResult} />
            </div>
          )}
        </div>

        <HistoryTable 
          history={history} 
          onDelete={deleteRecord} 
          onExport={exportToCSV}
          onView={viewRecord}
        />
      </main>

      <footer className="mt-32 py-16 px-4 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-500 text-sm">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-white font-bold">
               <i className="fa-solid fa-shield-halved text-blue-400"></i>
               算法合规与数据安全
             </div>
             <p className="leading-relaxed">
               本系统采用 Gemini 3 Pro 高级多模态引擎。所有上传的视频仅用于临时评审。计算公式严格遵循您提供的评分维度（音乐3:3:1:3/视觉4:3:3/融合5:5/创意5:5）。
             </p>
          </div>
          <div className="flex flex-col md:items-end justify-center gap-4">
            <div className="flex gap-6 font-medium">
              <span className="hover:text-blue-400 transition-colors cursor-help border-b border-slate-700">音轨权重 30%</span>
              <span className="hover:text-blue-400 transition-colors cursor-help border-b border-slate-700">视觉权重 30%</span>
              <span className="hover:text-blue-400 transition-colors cursor-help border-b border-slate-700">融合权重 20%</span>
              <span className="hover:text-blue-400 transition-colors cursor-help border-b border-slate-700">叙事权重 20%</span>
            </div>
            <p>© 2024 AIGC MV 评委助理. 专业版.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
