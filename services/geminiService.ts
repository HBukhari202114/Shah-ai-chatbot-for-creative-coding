import { GoogleGenAI } from "@google/genai";
import { NexusResponse, Mode } from '../types';

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA_DEF = {
  type: "OBJECT",
  properties: {
    narrative: { type: "STRING", description: "Cinematic, emotional, high-tech storytelling narration." },
    visualCues: { 
      type: "ARRAY", 
      items: { type: "STRING" }, 
      description: "Animation triggers: '(glow-in)', '(slide-left)', '(particles-fast)', '(rotate-3d)'." 
    },
    domain: { type: "STRING", description: "Detected domain." },
    impactScore: { type: "INTEGER", description: "Impact score 0-100." },
    analysis: { type: "STRING", description: "Deep insightful analysis utilizing researched data." },
    widgets: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ['code', 'steps', 'impact', 'chart', 'summary', 'prototype', 'security_report'] },
          title: { type: "STRING" },
          content: { type: "STRING", description: "For 'prototype', valid HTML/Tailwind. For steps, JSON array." }
        }
      },
      description: "UI Components."
    },
    suggestedActions: { type: "ARRAY", items: { type: "STRING" } },
    exportOptions: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: ["narrative", "domain", "impactScore", "analysis", "widgets", "suggestedActions"]
};

// --- ERROR HANDLING HELPER ---
const handleError = (error: any, context: string): NexusResponse => {
  console.error(`Error in ${context}:`, error);
  let message = "An unexpected disruption occurred in the neural link.";
  let domain = "System Failure";
  
  const errStr = error.toString().toLowerCase();

  if (errStr.includes('quota') || errStr.includes('429')) {
    message = "API Resource Quota Exceeded. Please wait a moment before retrying.";
    domain = "Resource Limit";
  } else if (errStr.includes('safety') || errStr.includes('blocked')) {
    message = "The request was flagged by safety protocols. Please adjust your prompt.";
    domain = "Safety Protocol";
  } else if (errStr.includes('network') || errStr.includes('fetch')) {
    message = "Network connection unstable. Unable to reach the AI core.";
    domain = "Network Error";
  }

  return {
    narrative: message,
    visualCues: ["(error-glitch)", "(fade-red)"],
    domain: domain,
    impactScore: 0,
    analysis: `Error Details: ${error.message || errStr}`,
    widgets: [{ type: 'summary', title: 'Status Alert', content: 'Process Terminated.' }],
    suggestedActions: ["Retry", "Check Connection", "Simplify Request"],
    exportOptions: [],
    error: true
  };
};

// --- VIDEO GENERATION (VEO) ---
const generateVideo = async (prompt: string): Promise<NexusResponse> => {
  const ai = getClient();
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Polling logic
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI.");

    const authenticatedUrl = `${videoUri}&key=${process.env.API_KEY}`;

    return {
      narrative: "Visual sequence materialized. Rendering high-fidelity motion stream.",
      visualCues: ["(cinematic-fade)", "(play-video)"],
      domain: "Video Production",
      impactScore: 95,
      analysis: `Generated 720p video based on prompt: "${prompt}". Model: Veo 3.1 Fast.`,
      widgets: [],
      suggestedActions: ["Download Video", "Generate Variations", "Extend Clip"],
      exportOptions: ["MP4"],
      generatedMedia: {
        type: 'video',
        url: authenticatedUrl,
        mimeType: 'video/mp4'
      }
    };
  } catch (error) {
    return handleError(error, "Video Generation");
  }
};

// --- IMAGE GENERATION (IMAGEN) ---
const generateImage = async (prompt: string, is3DMode: boolean = false): Promise<NexusResponse> => {
  const ai = getClient();
  try {
    const finalPrompt = is3DMode 
      ? `3D render, high fidelity, unreal engine 5 style, isometric, volumetric lighting, 8k resolution: ${prompt}` 
      : prompt;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001', 
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      },
    });

    const base64Image = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64Image) throw new Error("Image generation failed to return bytes.");
    
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return {
      narrative: is3DMode ? "3D Topology constructed. Rendering volumetric assets." : "Visual asset visualized. High-resolution render complete.",
      visualCues: ["(flash)", "(reveal-image)"],
      domain: is3DMode ? "3D Modeling" : "Creative Studio",
      impactScore: 88,
      analysis: `Generated ${is3DMode ? '3D Render' : 'Image'} for: "${prompt}". Model: Imagen 3.0.`,
      widgets: [],
      suggestedActions: ["Upscale", "Edit Image", "Save to Gallery"],
      exportOptions: ["JPEG", "PNG"],
      generatedMedia: {
        type: 'image',
        url: imageUrl,
        mimeType: 'image/jpeg'
      }
    };
  } catch (error) {
    return handleError(error, "Image Generation");
  }
};

// --- MAIN GENERATION ---
export const generateNexusResponse = async (
  prompt: string,
  mode: Mode,
  attachment?: { type: 'image' | 'audio' | 'video', data: string, mimeType?: string }
): Promise<NexusResponse> => {

  // --- SPECIAL MODE ROUTING ---

  // Video Mode
  if (mode === Mode.VIDEO && !attachment) {
    return generateVideo(prompt);
  }

  // Image Mode
  if (mode === Mode.IMAGE && !attachment) {
    return generateImage(prompt, false);
  }

  // 3D Mode
  if (mode === Mode.THREE_D && !attachment) {
    return generateImage(prompt, true);
  }

  // Editor Mode: "Edit this image"
  // Logic: 1. Use Vision to understand image + prompt -> 2. Generate new Image Prompt -> 3. Call Imagen
  if (mode === Mode.EDITOR && attachment && attachment.type === 'image') {
    try {
      const ai = getClient();
      // Step 1: Analyze image to get a description
      const analysisResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: attachment.mimeType || 'image/jpeg', data: attachment.data.includes(',') ? attachment.data.split(',')[1] : attachment.data } },
            { text: `Describe this image in detail. Then, considering the user's request: "${prompt}", create a full prompt for an image generator to recreate this image with the requested changes.` }
          ]
        }
      });
      
      const newPrompt = analysisResp.text || prompt;
      return generateImage(newPrompt, false);
    } catch (e) {
      return handleError(e, "Editor Analysis");
    }
  }

  const ai = getClient();
  const schemaString = JSON.stringify(RESPONSE_SCHEMA_DEF, null, 2);

  let roleDefinition = "You are SHAH, the Ultimate Universal Intelligence.";
  
  switch (mode) {
    case Mode.ARCHITECT:
      roleDefinition = "You are the CHIEF SOFTWARE ARCHITECT. Build apps. Return 'prototype' widget for main code, 'code' for snippets.";
      break;
    case Mode.SECURITY:
      roleDefinition = "You are a MILITARY-GRADE CYBERSECURITY EXPERT. Analyze permissions, code vulnerabilities, and privacy risks. Provide a 'security_report' widget.";
      break;
    case Mode.CONVERTER:
      roleDefinition = "You are a UNIVERSAL FILE CONVERTER. Since you cannot process files directly in browser, GENERATE PYTHON (ffmpeg/pandas/pillow) or NODE.JS scripts that the user can run to convert their files. Explain the code.";
      break;
    case Mode.EDITOR:
       roleDefinition = "You are a MEDIA EDITOR. If no image is provided, ask for one. If text is provided, explain how you would edit it or write code to do so.";
       break;
    case Mode.THREE_D:
      roleDefinition = "You are a 3D MODELING ASSISTANT. If user asks for an image, we handle it externally. If user asks for OBJ/GLB code, generate Three.js code.";
      break;
    default:
      roleDefinition = "You are SHAH. Research, analyze, create.";
  }

  let systemInstruction = `${roleDefinition}
  Current Mode: ${mode}.
  
  OUTPUT: JSON Object matching this schema:
  ${schemaString}
  
  RULES:
  - If SECURITY mode: Focus on risk assessment, permissions, and vulnerabilities.
  - If CONVERTER mode: Provide 'code' widgets with conversion scripts.
  - If ARCHITECT/MAGIC mode: Provide 'prototype' widget for UI.
  `;

  const parts: any[] = [];
  
  if (attachment) {
    const cleanData = attachment.data.includes(',') ? attachment.data.split(',')[1] : attachment.data;
    const mimeType = attachment.mimeType || (attachment.type === 'image' ? 'image/jpeg' : attachment.type === 'video' ? 'video/mp4' : 'audio/wav');
    parts.push({
      inlineData: { mimeType, data: cleanData }
    });
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }], 
      }
    });

    if (response.text) {
      try {
        let cleanText = response.text.trim();
        // Cleaner regex to strip markdown code blocks
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
        
        const parsed = JSON.parse(cleanText);
        return parsed as NexusResponse;
      } catch (e) {
        console.error("JSON Parse Error", e);
        // Fallback for malformed JSON but valid text
        return {
          narrative: response.text,
          visualCues: [],
          domain: "General Response",
          impactScore: 50,
          analysis: "Structured data parsing failed, displaying raw output.",
          widgets: [],
          suggestedActions: [],
          exportOptions: []
        };
      }
    }
    throw new Error("No response text received from model.");
  } catch (error) {
    return handleError(error, "Nexus Generation");
  }
};

export const textToSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: { parts: [{ text }] },
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
}