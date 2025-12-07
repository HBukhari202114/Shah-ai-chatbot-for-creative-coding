import React, { useEffect, useState } from 'react';
import { NexusResponse, Widget } from '../types';
import { Activity, Zap, Layers, Code, Download, Share2, Laptop, Smartphone, Monitor, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface InsightPanelProps {
  data: NexusResponse | null;
  isLoading: boolean;
}

const InsightPanel: React.FC<InsightPanelProps> = ({ data, isLoading }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (data) {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= data.impactScore) {
          current = data.impactScore;
          clearInterval(interval);
        }
        setScore(current);
      }, 20);
      return () => clearInterval(interval);
    } else {
      setScore(0);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 glass-panel rounded-l-3xl border-r-0">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-t border-violet-500/50 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border-r border-fuchsia-500/50 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-8 rounded-full bg-violet-500/10 blur-xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-2xl font-mono text-white/20">AI</div>
          </div>
        </div>
        <p className="text-violet-300/80 font-mono text-xs tracking-[0.2em] animate-pulse">GENERATING ASSETS...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-600 glass-panel rounded-l-3xl border-r-0">
        <Layers className="w-20 h-20 mb-6 opacity-10" />
        <p className="font-light tracking-wide">Awaiting Data Stream</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar glass-panel rounded-l-3xl border-r-0"
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-900/80 backdrop-blur-xl -mx-6 -mt-6 px-6 py-4 border-b border-white/5 z-20">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-[0_0_10px_rgba(139,92,246,0.2)] ${
          data.error 
            ? 'bg-red-500/20 text-red-300 border-red-500/20' 
            : 'bg-violet-500/20 text-violet-300 border-violet-500/20'
        }`}>
          {data.domain}
        </span>
        <div className="flex gap-2">
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Download size={16} className="text-slate-400"/></button>
        </div>
      </div>

      {/* Analysis */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
           <Activity size={12} /> Analysis
        </h3>
        <p className={`text-sm leading-relaxed bg-white/5 p-5 rounded-2xl border hover:bg-white/10 transition-colors ${
          data.error ? 'text-red-200 border-red-500/20' : 'text-slate-300 border-white/5'
        }`}>
          {data.analysis}
        </p>
      </div>

      {/* Dynamic Widgets */}
      <div className="space-y-6">
        {data.widgets.map((widget, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
               {widget.type === 'code' ? <Code size={12}/> : 
                widget.type === 'prototype' ? <Laptop size={12}/> : 
                widget.type === 'security_report' ? <ShieldAlert size={12}/> :
                <Layers size={12}/>} 
               {widget.title}
            </h3>
            
            {widget.type === 'steps' && (
               <div className="space-y-2">
                 {(Array.isArray(widget.content) ? widget.content : JSON.parse(widget.content || "[]")).map((step: any, sIdx: number) => (
                   <div key={sIdx} className="flex gap-3 items-start group">
                      <div className="mt-1 w-5 h-5 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] text-slate-300 group-hover:bg-violet-500 group-hover:border-violet-400 group-hover:text-white transition-all">
                        {sIdx + 1}
                      </div>
                      <div className="flex-1 bg-slate-800/30 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                         <div className="text-sm font-medium text-slate-200">{step.title || step}</div>
                         {step.description && <div className="text-xs text-slate-400 mt-1">{step.description}</div>}
                      </div>
                   </div>
                 ))}
               </div>
            )}

            {widget.type === 'code' && (
              <div className="bg-[#0d1117] p-4 rounded-xl border border-white/10 overflow-x-auto relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="px-2 py-1 bg-white/10 rounded text-[10px] text-white hover:bg-white/20">Copy</button>
                </div>
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{widget.content}</pre>
              </div>
            )}

            {widget.type === 'prototype' && (
              <div className="bg-slate-900 rounded-xl border border-white/10 overflow-hidden flex flex-col h-96 shadow-2xl">
                 <div className="bg-slate-800 px-3 py-2 flex items-center space-x-2 border-b border-white/5">
                    <div className="flex space-x-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="flex-1 text-center flex items-center justify-center gap-2">
                       <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded bg-black/20 text-[10px] text-slate-500 font-mono">
                         {data.domain.includes('Mobile') ? <Smartphone size={10} /> : <Monitor size={10} />}
                         Live Preview
                       </div>
                    </div>
                 </div>
                 <div className="flex-1 bg-white p-4 overflow-auto text-black">
                    <div dangerouslySetInnerHTML={{ __html: widget.content }} />
                 </div>
              </div>
            )}
            
            {widget.type === 'security_report' && (
              <div className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20 space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-red-300 text-sm font-bold">Risk Assessment</span>
                    <span className="text-xs text-red-400 font-mono">HIGH PRIORITY</span>
                 </div>
                 <p className="text-sm text-slate-300">{widget.content}</p>
              </div>
            )}

            {(widget.type === 'impact' || widget.type === 'summary') && (
               <div className="bg-gradient-to-br from-violet-900/20 to-slate-900/20 p-4 rounded-xl border border-violet-500/20">
                 <p className="text-sm text-violet-200">{widget.content}</p>
               </div>
            )}
            
            {widget.type === 'chart' && (
              <div className="bg-slate-800/30 p-4 rounded-xl border border-white/10 flex items-center justify-center h-32">
                 <p className="text-xs text-slate-500 font-mono">VISUALIZATION RENDERED</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InsightPanel;