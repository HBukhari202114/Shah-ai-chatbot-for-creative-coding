import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InsightPanel from './components/InsightPanel';
import Background3D from './components/Background3D';
import { Mode, Message, NexusResponse } from './types';
import { generateNexusResponse } from './services/geminiService';
import { Mic, Send, Image as ImageIcon, Menu, X, StopCircle, Video, Paperclip } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<Mode>(Mode.UNIVERSAL);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<NexusResponse | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachment, setAttachment] = useState<{ type: 'image' | 'audio' | 'video', data: string, mimeType?: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || isAnalyzing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || (attachment ? `Analyze this ${attachment.type}` : ''),
      attachment: attachment ? attachment : undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setIsAnalyzing(true);
    setActiveAnalysis(null); 

    try {
      const response = await generateNexusResponse(
        userMsg.content, 
        mode, 
        userMsg.attachment
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.narrative, 
        structuredData: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
      setActiveAnalysis(response);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "System Malfunction: Neural link disrupted. Please retry.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setAttachment({
          type: type,
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            setAttachment({
              type: 'audio',
              data: reader.result as string,
              mimeType: 'audio/webm'
            });
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic error:", err);
        alert("Microphone access denied.");
      }
    }
  };

  const getPlaceholder = () => {
    if (attachment?.type === 'audio') return "Listening to audio input...";
    if (mode === Mode.VIDEO) return "Describe the video you want to create...";
    if (mode === Mode.IMAGE) return "Describe the image you want to generate...";
    if (mode === Mode.ARCHITECT) return "Describe the app you want to build (Mobile, Web, Desktop)...";
    return "Enter command, upload media, or ask for analysis...";
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden selection:bg-violet-500/30 font-sans">
      <Background3D mode={mode} />
      
      <button 
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur rounded-lg border border-white/10"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        isOpen={isSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center justify-between px-6 md:px-8 border-b border-white/5 bg-slate-900/20 backdrop-blur-sm">
          <div className="ml-10 md:ml-0">
             <h2 className="text-lg font-medium text-slate-200 tracking-wide">{mode}</h2>
             <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Protocol: Encrypted // Latency: 12ms</p>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col relative">
            <ChatArea messages={messages} isAnalyzing={isAnalyzing} />
            
            <div className="p-6 md:p-8 pb-2">
              <div className="max-w-4xl mx-auto space-y-2">
                {attachment && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 rounded-full border border-violet-500/20 text-xs text-violet-300 backdrop-blur-md">
                      {attachment.type === 'image' && <ImageIcon size={12}/>}
                      {attachment.type === 'video' && <Video size={12}/>}
                      {attachment.type === 'audio' && <Mic size={12}/>}
                      <span className="capitalize">{attachment.type} Attached</span>
                      <button onClick={() => setAttachment(null)} className="hover:text-white ml-1"><X size={12} /></button>
                  </div>
                )}
                
                <div className="relative flex items-center gap-2 p-2 rounded-2xl glass-panel transition-all focus-within:border-violet-500/40 focus-within:shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={handleFileSelect} 
                  />
                  
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={getPlaceholder()}
                    className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 text-sm md:text-base font-light"
                    disabled={isAnalyzing}
                  />

                  <button 
                    onClick={toggleRecording}
                    className={`p-3 rounded-xl transition-all ${isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                  >
                    {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                  </button>
                  
                  <button 
                    onClick={handleSend}
                    disabled={isAnalyzing || (!input && !attachment)}
                    className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
             <div className="w-full py-2 text-center z-20 bg-slate-900/40 backdrop-blur-sm border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-mono">
                  Developed by Hussnain Shah Bukhari. All rights reserved.
                </p>
             </div>
          </div>

          <div className="hidden lg:block w-[450px] p-6 pl-0">
            <InsightPanel data={activeAnalysis} isLoading={isAnalyzing} />
          </div>
        </div>
      </div>
    </div>
  );
}