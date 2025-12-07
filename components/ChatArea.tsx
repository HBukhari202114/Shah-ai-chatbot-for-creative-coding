import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import { Bot, User, Play, Volume2, Mic, Image as ImageIcon, Video, Download, AlertTriangle } from 'lucide-react';
import { textToSpeech } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatAreaProps {
  messages: Message[];
  isAnalyzing: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isAnalyzing }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  const handlePlayTTS = async (text: string) => {
    const audioUrl = await textToSpeech(text);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar scroll-smooth">
      {messages.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="h-full flex flex-col items-center justify-center text-center space-y-8 mt-20 md:mt-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-500/10 to-fuchsia-500/10 border border-white/10 backdrop-blur-md flex items-center justify-center relative z-10">
              <Bot className="w-10 h-10 text-white/70" />
            </div>
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Shah Studio</h2>
            <p className="text-slate-400 text-lg font-light">
              Full-Stack Architect, Video Engine, & Security Guard.
              <br/>What shall we create today?
            </p>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`flex items-start gap-4 max-w-4xl mx-auto ${
            msg.role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-white/10 shadow-lg ${
            msg.role === 'user' ? 'bg-slate-800/50' : msg.structuredData?.error ? 'bg-red-500/20 border-red-500/50' : 'bg-violet-600/20'
          }`}>
            {msg.role === 'user' ? <User className="w-5 h-5 text-slate-300" /> : 
             msg.structuredData?.error ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
             <Bot className="w-5 h-5 text-violet-300" />}
          </div>

          <div className={`flex flex-col space-y-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-6 rounded-2xl backdrop-blur-md border shadow-xl ${
              msg.role === 'user'
                ? 'bg-slate-800/40 border-slate-700/50 text-slate-200'
                : msg.structuredData?.error 
                  ? 'bg-red-900/10 border-red-500/20 text-red-100' 
                  : 'bg-white/5 border-white/10 text-slate-100'
            }`}>
              {/* User Attachments */}
              {msg.attachment?.type === 'image' && (
                <div className="mb-4 relative group">
                  <img src={msg.attachment.data} alt="Upload" className="max-w-full md:max-w-sm rounded-lg border border-white/10" />
                </div>
              )}
              {msg.attachment?.type === 'video' && (
                <div className="mb-4 relative group">
                  <video src={msg.attachment.data} controls className="max-w-full md:max-w-sm rounded-lg border border-white/10" />
                </div>
              )}
               {msg.attachment?.type === 'audio' && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-slate-900/50 rounded-lg border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-xs font-mono text-slate-400">AUDIO_WAVEFORM_DETECTED</span>
                </div>
              )}
              
              {/* AI Generated Media */}
              {msg.structuredData?.generatedMedia && (
                <div className="mb-6 rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-black/50">
                   {msg.structuredData.generatedMedia.type === 'video' ? (
                     <video 
                       src={msg.structuredData.generatedMedia.url} 
                       controls 
                       autoPlay 
                       loop 
                       className="w-full h-auto max-h-[400px]" 
                     />
                   ) : (
                     <img 
                       src={msg.structuredData.generatedMedia.url} 
                       alt="Generated" 
                       className="w-full h-auto" 
                     />
                   )}
                   <div className="p-3 bg-slate-900/80 flex justify-between items-center">
                      <span className="text-xs font-mono text-violet-300 uppercase">
                         {msg.structuredData.generatedMedia.type === 'video' ? 'Veo 3.1 Render' : 'Imagen 3.0 Render'}
                      </span>
                      <a 
                        href={msg.structuredData.generatedMedia.url} 
                        download={`shah-generated.${msg.structuredData.generatedMedia.mimeType.split('/')[1]}`}
                        className="flex items-center gap-2 text-xs text-white hover:text-violet-400 transition-colors"
                      >
                         <Download size={14} /> Save Asset
                      </a>
                   </div>
                </div>
              )}

              {msg.structuredData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                     <span className={`text-xs font-mono tracking-wider ${msg.structuredData.error ? 'text-red-400' : 'text-violet-400'}`}>
                       {msg.structuredData.error ? 'SYSTEM ALERT' : `DOMAIN // ${msg.structuredData.domain.toUpperCase()}`}
                     </span>
                     {!msg.structuredData.error && (
                       <button onClick={() => handlePlayTTS(msg.structuredData?.narrative || "")} className="hover:bg-white/10 p-1.5 rounded-full transition-colors group">
                          <Volume2 className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors"/>
                       </button>
                     )}
                  </div>
                  <p className="leading-relaxed text-lg font-light">{msg.structuredData.narrative}</p>
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap text-lg font-light">{msg.content}</p>
              )}
            </div>

            {msg.role === 'assistant' && msg.structuredData && (
              <div className="flex gap-2 flex-wrap">
                {msg.structuredData.suggestedActions.map((action, idx) => (
                  <motion.button 
                    key={idx} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 hover:bg-violet-900/20 text-xs text-slate-300 transition-all flex items-center gap-2 group backdrop-blur-sm"
                  >
                    <Play className="w-3 h-3 text-violet-500 group-hover:text-violet-300 transition-colors" />
                    {action}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      </AnimatePresence>

      {isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 max-w-4xl mx-auto pl-2"
        >
           <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 backdrop-blur-md">
             <div className="flex space-x-1.5">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
             </div>
             <span className="text-xs text-slate-400 font-mono tracking-widest">PRODUCING OUTPUT...</span>
          </div>
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatArea;