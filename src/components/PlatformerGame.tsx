import { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Star, Trophy, RotateCcw, ChevronLeft, Gamepad2, Hand, Sparkles } from 'lucide-react';
import type { Phobia, LikeId, Level } from '@/data/journey';
import { LIKES } from '@/data/journey';
import type { QuestionnaireConfig } from '@/data/gameConfig';
import { getDifficultyModifiers, getCalmingItem, getSymptomEffect, getPhobiaObjects, type PhobiaObject } from '@/data/gameConfig';

interface PlatformerGameProps {
  phobia: Phobia;
  likeType: LikeId;
  config: QuestionnaireConfig;
  level: Level;
  levelIndex: number;
  totalLevels: number;
  onWin: () => void;
  onBack: () => void;
}

const CANVAS_W = 760;
const CANVAS_H = 380;
const GRAVITY = 0.5;
const FRICTION = 0.82;
const JUMP_FORCE = -11;
const PLAYER_W = 28;
const PLAYER_H = 32;
const PLATFORM_H = 16;
const STAR_SIZE = 16;
const GOAL_W = 30;
const GOAL_H = 44;

interface Platform { x: number; y: number; w: number; }
interface Star { x: number; y: number; collected: boolean; baseY: number; }
interface CalmingItem { x: number; y: number; collected: boolean; baseY: number; }
interface ClickableObject { x: number; y: number; obj: PhobiaObject; state: 'idle' | 'clicked'; transformProgress: number; baseY: number; }
interface Goal { x: number; y: number; reached: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; }

export default function PlatformerGame({ phobia, likeType, config, level, levelIndex, totalLevels, onWin, onBack }: PlatformerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'won'>('playing');
  const [starsCollected, setStarsCollected] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [calmingCollected, setCalmingCollected] = useState(0);
  const [totalCalming, setTotalCalming] = useState(0);
  const [phobiaObjectsClicked, setPhobiaObjectsClicked] = useState(0);
  const [totalPhobiaObjects, setTotalPhobiaObjects] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [calmLevel, setCalmLevel] = useState(1 - config.intensity / 10); // starts low if high intensity

  const likeEmoji = LIKES.find((l) => l.id === likeType)?.emoji ?? '🐱';
  const calmingItem = getCalmingItem(config.calmingStrategy);
  const symptomEffect = getSymptomEffect(config.symptom, config.intensity / 10);
  const phobiaObjects = getPhobiaObjects(phobia.id);

  // Game refs
  const playerRef = useRef({ x: 40, y: 200, vx: 0, vy: 0, onGround: false, facing: 1, animFrame: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const starsRef = useRef<Star[]>([]);
  const calmingRef = useRef<CalmingItem[]>([]);
  const phobiaObjRef = useRef<ClickableObject[]>([]);
  const goalRef = useRef<Goal>({ x: 0, y: 0, reached: false });
  const particlesRef = useRef<Particle[]>([]);
  const cameraRef = useRef(0);
  const worldWidthRef = useRef(1200);
  const stateRef = useRef<'playing' | 'won'>('playing');
  const keysRef = useRef<Record<string, boolean>>({});
  const animRef = useRef<number>(0);
  const calmRef = useRef(1 - config.intensity / 10);
  const hoverObjRef = useRef<string | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, clicking: false });

  const modifiers = getDifficultyModifiers(config);

  const buildLevel = useCallback(() => {
    const difficulty = (levelIndex + 1) * modifiers.difficultyMult;
    const groundY = CANVAS_H - 30;
    const platforms: Platform[] = [];
    const stars: Star[] = [];

    // Ground segments with gaps sized by difficulty + intensity
    const gapSize = modifiers.gapBase + difficulty * 3;
    const segMin = 90;
    const segMax = 180;
    let x = 0;
    while (x < 1100) {
      const segW = segMin + Math.random() * (segMax - segMin);
      platforms.push({ x, y: groundY, w: segW });
      x += segW + gapSize;
    }
    platforms.push({ x: x, y: groundY, w: 120 });
    worldWidthRef.current = x + 120 + GOAL_W + 20;

    // Floating platforms — fewer for high intensity
    const numFloat = Math.max(3, Math.round(modifiers.platformCount + difficulty * 0.5));
    for (let i = 0; i < numFloat; i++) {
      const fx = 80 + Math.random() * (worldWidthRef.current - 200);
      const fy = groundY - 60 - Math.random() * 100;
      const fw = 50 + Math.random() * 50;
      platforms.push({ x: fx, y: fy, w: fw });
    }

    // Stars
    const numStars = 3 + Math.floor(difficulty / 2);
    for (let i = 0; i < numStars; i++) {
      const px = 100 + Math.random() * (worldWidthRef.current - 200);
      const py = groundY - 50 - Math.random() * 120;
      stars.push({ x: px, y: py, collected: false, baseY: py });
    }
    setTotalStars(numStars);

    // Calming items — based on questionnaire calming strategy
    const calmingItems: CalmingItem[] = [];
    for (let i = 0; i < modifiers.calmingCount; i++) {
      const px = 120 + (i / modifiers.calmingCount) * (worldWidthRef.current - 200) + Math.random() * 40;
      const py = groundY - 40 - Math.random() * 100;
      calmingItems.push({ x: px, y: py, collected: false, baseY: py });
    }
    calmingRef.current = calmingItems;
    setTotalCalming(calmingItems.length);

    // Clickable phobia objects — placed at accessible positions
    const clickables: ClickableObject[] = [];
    const objCount = Math.min(phobiaObjects.length, 3 + Math.floor(levelIndex / 3));
    for (let i = 0; i < objCount; i++) {
      const obj = phobiaObjects[i % phobiaObjects.length];
      const px = 100 + (i / objCount) * (worldWidthRef.current - 200) + Math.random() * 30;
      const py = groundY - 70 - Math.random() * 80;
      clickables.push({ x: px, y: py, obj, state: 'idle', transformProgress: 0, baseY: py });
    }
    phobiaObjRef.current = clickables;
    setTotalPhobiaObjects(clickables.length);

    // Goal
    const goalX = worldWidthRef.current - GOAL_W - 10;
    goalRef.current = { x: goalX, y: groundY - GOAL_H, reached: false };
    platformsRef.current = platforms;
    starsRef.current = stars;
    const speedMod = modifiers.speedMult;
    playerRef.current = { x: 40, y: groundY - PLAYER_H - 5, vx: 0, vy: 0, onGround: false, facing: 1, animFrame: 0 };
    cameraRef.current = 0;
    particlesRef.current = [];
    calmRef.current = 1 - config.intensity / 10;
    setCalmLevel(calmRef.current);
    // Store speed mult for use in game loop
    (playerRef.current as any).speedMod = speedMod;
  }, [levelIndex, modifiers, phobiaObjects, config.intensity]);

  function spawnParticles(x: number, y: number, color: string, count: number, size = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 30,
        color,
        size: size + Math.random() * 2,
      });
    }
  }

  // Keyboard
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (k === ' ' || k === 'arrowup' || k === 'w') e.preventDefault();
      if (showInstructions) setShowInstructions(false);
    }
    function handleKeyUp(e: KeyboardEvent) {
      keysRef.current[e.key.toLowerCase()] = false;
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showInstructions]);

  // Mouse for clicking phobia objects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function getMousePos(e: MouseEvent | TouchEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return {
        x: (clientX - rect.left) * scaleX + cameraRef.current,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function handleMove(e: MouseEvent) {
      const pos = getMousePos(e);
      mouseRef.current.x = pos.x;
      mouseRef.current.y = pos.y;
      // Check hover
      let foundHover: string | null = null;
      for (const co of phobiaObjRef.current) {
        if (co.state !== 'idle') continue;
        if (Math.abs(pos.x - co.x) < 22 && Math.abs(pos.y - co.y) < 22) {
          foundHover = co.obj.id;
          break;
        }
      }
      hoverObjRef.current = foundHover;
      canvas!.style.cursor = foundHover ? 'pointer' : 'default';
    }

    function handleClick(e: MouseEvent | TouchEvent) {
      const pos = getMousePos(e);
      let clicked = false;
      for (const co of phobiaObjRef.current) {
        if (co.state !== 'idle') continue;
        if (Math.abs(pos.x - co.x) < 24 && Math.abs(pos.y - co.y) < 24) {
          co.state = 'clicked';
          co.transformProgress = 0;
          clicked = true;

          // Apply effect based on interaction type
          if (co.obj.interaction === 'transform') {
            spawnParticles(co.x, co.y, '#34d399', 12, 5);
          } else if (co.obj.interaction === 'fade') {
            spawnParticles(co.x, co.y, '#60a5fa', 10, 4);
          } else {
            spawnParticles(co.x, co.y, '#fbbf24', 8, 4);
          }

          // Clicking phobia objects increases calm level
          calmRef.current = Math.min(1, calmRef.current + 0.12);
          setCalmLevel(calmRef.current);

          setPhobiaObjectsClicked((prev) => {
            const next = prev + 1;
            return next;
          });
          break;
        }
      }
      if (clicked && showInstructions) setShowInstructions(false);
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleClick(e); }, { passive: false });
    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [showInstructions]);

  const setTouchKey = (key: string, val: boolean) => {
    keysRef.current[key] = val;
    if (showInstructions) setShowInstructions(false);
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    buildLevel();
    stateRef.current = 'playing';

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    function update() {
      const p = playerRef.current;
      const k = keysRef.current;
      if (stateRef.current !== 'playing') return;

      const speedMod = (p as any).speedMod || 1;
      const moveSpeed = MOVE_SPEED * speedMod;

      if (k['arrowleft'] || k['a']) { p.vx = -moveSpeed; p.facing = -1; }
      else if (k['arrowright'] || k['d']) { p.vx = moveSpeed; p.facing = 1; }
      else { p.vx *= FRICTION; }

      if ((k['arrowup'] || k['w'] || k[' ']) && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        spawnParticles(p.x + PLAYER_W / 2, p.y + PLAYER_H, '#94c5e8', 5);
      }

      p.vy += GRAVITY;
      if (p.vy > 12) p.vy = 12;

      p.x += p.vx;
      if (p.x < 0) p.x = 0;
      if (p.x + PLAYER_W > worldWidthRef.current) p.x = worldWidthRef.current - PLAYER_W;

      const prevY = p.y;
      p.y += p.vy;
      p.onGround = false;

      for (const plat of platformsRef.current) {
        if (p.x + PLAYER_W > plat.x && p.x < plat.x + plat.w) {
          if (p.vy >= 0 && prevY + PLAYER_H <= plat.y + 2 && p.y + PLAYER_H >= plat.y) {
            p.y = plat.y - PLAYER_H;
            p.vy = 0;
            p.onGround = true;
          } else if (p.vy < 0 && prevY >= plat.y + PLATFORM_H - 2 && p.y < plat.y + PLATFORM_H) {
            p.y = plat.y + PLATFORM_H;
            p.vy = 0;
          }
        }
      }

      if (p.y > CANVAS_H + 100) {
        spawnParticles(p.x + PLAYER_W / 2, CANVAS_H - 50, '#ef4444', 10);
        p.x = 40;
        p.y = CANVAS_H - 30 - PLAYER_H - 5;
        p.vx = 0;
        p.vy = 0;
        cameraRef.current = 0;
        // Falling decreases calm slightly
        calmRef.current = Math.max(0, calmRef.current - 0.05);
        setCalmLevel(calmRef.current);
      }

      p.animFrame += 0.15;

      // Star collection
      let collected = 0;
      for (const s of starsRef.current) {
        if (s.collected) { collected++; continue; }
        s.y = s.baseY + Math.sin(Date.now() / 400 + s.x) * 4;
        if (p.x + PLAYER_W > s.x - STAR_SIZE / 2 && p.x < s.x + STAR_SIZE / 2 &&
            p.y + PLAYER_H > s.y - STAR_SIZE / 2 && p.y < s.y + STAR_SIZE / 2) {
          s.collected = true;
          collected++;
          spawnParticles(s.x, s.y, '#fbbf24', 8);
          setStarsCollected(collected);
        }
      }

      // Calming item collection
      let calmCollected = 0;
      for (const c of calmingRef.current) {
        if (c.collected) { calmCollected++; continue; }
        c.y = c.baseY + Math.sin(Date.now() / 500 + c.x) * 3;
        if (p.x + PLAYER_W > c.x - 14 && p.x < c.x + 14 &&
            p.y + PLAYER_H > c.y - 14 && p.y < c.y + 14) {
          c.collected = true;
          calmCollected++;
          spawnParticles(c.x, c.y, calmingItem.color, 10, 5);
          setCalmingCollected(calmCollected);
          // Calming items increase calm
          calmRef.current = Math.min(1, calmRef.current + 0.15);
          setCalmLevel(calmRef.current);
        }
      }

      // Update clickable objects — transform animation
      for (const co of phobiaObjRef.current) {
        if (co.state === 'clicked' && co.transformProgress < 1) {
          co.transformProgress = Math.min(1, co.transformProgress + 0.04);
        }
        if (co.state === 'idle') {
          co.y = co.baseY + Math.sin(Date.now() / 600 + co.x) * 5;
        }
      }

      // Goal
      const g = goalRef.current;
      if (!g.reached && p.x + PLAYER_W > g.x && p.x < g.x + GOAL_W &&
          p.y + PLAYER_H > g.y && p.y < g.y + GOAL_H) {
        g.reached = true;
        stateRef.current = 'won';
        spawnParticles(g.x + GOAL_W / 2, g.y + GOAL_H / 2, '#34d399', 25, 6);
        setGameState('won');
      }

      // Camera
      const targetCam = p.x - CANVAS_W / 3;
      cameraRef.current += (targetCam - cameraRef.current) * 0.1;
      if (cameraRef.current < 0) cameraRef.current = 0;
      if (cameraRef.current > worldWidthRef.current - CANVAS_W) cameraRef.current = worldWidthRef.current - CANVAS_W;

      // Particles
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15;
        pt.life--;
        return pt.life > 0;
      });
    }

    function render() {
      if (!ctx) return;
      const cam = cameraRef.current;
      const calm = calmRef.current;

      // Sky gradient — blends from anxious (reddish) to calm (blue) based on calm level
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      const anxietyColor = getAnxietyColor(phobia.id);
      const calmColor = getCalmColor(phobia.id);
      const r = Math.round(anxietyColor[0] * (1 - calm) + calmColor[0] * calm);
      const g = Math.round(anxietyColor[1] * (1 - calm) + calmColor[1] * calm);
      const b = Math.round(anxietyColor[2] * (1 - calm) + calmColor[2] * calm);
      skyGrad.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      const r2 = Math.min(255, r + 30);
      const g2 = Math.min(255, g + 30);
      const b2 = Math.min(255, b + 30);
      skyGrad.addColorStop(1, `rgb(${r2}, ${g2}, ${b2})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Symptom overlay effect — visual pulse based on symptom type
      drawSymptomOverlay(ctx, symptomEffect, calm, Date.now());

      // Background hills
      ctx.fillStyle = `rgba(255,255,255,${0.2 + calm * 0.15})`;
      for (let i = 0; i < 5; i++) {
        const hx = (i * 200 - cam * 0.3) % (CANVAS_W + 200) - 100;
        ctx.beginPath();
        ctx.arc(hx + 100, CANVAS_H - 30, 80, Math.PI, 0);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(-cam, 0);

      // Platforms
      for (const plat of platformsRef.current) {
        const platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + PLATFORM_H);
        platGrad.addColorStop(0, '#34d399');
        platGrad.addColorStop(1, '#059669');
        ctx.fillStyle = platGrad;
        ctx.fillRect(plat.x, plat.y, plat.w, PLATFORM_H);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(plat.x, plat.y, plat.w, 3);
      }

      // Stars
      for (const s of starsRef.current) {
        if (s.collected) continue;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(Math.sin(Date.now() / 600 + s.x) * 0.2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        drawStar(ctx, 0, 0, 5, STAR_SIZE / 2, STAR_SIZE / 4);
        ctx.restore();
      }

      // Calming items
      for (const c of calmingRef.current) {
        if (c.collected) continue;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = calmingItem.color;
        ctx.shadowBlur = 10;
        ctx.fillText(calmingItem.emoji, 0, 0);
        ctx.restore();
      }

      // Clickable phobia objects
      for (const co of phobiaObjRef.current) {
        ctx.save();
        ctx.translate(co.x, co.y);

        const isHover = hoverObjRef.current === co.obj.id;

        if (co.state === 'idle') {
          // Glow when hovered
          if (isHover) {
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 15;
            ctx.save();
            ctx.scale(1.2, 1.2);
          }
          ctx.font = '28px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(co.obj.emoji, 0, 0);
          if (isHover) ctx.restore();

          // Pulsing ring for hover
          if (isHover) {
            ctx.strokeStyle = 'rgba(251,191,36,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 22 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else if (co.state === 'clicked') {
          const t = co.transformProgress;
          // Fade out old emoji
          if (co.obj.interaction === 'fade') {
            ctx.globalAlpha = 1 - t;
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(co.obj.emoji, 0, 0 - t * 20);
          } else if (co.obj.interaction === 'transform' && co.obj.transformEmoji) {
            // Crossfade: old shrinks/fades, new grows in
            ctx.globalAlpha = 1 - t;
            ctx.font = `${28 - t * 14}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(co.obj.emoji, 0, 0);
            ctx.globalAlpha = t;
            ctx.font = `${14 + t * 14}px serif`;
            ctx.fillText(co.obj.transformEmoji, 0, 0);
            // Sparkles
            if (t < 0.8) {
              ctx.globalAlpha = 1 - t;
              ctx.font = '12px serif';
              ctx.fillText('✨', -16 + t * 10, -16 - t * 8);
              ctx.fillText('✨', 16 - t * 10, -16 - t * 8);
            }
          } else {
            // appear — grows and fades
            ctx.globalAlpha = 1 - t * 0.5;
            ctx.font = `${28 + t * 8}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(co.obj.emoji, 0, 0 - t * 10);
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }

      // Goal flag
      const g_ = goalRef.current;
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(g_.x + GOAL_W / 2 - 2, g_.y, 4, GOAL_H);
      ctx.fillStyle = g_.reached ? '#34d399' : '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(g_.x + GOAL_W / 2, g_.y);
      ctx.lineTo(g_.x + GOAL_W / 2 + 22, g_.y + 12);
      ctx.lineTo(g_.x + GOAL_W / 2, g_.y + 24);
      ctx.closePath();
      ctx.fill();

      // Player — themed as the companion animal
      drawPlayer(ctx, playerRef.current, likeType, Date.now());

      // Particles
      for (const pt of particlesRef.current) {
        ctx.globalAlpha = pt.life / 30;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    }

    function loop() {
      update();
      render();
      if (stateRef.current === 'playing') {
        animRef.current = requestAnimationFrame(loop);
      }
    }
    animRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, buildLevel, phobia.id, likeType, calmingItem.emoji, symptomEffect.type]);

  function handleRestart() {
    setStarsCollected(0);
    setCalmingCollected(0);
    setPhobiaObjectsClicked(0);
    setGameState('playing');
    buildLevel();
  }

  const calmPct = Math.round(calmLevel * 100);

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 py-6 anim-fade">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 transition">
            <ChevronLeft className="w-4 h-4" />
            رجوع
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-bold text-sky-950 dark:text-sky-50">{phobia.emoji} {phobia.label}</span>
            <span className="text-sky-500 dark:text-slate-400">المستوى {levelIndex + 1}/{totalLevels}</span>
          </div>
        </div>

        {/* Scene description */}
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 p-3 anim-fade-up">
          <p className="text-sm text-sky-900/80 dark:text-slate-300 leading-relaxed">{level.scene}</p>
        </div>

        {/* Calm meter + stats bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-sky-700 dark:text-slate-300">مستوى الطمأنينة</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{calmPct}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-sky-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${calmPct}%`,
                  background: `linear-gradient(to right, ${symptomEffect.color}, #34d399)`,
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 rounded-full px-2.5 py-1 border border-sky-100 dark:border-slate-700">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-sky-950 dark:text-sky-50 tabular-nums">{starsCollected}/{totalStars}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 rounded-full px-2.5 py-1 border border-sky-100 dark:border-slate-700">
              <Sparkles className="w-4 h-4" style={{ color: calmingItem.color }} />
              <span className="font-bold text-sky-950 dark:text-sky-50 tabular-nums">{calmingCollected}/{totalCalming}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-800/80 rounded-full px-2.5 py-1 border border-sky-100 dark:border-slate-700">
              <Hand className="w-4 h-4 text-sky-500" />
              <span className="font-bold text-sky-950 dark:text-sky-50 tabular-nums">{phobiaObjectsClicked}/{totalPhobiaObjects}</span>
            </div>
          </div>
        </div>

        {/* Game canvas */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-sky-200/40 dark:shadow-black/40 anim-scale" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-auto block bg-sky-100 dark:bg-slate-900"
          />

          {/* Instructions overlay */}
          {showInstructions && gameState === 'playing' && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center anim-fade">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 text-center anim-scale">
                <div className="inline-flex mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-3">كيف تلعب؟</h3>
                <div className="text-sm text-sky-700 dark:text-slate-300 space-y-2 text-right">
                  <p>← → أو A/D : التحرك يميناً ويساراً</p>
                  <p>↑ أو W أو مسافة : القفز</p>
                  <p>اجمع النجوم 🌟 والعناصر المهدّئة {calmingItem.emoji}</p>
                  <p>انقر على رموز الخوف {phobia.emoji} لتحويلها والشعور بالطمأنينة</p>
                  <p>اصل إلى العلم 🏁 لإنهاء المستوى</p>
                </div>
                <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">
                  <p className="text-xs text-amber-700 dark:text-amber-400">عرضك: {symptomEffect.label} — اجمع العناصر المهدّئة لتخفيفه</p>
                </div>
                <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">اضغط أي زر أو انقر للبدء</p>
              </div>
            </div>
          )}

          {/* Win overlay */}
          {gameState === 'won' && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center anim-fade">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm mx-4 text-center anim-scale">
                <div className="anim-float inline-flex mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-400 flex items-center justify-center shadow-lg">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-sky-950 dark:text-sky-50 mb-2">أحسنت!</h3>
                <div className="flex justify-center gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-sky-950 dark:text-sky-50">{starsCollected}/{totalStars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" style={{ color: calmingItem.color }} />
                    <span className="font-bold text-sky-950 dark:text-sky-50">{calmingCollected}/{totalCalming}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hand className="w-4 h-4 text-sky-500" />
                    <span className="font-bold text-sky-950 dark:text-sky-50">{phobiaObjectsClicked}/{totalPhobiaObjects}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 mb-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">مستوى الطمأنينة النهائي: {calmPct}%</p>
                </div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-5 leading-relaxed">
                  {level.encouragement}
                </p>
                <button
                  onClick={onWin}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all px-6 py-3.5 text-white text-base font-semibold shadow-lg shadow-emerald-200/50"
                >
                  <Heart className="w-5 h-5" />
                  {levelIndex + 1 === totalLevels ? 'إنهاء الرحلة' : 'المستوى التالي'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Touch controls for mobile */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <div className="flex gap-2">
            <TouchBtn label="◀" onPress={() => setTouchKey('arrowleft', true)} onRelease={() => setTouchKey('arrowleft', false)} />
            <TouchBtn label="▶" onPress={() => setTouchKey('arrowright', true)} onRelease={() => setTouchKey('arrowright', false)} />
          </div>
          <TouchBtn label="⬆" onPress={() => setTouchKey('arrowup', true)} onRelease={() => setTouchKey('arrowup', false)} big />
        </div>

        {/* Mission card */}
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 anim-fade-up">
          <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">مهمّتك</p>
          <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed text-sm">{level.mission}</p>
        </div>

        {/* Adapted info card */}
        <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 px-4 py-3 flex gap-3 anim-fade-up">
          <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-sky-700/70 dark:text-slate-400 leading-relaxed">
            <p className="font-semibold text-sky-800 dark:text-sky-300 mb-0.5">رحلة مخصّصة لك</p>
            <p>الصعوبة مكيّفة مع شدّة خوفك ({config.intensity}/10) · العنصر المهدّئ: {calmingItem.emoji} {calmingItem.label}</p>
          </div>
        </div>

        {/* Restart button */}
        <button
          onClick={handleRestart}
          className="self-center inline-flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 border-2 border-sky-200 dark:border-slate-600 hover:border-sky-300 dark:hover:border-slate-500 text-sky-700 dark:text-sky-300 text-sm font-semibold px-5 py-2.5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

// --- Helper functions ---

const MOVE_SPEED = 4;

function getAnxietyColor(phobiaId: string): [number, number, number] {
  switch (phobiaId) {
    case 'heights': return [253, 164, 116]; // warm orange
    case 'spiders': return [167, 139, 250]; // purple
    case 'enclosed': return [148, 163, 184]; // slate
    case 'crowds': return [251, 146, 60]; // orange
    default: return [253, 164, 116];
  }
}

function getCalmColor(phobiaId: string): [number, number, number] {
  switch (phobiaId) {
    case 'heights': return [125, 211, 252]; // sky blue
    case 'spiders': return [134, 239, 172]; // green
    case 'enclosed': return [165, 180, 252]; // indigo light
    case 'crowds': return [253, 224, 71]; // yellow
    default: return [125, 211, 252];
  }
}

function drawSymptomOverlay(ctx: CanvasRenderingContext2D, effect: { type: string; strength: number; color: string }, calm: number, time: number) {
  const intensity = effect.strength * (1 - calm * 0.7); // calm reduces symptom effect
  if (intensity < 0.05) return;

  if (effect.type === 'heartbeat') {
    // Red pulsing vignette
    const pulse = (Math.sin(time / 300) + 1) / 2;
    const alpha = intensity * 0.15 * (0.5 + pulse * 0.5);
    const grad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W / 3, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W / 1.5);
    grad.addColorStop(0, 'rgba(239,68,68,0)');
    grad.addColorStop(1, `rgba(239,68,68,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else if (effect.type === 'sweat') {
    // Blue trembling overlay
    const shake = Math.sin(time / 100) * intensity * 2;
    ctx.fillStyle = `rgba(96,165,250,${intensity * 0.08})`;
    ctx.fillRect(shake, 0, CANVAS_W, CANVAS_H);
  } else if (effect.type === 'breathing') {
    // Orange constriction vignette
    const breath = (Math.sin(time / 800) + 1) / 2;
    const alpha = intensity * 0.12 * (0.6 + breath * 0.4);
    const grad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_W / 4, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W);
    grad.addColorStop(0, 'rgba(245,158,11,0)');
    grad.addColorStop(1, `rgba(245,158,11,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else if (effect.type === 'dizzy') {
    // Purple wavy overlay
    ctx.save();
    ctx.globalAlpha = intensity * 0.1;
    ctx.fillStyle = '#a78bfa';
    for (let i = 0; i < 3; i++) {
      const offset = Math.sin(time / 200 + i * 2) * 10 * intensity;
      ctx.fillRect(offset, i * CANVAS_H / 3, CANVAS_W, 2);
    }
    ctx.restore();
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, p: any, likeType: string, time: number) {
  ctx.save();
  ctx.translate(p.x + PLAYER_W / 2, p.y + PLAYER_H / 2);
  if (p.facing === -1) ctx.scale(-1, 1);

  // Body color based on companion type
  let bodyColor = '#fbbf24';
  let outlineColor = '#d97706';
  if (likeType === 'dogs') { bodyColor = '#f4a261'; outlineColor = '#c47d3b'; }
  else if (likeType === 'nature') { bodyColor = '#86efac'; outlineColor = '#16a34a'; }
  else if (likeType === 'sport') { bodyColor = '#60a5fa'; outlineColor = '#2563eb'; }
  else if (likeType === 'music') { bodyColor = '#c084fc'; outlineColor = '#9333ea'; }

  // Body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_W / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ears
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(-8, -10); ctx.lineTo(-12, -20); ctx.lineTo(-4, -14); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, -10); ctx.lineTo(12, -20); ctx.lineTo(4, -14); ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Eyes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
  ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.beginPath();
  ctx.arc(0, 4, 4, 0, Math.PI);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Running legs
  if (Math.abs(p.vx) > 0.5 && p.onGround) {
    const legOffset = Math.sin(p.animFrame * 2) * 3;
    ctx.fillStyle = outlineColor;
    ctx.fillRect(-6, PLAYER_H / 2 - 4, 4, 4 + legOffset);
    ctx.fillRect(2, PLAYER_H / 2 - 4, 4, 4 - legOffset);
  }

  ctx.restore();
}

function TouchBtn({ label, onPress, onRelease, big }: { label: string; onPress: () => void; onRelease: () => void; big?: boolean }) {
  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); onPress(); }}
      onTouchEnd={(e) => { e.preventDefault(); onRelease(); }}
      className={`${big ? 'w-16 h-16 text-2xl' : 'w-12 h-12 text-xl'} rounded-2xl bg-sky-500/80 dark:bg-sky-600/80 text-white font-bold flex items-center justify-center active:scale-90 transition-transform`}
    >
      {label}
    </button>
  );
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}
