import { useEffect, useRef } from 'react';

export interface VRSceneConfig {
  levelIndex: number;
  totalLevels: number;
  likeEmoji: string;
  breathingActive: boolean;
}

/**
 * Animated VR scene for heights phobia exposure.
 * Renders a 3D-like cityscape on canvas that progressively gets higher
 * as the patient advances through levels.
 */
export default function VRHeightsScene({ levelIndex, totalLevels, likeEmoji, breathingActive }: VRSceneConfig) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const likeEmojiRef = useRef(likeEmoji);
  const breathingRef = useRef(breathingActive);
  const levelRef = useRef(levelIndex);

  likeEmojiRef.current = likeEmoji;
  breathingRef.current = breathingActive;
  levelRef.current = levelIndex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const c = ctx; // non-null alias for nested functions
    const W = canvas.width = canvas.clientWidth * 2;
    const H = canvas.height = canvas.clientHeight * 2;
    ctx.scale(1, 1);

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    // Height progression: level 0 = ground, level 9 = sky/paragliding
    function getHeightProgress(level: number, time: number) {
      const base = level / 9; // 0 to 1
      const sway = Math.sin(time * 0.0008) * 0.015;
      return Math.max(0, Math.min(1, base + sway));
    }

    function drawSky(ctx: CanvasRenderingContext2D, hProg: number, time: number) {
      // Sky color transitions from ground-level blue to high-altitude deep blue
      const topR = lerp(135, 30, hProg);
      const topG = lerp(206, 60, hProg);
      const topB = lerp(235, 120, hProg);
      const botR = lerp(200, 100, hProg);
      const botG = lerp(230, 150, hProg);
      const botB = lerp(255, 200, hProg);

      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgb(${topR},${topG},${topB})`);
      grad.addColorStop(1, `rgb(${botR},${botG},${botB})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Sun glow
      const sunX = W * 0.75;
      const sunY = lerp(H * 0.3, H * 0.15, hProg);
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.3);
      sunGrad.addColorStop(0, `rgba(255, 240, 200, ${lerp(0.4, 0.25, hProg)})`);
      sunGrad.addColorStop(1, 'rgba(255, 240, 200, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, W, H);

      // Clouds at higher levels
      if (hProg > 0.3) {
        const cloudAlpha = (hProg - 0.3) / 0.7 * 0.6;
        for (let i = 0; i < 5; i++) {
          const cx = ((time * 0.02 + i * 300) % (W + 200)) - 100;
          const cy = H * (0.1 + i * 0.08) + Math.sin(time * 0.001 + i) * 10;
          drawCloud(ctx, cx, cy, 60 + i * 15, cloudAlpha);
        }
      }
    }

    function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, alpha: number) {
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawCity(ctx: CanvasRenderingContext2D, hProg: number, time: number) {
      const horizonY = lerp(H * 0.55, H * 0.85, hProg);
      const buildingScale = lerp(1, 0.15, hProg);

      // Ground / city base
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      groundGrad.addColorStop(0, `rgba(100, 110, 130, ${lerp(0.8, 0.3, hProg)})`);
      groundGrad.addColorStop(1, `rgba(70, 80, 100, ${lerp(0.9, 0.2, hProg)})`);
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // Buildings — recede with height
      const buildings = 40;
      const sway = Math.sin(time * 0.0006) * 3 * hProg;
      for (let i = 0; i < buildings; i++) {
        const bx = (i / buildings) * W;
        const bw = W / buildings * 1.2;
        const bh = (40 + Math.sin(i * 2.3) * 30 + Math.cos(i * 1.7) * 20) * buildingScale;
        const by = horizonY - bh;
        const shade = 0.5 + Math.sin(i * 1.1) * 0.15;
        ctx.fillStyle = `rgba(${60 * shade}, ${70 * shade}, ${90 * shade}, ${lerp(0.85, 0.4, hProg)})`;
        ctx.fillRect(bx + sway, by, bw - 2, bh);

        // Windows
        if (buildingScale > 0.3 && hProg < 0.7) {
          ctx.fillStyle = `rgba(255, 220, 120, ${lerp(0.6, 0.1, hProg)})`;
          for (let wy = by + 8; wy < by + bh - 5; wy += 12) {
            for (let wx = bx + 4; wx < bx + bw - 6; wx += 10) {
              if (Math.sin(i * 7 + wy * 0.1) > 0.3) {
                ctx.fillRect(wx + sway, wy, 4, 6);
              }
            }
          }
        }
      }

      // Trees at low levels
      if (hProg < 0.4) {
        const treeAlpha = (0.4 - hProg) / 0.4 * 0.7;
        for (let i = 0; i < 15; i++) {
          const tx = (i / 15) * W + Math.sin(i * 3) * 20;
          const ty = horizonY + 5;
          ctx.fillStyle = `rgba(60, 100, 50, ${treeAlpha})`;
          ctx.beginPath();
          ctx.arc(tx, ty - 10, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(80, 60, 40, ${treeAlpha})`;
          ctx.fillRect(tx - 1, ty - 5, 2, 8);
        }
      }
    }

    function drawPlatform(ctx: CanvasRenderingContext2D, hProg: number, time: number) {
      // The platform/balcony the user stands on — visible at mid levels
      if (hProg > 0.15 && hProg < 0.95) {
        const platformY = lerp(H * 0.75, H * 0.6, hProg);
        const platformAlpha = hProg > 0.2 ? 0.8 : (hProg - 0.15) / 0.05 * 0.8;
        const sway = Math.sin(time * 0.0008) * 4;

        // Balcony railing
        ctx.strokeStyle = `rgba(200, 210, 220, ${platformAlpha})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(W * 0.1 + sway, platformY);
        ctx.lineTo(W * 0.9 + sway, platformY);
        ctx.stroke();

        // Railing posts
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const px = W * 0.15 + (i / 7) * W * 0.7 + sway;
          ctx.beginPath();
          ctx.moveTo(px, platformY);
          ctx.lineTo(px, platformY - 40);
          ctx.stroke();
        }

        // Top rail
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(W * 0.12 + sway, platformY - 40);
        ctx.lineTo(W * 0.88 + sway, platformY - 40);
        ctx.stroke();

        // Floor texture
        ctx.fillStyle = `rgba(120, 130, 145, ${platformAlpha * 0.5})`;
        ctx.fillRect(W * 0.05 + sway, platformY, W * 0.9, 15);
      }

      // Glass floor at very high levels
      if (hProg > 0.5) {
        const glassAlpha = (hProg - 0.5) / 0.45 * 0.35;
        const glassY = H * 0.65;
        const grad = ctx.createLinearGradient(0, glassY, 0, glassY + 20);
        grad.addColorStop(0, `rgba(180, 220, 255, ${glassAlpha})`);
        grad.addColorStop(1, `rgba(100, 150, 200, ${glassAlpha * 0.3})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, glassY, W, 20);

        // Reflection lines
        ctx.strokeStyle = `rgba(255, 255, 255, ${glassAlpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const lx = (time * 0.03 + i * 120) % W;
          ctx.beginPath();
          ctx.moveTo(lx, glassY + 2);
          ctx.lineTo(lx + 40, glassY + 2);
          ctx.stroke();
        }
      }
    }

    function drawCompanion(ctx: CanvasRenderingContext2D, hProg: number, time: number, emoji: string) {
      // Companion (cat/dog/etc) sits near the user
      const cx = W * 0.85;
      const cy = lerp(H * 0.72, H * 0.58, hProg);
      const bob = Math.sin(time * 0.002) * 3;

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 18, 18, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Companion body (rounded shape)
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, cx, cy + bob);
    }

    function drawBreathingGuide(ctx: CanvasRenderingContext2D, time: number, active: boolean) {
      if (!active) return;
      const cx = W * 0.5;
      const cy = H * 0.4;
      const cycle = (Math.sin(time * 0.0015) + 1) / 2; // 0..1
      const radius = 30 + cycle * 50;
      const alpha = 0.3 + cycle * 0.3;

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha + 0.3})`;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cycle > 0.5 ? 'شهيق' : 'زفير', cx, cy);
    }

    function drawFog(ctx: CanvasRenderingContext2D, hProg: number, time: number) {
      // Atmospheric fog that decreases with height
      const fogAlpha = (1 - hProg) * 0.15;
      if (fogAlpha < 0.01) return;
      const grad = ctx.createLinearGradient(0, H * 0.6, 0, H);
      grad.addColorStop(0, `rgba(200, 210, 220, 0)`);
      grad.addColorStop(1, `rgba(200, 210, 220, ${fogAlpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, H * 0.6, W, H * 0.4);
    }

    function drawBirds(ctx: CanvasRenderingContext2D, hProg: number, time: number) {
      if (hProg < 0.2) return;
      const alpha = (hProg - 0.2) / 0.8 * 0.4;
      for (let i = 0; i < 4; i++) {
        const bx = (time * 0.05 + i * 250) % (W + 100) - 50;
        const by = H * (0.15 + i * 0.05) + Math.sin(time * 0.002 + i) * 8;
        const wing = Math.sin(time * 0.008 + i * 2) * 6;
        ctx.strokeStyle = `rgba(40, 40, 50, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 8, by + wing);
        ctx.quadraticCurveTo(bx, by - 3, bx + 8, by + wing);
        ctx.stroke();
      }
    }

    function drawVROverlay(ctx: CanvasRenderingContext2D) {
      // Subtle VR lens vignette
      const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.65);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Lens circle outline
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, W * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    }

    function frame() {
      timeRef.current += 16;
      const time = timeRef.current;
      const hProg = getHeightProgress(levelRef.current, time);

      drawSky(c, hProg, time);
      drawCity(c, hProg, time);
      drawBirds(c, hProg, time);
      drawPlatform(c, hProg, time);
      drawCompanion(c, hProg, time, likeEmojiRef.current);
      drawFog(c, hProg, time);
      drawBreathingGuide(c, time, breathingRef.current);
      drawVROverlay(c);

      animRef.current = requestAnimationFrame(frame);
    }

    frame();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ imageRendering: 'auto' }}
    />
  );
}
