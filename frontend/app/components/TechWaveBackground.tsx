'use client';

import { useEffect, useRef } from 'react';

interface WaveLine {
  y: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  alpha: number;
  lineWidth: number;
  color: string;
  glow: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export default function TechWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const wavesRef = useRef<WaveLine[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 初始化波浪线条 - 科技感配色
    const colors = [
      { r: 0, g: 150, b: 255 },   // 科技蓝
      { r: 0, g: 200, b: 255 },   // 青色
      { r: 100, g: 200, b: 255 }, // 浅蓝
      { r: 0, g: 255, b: 200 },   // 薄荷绿
    ];

    // 基础波浪线条
    const baseWaves = Array.from({ length: 5 }, (_, i) => ({
      y: 0,
      amplitude: 30 + Math.random() * 40,
      frequency: 0.002 + Math.random() * 0.003,
      speed: 0.008 + Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.15 + Math.random() * 0.25,
      lineWidth: 1 + Math.random() * 2,
      color: `rgba(${colors[i % colors.length].r}, ${colors[i % colors.length].g}, ${colors[i % colors.length].b}`,
      glow: 0,
    }));

    // 新增：高亮科技感主线条 - 更亮、更粗、带发光效果
    const highlightWave = {
      y: 0,
      amplitude: 45,
      frequency: 0.003,
      speed: 0.015,
      phase: 0,
      alpha: 0.8,
      lineWidth: 3,
      color: 'rgba(0, 230, 255',
      glow: 15, // 发光强度
    };

    wavesRef.current = [...baseWaves, highlightWave];

    // 初始化粒子
    const initParticles = () => {
      particlesRef.current = Array.from({ length: 30 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        life: 0,
        maxLife: 200 + Math.random() * 200,
      }));
    };
    initParticles();

    // 绘制网格背景
    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = 'rgba(0, 150, 255, 0.03)';
      ctx.lineWidth = 1;

      const gridSize = 60;

      // 垂直线
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 水平线
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    // 绘制波浪
    const drawWave = (wave: WaveLine, width: number, height: number, time: number) => {
      const y = wave.y +
        Math.sin(wave.phase + time * wave.speed) * wave.amplitude * 0.3;

      // 绘制发光效果
      if (wave.glow > 0) {
        ctx.save();
        ctx.shadowBlur = wave.glow;
        ctx.shadowColor = wave.color.replace('rgba', '').replace(')', ', 0.5)').replace('(, ', '(');
      }

      ctx.beginPath();
      ctx.strokeStyle = `${wave.color}, ${wave.alpha})`;
      ctx.lineWidth = wave.lineWidth;
      ctx.lineCap = 'round';

      for (let x = 0; x <= width; x += 3) {
        const wy = y +
          Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7 + wave.phase * 0.5) * (wave.amplitude * 0.5);

        if (x === 0) {
          ctx.moveTo(x, wy);
        } else {
          ctx.lineTo(x, wy);
        }
      }
      ctx.stroke();

      if (wave.glow > 0) {
        ctx.restore();
      }
    };

    // 绘制粒子
    const drawParticles = (width: number, height: number) => {
      particlesRef.current.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // 边界检查
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        // 生命周期
        const lifeRatio = particle.life / particle.maxLife;
        const currentAlpha = particle.alpha * (1 - lifeRatio);

        // 绘制粒子
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 200, 255, ${currentAlpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // 重置粒子
        if (particle.life >= particle.maxLife) {
          particlesRef.current[index] = {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.5 + 0.2,
            life: 0,
            maxLife: 200 + Math.random() * 200,
          };
        }
      });
    };

    // 绘制连接线（科技感网络效果）
    const drawConnections = () => {
      const maxDistance = 100;
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        let connections = 0;
        for (let j = i + 1; j < particles.length && connections < 3; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const alpha = (1 - distance / maxDistance) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 150, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            connections++;
          }
        }
      }
    };

    // 动画循环
    let lastTime = 0;
    const animate = (currentTime: number) => {
      // 性能优化：限制帧率到 30fps
      if (currentTime - lastTime < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 绘制网格
      drawGrid(width, height);

      // 更新时间
      frameCountRef.current += 1;
      const time = frameCountRef.current;

      // 绘制波浪（分布在不同高度）
      wavesRef.current.forEach((wave, index) => {
        // 高亮波浪居中，其他波浪分布在上下
        if (wave.glow > 0) {
          wave.y = height * 0.5; // 高亮波浪在中心
        } else {
          wave.y = height * (0.25 + (index % 5) * 0.12);
        }
        drawWave(wave, width, height, time);
      });

      // 绘制粒子
      drawParticles(width, height);

      // 绘制连接线
      drawConnections();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #111827 100%)',
      }}
    />
  );
}
