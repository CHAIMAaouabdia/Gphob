import { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Star, Trophy, RotateCcw, ChevronLeft, Gamepad2 } from 'lucide-react';
import type { Phobia, LikeId, Level } from '@/data/journey';
import { LIKES } from '@/data/journey';

interface PlatformerGameProps {
  phobia: Phobia;
  likeType: LikeId;
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
const MOVE_SPEED = 4;

const PLAYER_W = 28;
const PLAYER_H = 32;
const PLATFORM_H = 16;
const STAR_SIZE = 16;
const GOAL_W = 30;
const GOAL_H = 44;

interface Platform { x: number; y: number; w: number; }
interface Star { x: number; y: number; collected: boolean; baseY: number; }
interface Goal { x: number; y: number; reached: boolean; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

export default function PlatformerGame({ phobia, likeType, level, levelIndex, totalLevels, onWin, onBack }: PlatformerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'paused'>('playing');
  const [starsCollected, setStarsCollected] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const [showInstructions, setShowInstructions] = useState(true);

  const likeEmoji = LIKES.find((l) => l.id === likeType)?.emoji ?? '🐱';

  // Game objects stored in refs to avoid re-renders during the game loop
  const playerRef = useRef({ x: 40, y: 200, vx: 0, vy: 0, onGround: false, facing: 1, animFrame: 0 });
  const platformsRef = useRef<Platform[]>([]);
  const starsRef = useRef<Star[]>([]);
  const goalRef = useRef<Goal>({ x: 0, y: 0, reached: false });
  const particlesRef = useRef<Particle[]>([]);
  const cameraRef = useRef(0);
  const worldWidthRef = useRef(1200);
  const stateRef = useRef<'playing' | 'won' | 'paused'>('playing');
  const keysRef = useRef<Record<string, boolean>>({});
  const animRef = useRef<number>(0);

  // Build level layout based on level index — difficulty scales
  const buildLevel = useCallback(() => {
    const difficulty = Math.min(levelIndex + 1, 10);
    const groundY = CANVAS_H - 30;
    const platforms: Platform[] = [];
    const stars: Star[] = [];

    // Ground segments with gaps (gaps widen with difficulty)
    const gapSize = 40 + difficulty * 6;
    const segMin = 100;
    const segMax = 200;
    let x = 0;
    while (x < 1100) {
      const segW = segMin + Math.random() * (segMax - segMin);
      platforms.push({ x, y: groundY, w: segW });
      x += segW + gapSize;
    }
    // Final ground before goal
    platforms.push({ x: x, y: groundY, w: 120 });
    worldWidthRef.current = x + 120 + GOAL_W + 20;

    // Floating platforms
    const numFloat = 3 + Math.floor(difficulty / 2);
    for (let i = 0; i < numFloat; i++) {
      const fx = 80 + Math.random() * (worldWidthRef.current - 200);
      const fy = groundY - 60 - Math.random() * 100;
      const fw = 50 + Math.random() * 50;
      platforms.push({ x: fx, y: fy, w: fw });
    }

    // Stars on platforms and in the air
    const numStars = 3 + Math.floor(difficulty / 2);
    for (let i = 0; i < numStars; i++) {
      const px = 100 + Math.random() * (worldWidthRef.current - 200);
      const py = groundY - 50 - Math.random() * 120;
      stars.push({ x: px, y: py, collected: false, baseY: py });
    }
    setTotalStars(numStars);

    // Goal at the end
    const goalX = worldWidthRef.current - GOAL_W - 10;
    goalRef.current = { x: goalX, y: groundY - GOAL_H, reached: false };
    platformsRef.current = platforms;
    starsRef.current = stars;
    playerRef.current = { x: 40, y: groundY - PLAYER_H - 5, vx: 0, vy: 0, onGround: false, facing: 1, animFrame: 0 };
    cameraRef.current = 0;
    particlesRef.current = [];
  }, [levelIndex]);

  // Particle helper
  function spawnParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 30,
        color,
      });
    }
  }

  // Keyboard handlers
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      setKeys({ ...keysRef.current });
      if (k === ' ' || k === 'arrowup' || k === 'w') e.preventDefault();
      if (showInstructions) setShowInstructions(false);
    }
    function handleKeyUp(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      keysRef.current[k] = false;
      setKeys({ ...keysRef.current });
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showInstructions]);

  // Touch controls for mobile
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

      // Horizontal movement
      if (k['arrowleft'] || k['a']) {
        p.vx = -MOVE_SPEED;
        p.facing = -1;
      } else if (k['arrowright'] || k['d']) {
        p.vx = MOVE_SPEED;
        p.facing = 1;
      } else {
        p.vx *= FRICTION;
      }

      // Jump
      if ((k['arrowup'] || k['w'] || k[' ']) && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        spawnParticles(p.x + PLAYER_W / 2, p.y + PLAYER_H, '#94c5e8', 5);
      }

      // Gravity
      p.vy += GRAVITY;
      if (p.vy > 12) p.vy = 12;

      // Apply horizontal movement
      p.x += p.vx;
      // World bounds
      if (p.x < 0) p.x = 0;
      if (p.x + PLAYER_W > worldWidthRef.current) p.x = worldWidthRef.current - PLAYER_W;

      // Apply vertical movement with platform collision
      const prevY = p.y;
      p.y += p.vy;
      p.onGround = false;

      for (const plat of platformsRef.current) {
        // Check if player is above platform and falling
        if (p.x + PLAYER_W > plat.x && p.x < plat.x + plat.w) {
          // Landing on top
          if (p.vy >= 0 && prevY + PLAYER_H <= plat.y + 2 && p.y + PLAYER_H >= plat.y) {
            p.y = plat.y - PLAYER_H;
            p.vy = 0;
            p.onGround = true;
          }
          // Hitting bottom of platform (from below)
          else if (p.vy < 0 && prevY >= plat.y + PLATFORM_H - 2 && p.y < plat.y + PLATFORM_H) {
            p.y = plat.y + PLATFORM_H;
            p.vy = 0;
          }
        }
      }

      // Fall off the world = reset to start
      if (p.y > CANVAS_H + 100) {
        spawnParticles(p.x + PLAYER_W / 2, CANVAS_H - 50, '#ef4444', 10);
        p.x = 40;
        p.y = CANVAS_H - 30 - PLAYER_H - 5;
        p.vx = 0;
        p.vy = 0;
        cameraRef.current = 0;
      }

      // Animate player
      p.animFrame += 0.15;

      // Star collection
      let collected = 0;
      for (const s of starsRef.current) {
        if (s.collected) { collected++; continue; }
        s.y = s.baseY + Math.sin(Date.now() / 400 + s.x) * 4;
        if (
          p.x + PLAYER_W > s.x - STAR_SIZE / 2 &&
          p.x < s.x + STAR_SIZE / 2 &&
          p.y + PLAYER_H > s.y - STAR_SIZE / 2 &&
          p.y < s.y + STAR_SIZE / 2
        ) {
          s.collected = true;
          collected++;
          spawnParticles(s.x, s.y, '#fbbf24', 8);
          setStarsCollected(collected);
        }
      }

      // Goal reached
      const g = goalRef.current;
      if (
        !g.reached &&
        p.x + PLAYER_W > g.x &&
        p.x < g.x + GOAL_W &&
        p.y + PLAYER_H > g.y &&
        p.y < g.y + GOAL_H
      ) {
        g.reached = true;
        stateRef.current = 'won';
        spawnParticles(g.x + GOAL_W / 2, g.y + GOAL_H / 2, '#34d399', 20);
        setGameState('won');
      }

      // Camera follows player
      const targetCam = p.x - CANVAS_W / 3;
      cameraRef.current += (targetCam - cameraRef.current) * 0.1;
      if (cameraRef.current < 0) cameraRef.current = 0;
      if (cameraRef.current > worldWidthRef.current - CANVAS_W) cameraRef.current = worldWidthRef.current - CANVAS_W;

      // Update particles
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

      // Sky gradient based on phobia theme
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      if (phobia.id === 'heights') {
        skyGrad.addColorStop(0, '#7dd3fc');
        skyGrad.addColorStop(1, '#e0f2fe');
      } else if (phobia.id === 'spiders') {
        skyGrad.addColorStop(0, '#86efac');
        skyGrad.addColorStop(1, '#f0fdf4');
      } else if (phobia.id === 'enclosed') {
        skyGrad.addColorStop(0, '#a5b4fc');
        skyGrad.addColorStop(1, '#e0e7ff');
      } else {
        skyGrad.addColorStop(0, '#fdba74');
        skyGrad.addColorStop(1, '#fff7ed');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Distant background hills
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
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
        // Platform body
        const platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + PLATFORM_H);
        platGrad.addColorStop(0, '#34d399');
        platGrad.addColorStop(1, '#059669');
        ctx.fillStyle = platGrad;
        ctx.fillRect(plat.x, plat.y, plat.w, PLATFORM_H);
        // Platform top highlight
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

      // Goal flag
      const g = goalRef.current;
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(g.x + GOAL_W / 2 - 2, g.y, 4, GOAL_H);
      ctx.fillStyle = g.reached ? '#34d399' : '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(g.x + GOAL_W / 2, g.y);
      ctx.lineTo(g.x + GOAL_W / 2 + 22, g.y + 12);
      ctx.lineTo(g.x + GOAL_W / 2, g.y + 24);
      ctx.closePath();
      ctx.fill();

      // Player
      const p = playerRef.current;
      ctx.save();
      ctx.translate(p.x + PLAYER_W / 2, p.y + PLAYER_H / 2);
      if (p.facing === -1) ctx.scale(-1, 1);

      // Body (like emoji companion)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_W / 2, 0, Math.PI * 2);
      ctx.fill();
      // Body outline
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ears
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.lineTo(-12, -20);
      ctx.lineTo(-4, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, -10);
      ctx.lineTo(12, -20);
      ctx.lineTo(4, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-5, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(5, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Mouth — smile
      ctx.beginPath();
      ctx.arc(0, 4, 4, 0, Math.PI);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Running legs animation
      if (Math.abs(p.vx) > 0.5 && p.onGround) {
        const legOffset = Math.sin(p.animFrame * 2) * 3;
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-6, PLAYER_H / 2 - 4, 4, 4 + legOffset);
        ctx.fillRect(2, PLAYER_H / 2 - 4, 4, 4 - legOffset);
      }

      ctx.restore();

      // Particles
      for (const pt of particlesRef.current) {
        ctx.globalAlpha = pt.life / 30;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      // UI overlay — phobia emoji floating in background
      ctx.font = '40px serif';
      ctx.globalAlpha = 0.12;
      ctx.fillText(phobia.emoji, 30, 60);
      ctx.fillText(phobia.emoji, CANVAS_W - 60, 50);
      ctx.globalAlpha = 1;
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
  }, [gameState, buildLevel, phobia.id]);

  function handleRestart() {
    setStarsCollected(0);
    setGameState('playing');
    buildLevel();
  }

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

        {/* Game canvas container */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-sky-200/40 dark:shadow-black/40 anim-scale" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-auto block bg-sky-100 dark:bg-slate-900"
            style={{ imageRendering: 'auto' }}
          />

          {/* Stars counter overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-sky-950 dark:text-sky-50 tabular-nums">{starsCollected}/{totalStars}</span>
          </div>

          {/* Instructions overlay */}
          {showInstructions && gameState === 'playing' && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center anim-fade">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm mx-4 text-center anim-scale">
                <div className="inline-flex mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-sky-950 dark:text-sky-50 mb-2">كيف تلعب؟</h3>
                <div className="text-sm text-sky-700 dark:text-slate-300 space-y-1.5 text-right">
                  <p>← → أو A/D : التحرك يميناً ويساراً</p>
                  <p>↑ أو W أو مسافة : القفز</p>
                  <p>اجمع النجوم واصل إلى العلم</p>
                </div>
                <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">اضغط أي زر للبدء</p>
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
                <p className="text-sm text-sky-700 dark:text-slate-300 mb-1">
                  جمعت {starsCollected} من {totalStars} نجوم
                </p>
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
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}
