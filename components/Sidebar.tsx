import React from 'react';
import { Mode } from '../types';
import { Sparkles, Globe, GraduationCap, Briefcase, Code, Cpu, Heart, Activity, Accessibility, Languages, AppWindow, Video, Image, Boxes, Shield, Box, RefreshCcw, Edit } from 'lucide-react';

interface SidebarProps {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
  isOpen: boolean;
}

const MODES = [
  { id: Mode.UNIVERSAL, icon: Cpu, label: 'Universal' },
  { id: Mode.ARCHITECT, icon: AppWindow, label: 'App Architect' },
  { id: Mode.MAGIC, icon: Sparkles, label: 'Magic Build' },
  { id: Mode.VIDEO, icon: Video, label: 'Video Studio' },
  { id: Mode.IMAGE, icon: Image, label: 'Image Studio' },
  { id: Mode.THREE_D, icon: Box, label: '3D Generator' },     // New
  { id: Mode.EDITOR, icon: Edit, label: 'Media Editor' },     // New
  { id: Mode.CONVERTER, icon: RefreshCcw, label: 'Converter' }, // New
  { id: Mode.SECURITY, icon: Shield, label: 'Security Guard' }, // New
  { id: Mode.CODE, icon: Code, label: 'Code Forge' },
  { id: Mode.IMPACT, icon: Globe, label: 'Global Impact' },
  { id: Mode.EDUCATOR, icon: GraduationCap, label: 'Educator' },
  { id: Mode.TUTOR, icon: Languages, label: 'Language Tutor' },
  { id: Mode.BUSINESS, icon: Briefcase, label: 'Business' },
  { id: Mode.LIFE, icon: Heart, label: 'Fix My Life' },
  { id: Mode.HEALTH, icon: Activity, label: 'Health Lens' },
  { id: Mode.ACCESSIBILITY, icon: Accessibility, label: 'Accessible' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, isOpen }) => {
  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-72 glass-panel border-r-0 border-white/10 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
      <div className="p-8 flex items-center space-x-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <Boxes className="w-6 h-6 text-white" />
        </div>
        <div>
           <h1 className="text-2xl font-display font-bold text-white tracking-tight">
             SHAH
           </h1>
           <span className="text-[10px] font-mono text-violet-300 tracking-widest uppercase">AI Studio</span>
        </div>
      </div>

      <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setMode(mode.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
              currentMode === mode.id
                ? 'bg-white/10 border border-white/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)] translate-x-1'
                : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:translate-x-1'
            }`}
          >
            <mode.icon className={`w-5 h-5 transition-colors duration-300 ${currentMode === mode.id ? 'text-violet-400' : 'text-slate-500 group-hover:text-violet-300'}`} />
            <span className="font-medium tracking-wide text-sm">{mode.label}</span>
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-6 border-t border-white/5 bg-gradient-to-t from-slate-900/90 to-transparent">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
          <span>SYSTEM: ONLINE</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;