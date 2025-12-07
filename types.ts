export enum Mode {
  UNIVERSAL = 'Universal Solver',
  MAGIC = 'Magic Build',
  ARCHITECT = 'App Architect', 
  VIDEO = 'Video Studio',      
  IMAGE = 'Image Studio',      
  THREE_D = '3D Generator',    // New: 3D Style Images
  EDITOR = 'Media Editor',     // New: Edit/Transform
  CONVERTER = 'File Converter',// New: Conversion Code/Help
  SECURITY = 'Security Guard', // New: Security Assistant
  IMPACT = 'Global Impact',
  EDUCATOR = 'Educator',
  TUTOR = 'Language Tutor',
  LIFE = 'Fix My Life',
  BUSINESS = 'Business Opt.',
  CODE = 'Code Forge',
  HEALTH = 'Health Lens',
  ACCESSIBILITY = 'Accessible'
}

export interface Widget {
  type: 'code' | 'steps' | 'impact' | 'chart' | 'summary' | 'prototype' | 'security_report';
  title: string;
  content: any; // Flexible content based on type
}

export interface NexusResponse {
  narrative: string; // The storytelling part
  visualCues: string[]; // e.g. ["(glow-in)", "(3D rotate fast)"]
  domain: string;
  impactScore: number; // 0-100
  analysis: string;
  widgets: Widget[];
  suggestedActions: string[];
  exportOptions: string[]; 
  generatedMedia?: { // New: For AI generated content
    type: 'image' | 'video';
    url: string;
    mimeType: string;
  };
  error?: boolean; // Flag for error states
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // Display text
  attachment?: {
    type: 'image' | 'audio' | 'video';
    data: string; // base64
    mimeType?: string;
  };
  structuredData?: NexusResponse; // If assistant
  timestamp: number;
}