import React, { useEffect, useRef } from 'react';
import { Mode } from '../types';

interface Background3DProps {
  mode: Mode;
}

const Background3D: React.FC<Background3DProps> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Helper functions must be defined before use
    const getShapeForMode = (m: Mode) => {
      if (m === Mode.HEALTH || m === Mode.LIFE) return 'DNA';
      if (m === Mode.MAGIC || m === Mode.BUSINESS || m === Mode.CODE || m === Mode.CONVERTER) return 'TORUS';
      if (m === Mode.SECURITY) return 'GRID';
      if (m === Mode.THREE_D || m === Mode.ARCHITECT) return 'CUBE';
      return 'SPHERE';
    }

    const getRenderConfig = (m: Mode) => {
      switch (m) {
        case Mode.MAGIC: return { color: '236, 72, 153', speed: 0.008, particleSize: 1.8 }; // Pink
        case Mode.IMPACT: return { color: '16, 185, 129', speed: 0.002, particleSize: 1.5 }; // Green
        case Mode.HEALTH: return { color: '244, 63, 94', speed: 0.003, particleSize: 1.5 }; // Rose
        case Mode.CODE: case Mode.CONVERTER: return { color: '59, 130, 246', speed: 0.004, particleSize: 1.2 }; // Blue
        case Mode.BUSINESS: return { color: '245, 158, 11', speed: 0.003, particleSize: 1.5 }; // Amber
        case Mode.SECURITY: return { color: '239, 68, 68', speed: 0.002, particleSize: 1.4 }; // Red
        case Mode.THREE_D: return { color: '6, 182, 212', speed: 0.005, particleSize: 1.6 }; // Cyan
        default: return { color: '139, 92, 246', speed: 0.002, particleSize: 1.5 }; // Violet
      }
    }

    // 3D Point class
    class Point {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
      baseZ: number;

      constructor(x: number, y: number, z: number) {
        this.x = x; this.y = y; this.z = z;
        this.baseX = x; this.baseY = y; this.baseZ = z;
      }

      rotate(angleX: number, angleY: number) {
        let cos = Math.cos(angleX);
        let sin = Math.sin(angleX);
        let y = this.y * cos - this.z * sin;
        let z = this.y * sin + this.z * cos;
        this.y = y;
        this.z = z;

        cos = Math.cos(angleY);
        sin = Math.sin(angleY);
        let x = this.x * cos - this.z * sin;
        z = this.x * sin + this.z * cos;
        this.x = x;
        this.z = z;
      }
    }

    const points: Point[] = [];
    const numPoints = 800;
    
    // Shape generation logic
    const createShape = () => {
      points.length = 0;
      const shapeType = getShapeForMode(mode);
      
      if (shapeType === 'TORUS') {
        const R = 250; 
        const r = 100;
        for (let i = 0; i < numPoints; i++) {
          const u = Math.random() * Math.PI * 2;
          const v = Math.random() * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          points.push(new Point(x, y, z));
        }
      } else if (shapeType === 'DNA') {
        const radius = 150;
        const height = 600;
        for (let i = 0; i < numPoints; i++) {
          const t = Math.random() * 10 * Math.PI;
          const type = i % 2 === 0 ? 1 : -1;
          const x = radius * Math.cos(t + (type * Math.PI));
          const y = (Math.random() - 0.5) * height * 1.5;
          const z = radius * Math.sin(t + (type * Math.PI));
          points.push(new Point(x, y, z));
        }
      } else if (shapeType === 'CUBE') {
        const size = 250;
        for(let i=0; i<numPoints; i++) {
           const x = (Math.random() - 0.5) * size * 2;
           const y = (Math.random() - 0.5) * size * 2;
           const z = (Math.random() - 0.5) * size * 2;
           points.push(new Point(x,y,z));
        }
      } else if (shapeType === 'GRID') {
        const size = 600;
        const step = 50;
        for (let x = -size/2; x < size/2; x+=step) {
          for (let z = -size/2; z < size/2; z+=step) {
             points.push(new Point(x, 100, z)); // Floor plane
             if (Math.random() > 0.8) points.push(new Point(x, -100, z)); // Ceiling fragments
          }
        }
      } else {
        // SPHERE (Default)
        const radius = 300;
        for (let i = 0; i < numPoints; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          points.push(new Point(x, y, z));
        }
      }
    };

    createShape();

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      
      const config = getRenderConfig(mode);
      const rotationSpeed = config.speed;
      
      const mouseXEffect = (mouseRef.current.x - cx) * 0.00005;
      const mouseYEffect = (mouseRef.current.y - cy) * 0.00005;

      points.forEach(p => {
        p.x = p.baseX; p.y = p.baseY; p.z = p.baseZ;
        p.rotate(time * rotationSpeed + mouseYEffect, time * rotationSpeed * 0.5 + mouseXEffect);

        const scale = 800 / (800 + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        const alpha = (scale - 0.5) * 1.5;
        if (alpha > 0) {
          ctx.beginPath();
          ctx.arc(px, py, scale * (config.particleSize), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${config.color}, ${alpha})`;
          ctx.fill();
        }
      });

      time += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createShape();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
    />
  );
};

export default Background3D;