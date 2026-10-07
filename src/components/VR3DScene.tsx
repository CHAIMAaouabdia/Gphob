import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export interface VR3DSceneProps {
  phobiaType: string;
  levelIndex: number;
  totalLevels: number;
  onMissionComplete: () => void;
  onNextLevel: () => void;
  onBack: () => void;
}

type MissionState = 'active' | 'completed' | 'achievement';

interface LevelConfig {
  height: number;
  platformSize: number;
  hasBridge: boolean;
  hasGlassFloor: boolean;
  hasObservationPoint: boolean;
  mission: string;
  missionType: 'explore' | 'observe_horizon' | 'cross_bridge' | 'look_down' | 'reach_point';
}

const LEVELS: LevelConfig[] = [
  {
    height: 8,
    platformSize: 16,
    hasBridge: false,
    hasGlassFloor: false,
    hasObservationPoint: false,
    mission: 'Explore the platform',
    missionType: 'explore',
  },
  {
    height: 20,
    platformSize: 12,
    hasBridge: false,
    hasGlassFloor: false,
    hasObservationPoint: false,
    mission: 'Observe the horizon',
    missionType: 'observe_horizon',
  },
  {
    height: 35,
    platformSize: 8,
    hasBridge: true,
    hasGlassFloor: false,
    hasObservationPoint: false,
    mission: 'Walk across the bridge',
    missionType: 'cross_bridge',
  },
  {
    height: 50,
    platformSize: 10,
    hasBridge: false,
    hasGlassFloor: true,
    hasObservationPoint: false,
    mission: 'Look down for 5 seconds',
    missionType: 'look_down',
  },
  {
    height: 70,
    platformSize: 6,
    hasBridge: true,
    hasGlassFloor: true,
    hasObservationPoint: true,
    mission: 'Reach the observation point',
    missionType: 'reach_point',
  },
];

function getLevelConfig(levelIndex: number): LevelConfig {
  // Map 10-level progression to 5 VR levels
  const vrLevel = Math.min(4, Math.floor((levelIndex / 10) * 5));
  return LEVELS[vrLevel];
}

export default function VR3DScene({ phobiaType, levelIndex, totalLevels, onMissionComplete, onNextLevel, onBack }: VR3DSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hudLevel, setHudLevel] = useState(levelIndex + 1);
  const [hudMission, setHudMission] = useState('');
  const [hudProgress, setHudProgress] = useState(0);
  const [missionState, setMissionState] = useState<MissionState>('active');
  const [vrSupported, setVrSupported] = useState(false);
  const [inVR, setInVR] = useState(false);
  const [pointerLocked, setPointerLocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const missionStateRef = useRef<MissionState>('active');
  const onMissionCompleteRef = useRef(onMissionComplete);
  onMissionCompleteRef.current = onMissionComplete;

  const handleNextLevelRef = useRef(onNextLevel);
  handleNextLevelRef.current = onNextLevel;

  const setHudProgressRef = useRef(setHudProgress);
  const setMissionStateRef = useRef(setMissionState);
  const setHudMissionRef = useRef(setHudMission);

  const handleNext = useCallback(() => {
    handleNextLevelRef.current();
    setMissionState('active');
    missionStateRef.current = 'active';
    setHudProgress(0);
  }, []);

  useEffect(() => {
    if (phobiaType !== 'heights') return;
    const mount = mountRef.current;
    if (!mount) return;

    const cfg = getLevelConfig(levelIndex);
    setHudMission(cfg.mission);
    setHudLevel(levelIndex + 1);
    setHudProgress(0);
    setMissionState('active');
    missionStateRef.current = 'active';

    // --- Scene setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 80, 300);

    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.set(0, cfg.height + 1.6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.xr.enabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(50, 100, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    scene.add(sun);

    // --- Sky ---
    const skyGeo = new THREE.SphereGeometry(400, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, side: THREE.BackSide, fog: false });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // Clouds
    const cloudGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, fog: false });
      for (let j = 0; j < 4; j++) {
        const s = 3 + Math.random() * 5;
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), cloudMat);
        sphere.position.set(j * s * 0.8 - s, Math.random() * 2, Math.random() * 2);
        cloud.add(sphere);
      }
      const angle = (i / 12) * Math.PI * 2;
      const dist = 100 + Math.random() * 80;
      cloud.position.set(Math.cos(angle) * dist, 40 + Math.random() * 60, Math.sin(angle) * dist);
      cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

    // --- Ground (far below) ---
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x556677 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground grid texture
    const grid = new THREE.GridHelper(600, 60, 0x445566, 0x445566);
    (grid.material as THREE.Material).opacity = 0.3;
    (grid.material as THREE.Material).transparent = true;
    grid.position.y = 0.1;
    scene.add(grid);

    // --- Buildings (city in the distance) ---
    const buildingGroup = new THREE.Group();
    const buildingColors = [0x8a9aaa, 0x9baabb, 0x778899, 0xaabbcc, 0x667788];
    for (let i = 0; i < 80; i++) {
      const w = 4 + Math.random() * 8;
      const d = 4 + Math.random() * 8;
      const h = 5 + Math.random() * 25;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshLambertMaterial({ color: buildingColors[i % buildingColors.length] });
      const building = new THREE.Mesh(geo, mat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 200;
      building.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
      building.castShadow = true;
      building.receiveShadow = true;
      buildingGroup.add(building);

      // Window lights
      if (Math.random() > 0.3) {
        const winMat = new THREE.MeshBasicMaterial({ color: 0xffdd88 });
        for (let wy = 1; wy < h - 1; wy += 3) {
          if (Math.random() > 0.5) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), winMat);
            win.position.set(building.position.x, wy, building.position.z + d / 2 + 0.01);
            buildingGroup.add(win);
          }
        }
      }
    }
    scene.add(buildingGroup);

    // --- Main platform ---
    const platformMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const platformGeo = new THREE.BoxGeometry(cfg.platformSize, 0.5, cfg.platformSize);
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, cfg.height - 0.25, 0);
    platform.receiveShadow = true;
    platform.castShadow = true;
    scene.add(platform);

    // Platform railing
    const railingMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
    const railingHeight = 1.2;
    const halfSize = cfg.platformSize / 2;
    const railingPositions: [number, number, number, number][] = [
      [0, -halfSize, cfg.platformSize, 0.08],
      [0, halfSize, cfg.platformSize, 0.08],
      [-halfSize, 0, 0.08, cfg.platformSize],
      [halfSize, 0, 0.08, cfg.platformSize],
    ];
    railingPositions.forEach(([rx, rz, rw, rd]) => {
      // Top rail
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.1, rd), railingMat);
      topRail.position.set(rx, cfg.height + railingHeight, rz);
      scene.add(topRail);

      // Posts
      const postCount = Math.max(2, Math.floor((rw > rd ? rw : rd) / 2));
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = rx - rw / 2 + rw * t;
        const pz = rz;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, railingHeight, 6), railingMat);
        post.position.set(px, cfg.height + railingHeight / 2, pz);
        scene.add(post);
      }
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const px = rx;
        const pz = rz - rd / 2 + rd * t;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, railingHeight, 6), railingMat);
        post.position.set(px, cfg.height + railingHeight / 2, pz);
        scene.add(post);
      }
    });

    // --- Support pillar (visual connection to ground) ---
    const pillarGeo = new THREE.CylinderGeometry(cfg.platformSize * 0.3, cfg.platformSize * 0.4, cfg.height, 8);
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x889999 });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(0, cfg.height / 2, 0);
    pillar.castShadow = true;
    scene.add(pillar);

    // --- Glass floor (level 4+) ---
    let glassFloor: THREE.Mesh | null = null;
    if (cfg.hasGlassFloor) {
      const glassGeo = new THREE.PlaneGeometry(cfg.platformSize * 0.6, cfg.platformSize * 0.6);
      const glassMat = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        shininess: 100,
      });
      glassFloor = new THREE.Mesh(glassGeo, glassMat);
      glassFloor.rotation.x = -Math.PI / 2;
      glassFloor.position.set(0, cfg.height - 0.49, 0);
      scene.add(glassFloor);

      // Glass frame
      const frameMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const fs = cfg.platformSize * 0.6;
      [-1, 1].forEach(s => {
        const f1 = new THREE.Mesh(new THREE.BoxGeometry(fs, 0.1, 0.15), frameMat);
        f1.position.set(0, cfg.height - 0.45, s * fs / 2);
        scene.add(f1);
        const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, fs), frameMat);
        f2.position.set(s * fs / 2, cfg.height - 0.45, 0);
        scene.add(f2);
      });
    }

    // --- Bridge (level 3 & 5) ---
    let bridgeEnd: THREE.Vector3 | null = null;
    if (cfg.hasBridge) {
      const bridgeLen = 12;
      const bridgeW = 2.5;
      const bridgeGeo = new THREE.BoxGeometry(bridgeW, 0.3, bridgeLen);
      const bridgeMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      bridge.position.set(0, cfg.height - 0.15, cfg.platformSize / 2 + bridgeLen / 2);
      bridge.castShadow = true;
      bridge.receiveShadow = true;
      scene.add(bridge);

      // Bridge railings
      [-1, 1].forEach(side => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, bridgeLen), railingMat);
        rail.position.set(side * bridgeW / 2, cfg.height + 0.4, cfg.platformSize / 2 + bridgeLen / 2);
        scene.add(rail);
      });

      // Second platform at the end of bridge
      const endSize = cfg.hasObservationPoint ? 5 : 6;
      const endPlatform = new THREE.Mesh(new THREE.BoxGeometry(endSize, 0.5, endSize), platformMat);
      endPlatform.position.set(0, cfg.height - 0.25, cfg.platformSize / 2 + bridgeLen + endSize / 2);
      endPlatform.receiveShadow = true;
      scene.add(endPlatform);

      // End platform railing
      const eh = endSize / 2;
      [[0, -eh, endSize, 0.08], [-eh, 0, 0.08, endSize], [eh, 0, 0.08, endSize]].forEach(([rx, rz, rw, rd]) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.1, rd), railingMat);
        rail.position.set(rx, cfg.height + railingHeight, cfg.platformSize / 2 + bridgeLen + endSize / 2 + rz);
        scene.add(rail);
      });

      bridgeEnd = new THREE.Vector3(0, cfg.height + 1.6, cfg.platformSize / 2 + bridgeLen + endSize / 2);
    }

    // --- Observation point marker (level 5) ---
    let observationPoint: THREE.Vector3 | null = null;
    let observationMarker: THREE.Mesh | null = null;
    if (cfg.hasObservationPoint && bridgeEnd) {
      observationPoint = bridgeEnd.clone();

      // Glowing marker
      const markerGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 24);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.5 });
      observationMarker = new THREE.Mesh(markerGeo, markerMat);
      observationMarker.position.set(observationPoint.x, cfg.height - 0.2, observationPoint.z);
      scene.add(observationMarker);

      // Vertical beam
      const beamGeo = new THREE.CylinderGeometry(0.1, 0.1, 10, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.3 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(observationPoint.x, cfg.height + 5, observationPoint.z);
      scene.add(beam);
    }

    // --- Controls (WASD + mouse) ---
    const controls = new PointerLockControls(camera, renderer.domElement);

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === 'Escape') { controls.unlock(); }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onLockChange = () => {
      setPointerLocked(controls.isLocked);
      if (controls.isLocked) setShowInstructions(false);
    };
    controls.addEventListener('lock', onLockChange);
    controls.addEventListener('unlock', onLockChange);

    // Click to lock
    const onCanvasClick = () => {
      if (!controls.isLocked && !renderer.xr.isPresenting) {
        controls.lock();
      }
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    // --- WebXR ---
    let vrButton: HTMLElement | null = null;
    const sessionSupported = navigator.xr !== undefined;
    if (sessionSupported) {
      navigator.xr?.isSessionSupported('immersive-vr').then((supported) => {
        if (supported) {
          setVrSupported(true);
          vrButton = XRButton.createButton(renderer, { optionalFeatures: ['local-floor', 'bounded-floor'] });
          vrButton.style.position = 'absolute';
          vrButton.style.bottom = '20px';
          vrButton.style.left = '50%';
          vrButton.style.transform = 'translateX(-50%)';
          vrButton.style.zIndex = '50';
          mount.appendChild(vrButton);

          const origOnClick = vrButton?.onclick ?? null;
          if (vrButton) {
            const btn = vrButton;
            btn.onclick = (e: MouseEvent) => {
              if (origOnClick) origOnClick.call(btn, e);
            };
          }
          renderer.xr.addEventListener('sessionstart', () => {
            setInVR(true);
            controls.unlock();
          });
          renderer.xr.addEventListener('sessionend', () => {
            setInVR(false);
          });
        }
      });
    }

    // --- Movement ---
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    const playerHeight = cfg.height + 1.6;

    function clampToPlatform(pos: THREE.Vector3) {
      // Keep player on the platform area
      const platforms: { cx: number; cz: number; size: number }[] = [
        { cx: 0, cz: 0, size: cfg.platformSize / 2 - 0.5 },
      ];
      if (cfg.hasBridge) {
        const bridgeLen = 12;
        platforms.push({ cx: 0, cz: cfg.platformSize / 2 + bridgeLen / 2, size: 1 });
        const endSize = cfg.hasObservationPoint ? 5 : 6;
        platforms.push({ cx: 0, cz: cfg.platformSize / 2 + bridgeLen + endSize / 2, size: endSize / 2 - 0.5 });
      }

      for (const p of platforms) {
        if (Math.abs(pos.x - p.cx) < p.size && Math.abs(pos.z - p.cz) < p.size) {
          return; // Inside a valid platform
        }
      }
      // Clamp to nearest platform edge (prevent falling)
      const mainP = platforms[0];
      pos.x = Math.max(mainP.cx - mainP.size, Math.min(mainP.cx + mainP.size, pos.x));
      pos.z = Math.max(mainP.cz - mainP.size, Math.min(mainP.cz + mainP.size, pos.z));
    }

    // --- Mission tracking ---
    let lookDownTimer = 0;
    let horizonTimer = 0;
    let exploreTimer = 0;
    let bridgeReached = false;
    let observationReached = false;

    function checkMission(delta: number) {
      if (missionStateRef.current !== 'active') return;

      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir);
      const pos = camera.position;

      switch (cfg.missionType) {
        case 'explore': {
          // Walk around for a few seconds
          const moved = Math.abs(pos.x) > 1 || Math.abs(pos.z) > 1;
          if (moved) exploreTimer += delta;
          else exploreTimer = Math.max(0, exploreTimer - delta * 0.5);
          setHudProgressRef.current(Math.min(100, (exploreTimer / 5) * 100));
          if (exploreTimer >= 5) completeMission();
          break;
        }
        case 'observe_horizon': {
          // Look towards horizon (camera pitch near 0)
          const pitch = Math.abs(camDir.y);
          if (pitch < 0.2) horizonTimer += delta;
          else horizonTimer = Math.max(0, horizonTimer - delta * 0.5);
          setHudProgressRef.current(Math.min(100, (horizonTimer / 5) * 100));
          if (horizonTimer >= 5) completeMission();
          break;
        }
        case 'cross_bridge': {
          // Reach the end of the bridge
          if (bridgeEnd) {
            const dist = pos.distanceTo(new THREE.Vector3(bridgeEnd.x, pos.y, bridgeEnd.z));
            setHudProgressRef.current(Math.min(100, (1 - dist / 15) * 100));
            if (dist < 2 && !bridgeReached) {
              bridgeReached = true;
              completeMission();
            }
          }
          break;
        }
        case 'look_down': {
          // Look down for 5 seconds
          if (camDir.y < -0.5) lookDownTimer += delta;
          else lookDownTimer = Math.max(0, lookDownTimer - delta * 0.3);
          setHudProgressRef.current(Math.min(100, (lookDownTimer / 5) * 100));
          if (lookDownTimer >= 5) completeMission();
          break;
        }
        case 'reach_point': {
          // Reach the observation point
          if (observationPoint) {
            const dist = pos.distanceTo(new THREE.Vector3(observationPoint.x, pos.y, observationPoint.z));
            setHudProgressRef.current(Math.min(100, (1 - dist / 20) * 100));
            if (dist < 2 && !observationReached) {
              observationReached = true;
              completeMission();
            }
          }
          break;
        }
      }
    }

    function completeMission() {
      missionStateRef.current = 'completed';
      setMissionStateRef.current('completed');
      setHudProgressRef.current(100);
      onMissionCompleteRef.current();
    }

    // --- Animation loop ---
    const clock = new THREE.Clock();

    // Use setAnimationLoop for VR compatibility
    renderer.setAnimationLoop(() => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Cloud movement
      cloudGroup.rotation.y += delta * 0.01;

      // Observation marker pulse
      if (observationMarker) {
        const mat = observationMarker.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.2;
        observationMarker.scale.x = observationMarker.scale.z = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
      }

      // Movement
      if (controls.isLocked || renderer.xr.isPresenting) {
        velocity.x -= velocity.x * 8 * delta;
        velocity.z -= velocity.z * 8 * delta;

        direction.z = Number(keys['KeyW'] || keys['KeyZ'] || keys['ArrowUp']) - Number(keys['KeyS'] || keys['ArrowDown']);
        direction.x = Number(keys['KeyD'] || keys['ArrowRight']) - Number(keys['KeyA'] || keys['KeyQ'] || keys['ArrowLeft']);
        direction.normalize();

        const speed = 8;
        if (direction.z !== 0) velocity.z -= direction.z * speed * delta;
        if (direction.x !== 0) velocity.x -= direction.x * speed * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        const pos = camera.position;
        if (!renderer.xr.isPresenting) {
          pos.y = playerHeight;
        }
        clampToPlatform(pos);
      }

      checkMission(delta);
      renderer.render(scene, camera);
    });

    // --- Resize ---
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // --- Cleanup ---
    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('lock', onLockChange);
      controls.removeEventListener('unlock', onLockChange);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      controls.unlock();
      controls.dispose();

      if (vrButton && vrButton.parentElement) {
        vrButton.parentElement.removeChild(vrButton);
      }

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [phobiaType, levelIndex]);

  // --- Non-heights placeholder ---
  if (phobiaType !== 'heights') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-900 text-white px-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">VR Scene — Coming Soon</h2>
          <p className="text-slate-400 leading-relaxed mb-6">
            The immersive 3D VR scene for this phobia type is being developed.
            The acrophobia (fear of heights) scene is fully playable now.
          </p>
          <button onClick={onBack} className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-6 py-3 font-semibold transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black" ref={mountRef}>
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-40 pointer-events-none select-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-white space-y-1">
          <div className="text-xs font-bold tracking-widest text-emerald-400">PHOB G</div>
          <div className="text-sm font-semibold">LEVEL {hudLevel}</div>
          <div className="text-xs text-slate-300">MISSION</div>
          <div className="text-sm font-semibold text-sky-300">{hudMission}</div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${hudProgress}%` }} />
            </div>
            <span className="text-xs tabular-nums">{Math.round(hudProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Mode indicator */}
      <div className="absolute top-4 right-4 z-40 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
          <div className="text-xs font-semibold">
            {inVR ? 'VR MODE' : 'SIMULATION MODE'}
          </div>
          {vrSupported && !inVR && (
            <div className="text-xs text-emerald-400 mt-0.5">VR headset detected</div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && !pointerLocked && !inVR && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl px-8 py-6 text-white text-center max-w-sm pointer-events-auto">
            <h3 className="text-lg font-bold mb-3">Simulation Mode</h3>
            <div className="text-sm text-slate-300 space-y-2 mb-4">
              <p><span className="font-mono bg-white/10 px-2 py-0.5 rounded">Click</span> to look around</p>
              <p><span className="font-mono bg-white/10 px-2 py-0.5 rounded">W A S D</span> or <span className="font-mono bg-white/10 px-2 py-0.5 rounded">Z Q S D</span> to move</p>
              <p><span className="font-mono bg-white/10 px-2 py-0.5 rounded">ESC</span> to release mouse</p>
            </div>
            <button
              onClick={() => { const el = mountRef.current?.querySelector('canvas'); el?.click(); }}
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 text-sm font-semibold transition active:scale-95"
            >
              Click to Start
            </button>
            {vrSupported && (
              <p className="text-xs text-emerald-400 mt-3">Or use the "ENTER VR" button below for headset mode</p>
            )}
          </div>
        </div>
      )}

      {/* Mission completed overlay */}
      {missionState === 'completed' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl px-8 py-6 text-white text-center anim-scale">
            <div className="text-2xl font-bold text-emerald-400 mb-2">MISSION COMPLETED</div>
            <div className="text-sm text-amber-400 mb-4">ACHIEVEMENT UNLOCKED</div>
            <button
              onClick={handleNext}
              className="pointer-events-auto rounded-full bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 text-sm font-semibold transition active:scale-95"
            >
              NEXT LEVEL →
            </button>
          </div>
        </div>
      )}

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute bottom-4 right-4 z-40 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2.5 transition"
      >
        ← Exit
      </button>
    </div>
  );
}
