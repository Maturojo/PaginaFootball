import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  MeshPhysicalMaterial,
  SRGBColorSpace,
} from 'three';
import { Rotate3D } from 'lucide-react';
import {
  BASE_JERSEY_MODEL_URL,
  getTeamModelUrl,
  TEAM_MODEL_URLS,
} from '../data/jersey3dModels.js';
import { getJersey3DStyle } from '../data/jersey3dStyles.js';
import { teamLogoSrc } from '../utils/teamLogo.js';

const FRONT_ANGLE = 0;
const BACK_ANGLE = Math.PI;

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, r);
}

function drawOutlinedText(ctx, text, x, y, size, fill, outline, maxWidth) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${size}px Impact, "Arial Black", Arial, sans-serif`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(10, size * 0.075);
  ctx.strokeText(text, x, y, maxWidth);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawPattern(ctx, style, size) {
  const { body, body2, side, trim, pattern } = style;
  if (body2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    gradient.addColorStop(0, body);
    gradient.addColorStop(0.55, body);
    gradient.addColorStop(1, body2);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = body;
  }
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  if (pattern === 'speed') {
    ctx.strokeStyle = trim;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = 26;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-80, 170 + i * 70);
      ctx.bezierCurveTo(size * 0.28, 80 + i * 70, size * 0.7, 115 + i * 70, size + 80, 40 + i * 70);
      ctx.stroke();
    }
  } else if (pattern === 'side') {
    ctx.fillStyle = side;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.17, 0);
    ctx.lineTo(size * 0.28, size);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(size * 0.83, 0);
    ctx.lineTo(size * 0.72, size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
  } else if (pattern === 'bolts') {
    ctx.fillStyle = trim;
    ctx.globalAlpha = 0.46;
    ctx.beginPath();
    ctx.moveTo(size * 0.38, 0);
    ctx.lineTo(size * 0.58, size * 0.43);
    ctx.lineTo(size * 0.46, size * 0.43);
    ctx.lineTo(size * 0.68, size);
    ctx.lineTo(size * 0.41, size * 0.54);
    ctx.lineTo(size * 0.53, size * 0.54);
    ctx.closePath();
    ctx.fill();
  } else if (pattern === 'waves') {
    ctx.strokeStyle = trim;
    ctx.globalAlpha = 0.38;
    ctx.lineWidth = 18;
    for (let row = 0; row < 4; row += 1) {
      const y = size * (0.58 + row * 0.095);
      ctx.beginPath();
      ctx.moveTo(-40, y);
      for (let x = -40; x <= size + 80; x += 80) {
        ctx.quadraticCurveTo(x + 40, y - 38, x + 80, y);
      }
      ctx.stroke();
    }
  } else if (pattern === 'coral') {
    ctx.strokeStyle = trim;
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    for (const direction of [-1, 1]) {
      const baseX = direction < 0 ? size * 0.18 : size * 0.82;
      ctx.beginPath();
      ctx.moveTo(baseX, size);
      ctx.bezierCurveTo(baseX, size * 0.82, baseX + direction * 20, size * 0.7, baseX, size * 0.56);
      ctx.stroke();
      for (let branch = 0; branch < 4; branch += 1) {
        const y = size * (0.84 - branch * 0.09);
        ctx.beginPath();
        ctx.moveTo(baseX, y);
        ctx.lineTo(baseX + direction * 75, y - 58);
        ctx.stroke();
      }
    }
  } else if (pattern === 'armor') {
    ctx.strokeStyle = trim;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 12;
    for (let y = 150; y < size; y += 110) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }
  }
  ctx.restore();

  const sheen = ctx.createLinearGradient(0, 0, size, size);
  sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
  sheen.addColorStop(0.32, 'rgba(255,255,255,0.04)');
  sheen.addColorStop(0.7, 'rgba(0,0,0,0.02)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.24)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < size; y += 10) {
    ctx.fillRect(0, y, size, 1);
  }
  ctx.globalAlpha = 1;
}

function drawPanelTexture(canvas, { team, style, side, name, number, logo }) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const displayNumber = number || '00';
  const displayName = name?.trim().toUpperCase() || 'TU NOMBRE';
  drawPattern(ctx, style, size);

  if (side === 'front') {
    if (logo?.complete && logo.naturalWidth > 0) {
      const logoSize = size * 0.17;
      ctx.drawImage(logo, (size - logoSize) / 2, size * 0.075, logoSize, logoSize);
    }
    drawOutlinedText(ctx, team.nombre.toUpperCase(), size / 2, size * 0.285, size * 0.085, style.chest, style.outline, size * 0.7);
    drawOutlinedText(ctx, displayNumber, size / 2, size * 0.62, size * 0.34, style.number, style.outline, size * 0.67);
    ctx.fillStyle = 'rgba(10,15,25,0.82)';
    roundedRect(ctx, size * 0.68, size * 0.84, size * 0.2, size * 0.07, 12);
    ctx.fill();
    ctx.fillStyle = style.trim;
    roundedRect(ctx, size * 0.695, size * 0.852, size * 0.055, size * 0.046, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${size * 0.018}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('MDP', size * 0.815, size * 0.882);
  } else {
    drawOutlinedText(ctx, displayName, size / 2, size * 0.2, size * 0.09, style.chest, style.outline, size * 0.74);
    drawOutlinedText(ctx, displayNumber, size / 2, size * 0.56, size * 0.36, style.number, style.outline, size * 0.7);
  }
}

function createPanelTexture(options, anisotropy, resolution) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(8, anisotropy);
  drawPanelTexture(canvas, options);
  return texture;
}

function createSleeveTexture(style, number, anisotropy, resolution) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  drawPattern(ctx, { ...style, pattern: 'clean' }, resolution);
  ctx.fillStyle = style.trim;
  ctx.fillRect(0, resolution * 0.84, resolution, resolution * 0.07);
  drawOutlinedText(
    ctx,
    number || '00',
    resolution / 2,
    resolution * 0.48,
    resolution * 0.235,
    style.number,
    style.outline,
    resolution * 0.59,
  );
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(8, anisotropy);
  return texture;
}

function useDynamicTextures(team, name, number, logo) {
  const anisotropy = useThree(state => state.gl.capabilities.getMaxAnisotropy());
  const viewportWidth = useThree(state => state.size.width);
  const panelResolution = viewportWidth < 480 ? 512 : 1024;
  const sleeveResolution = panelResolution / 2;
  const style = useMemo(() => getJersey3DStyle(team), [team]);
  const textures = useMemo(() => ({
    front: createPanelTexture({ team, style, side: 'front', name, number, logo }, anisotropy, panelResolution),
    back: createPanelTexture({ team, style, side: 'back', name, number }, anisotropy, panelResolution),
    sleeve: createSleeveTexture(style, number, anisotropy, sleeveResolution),
  }), [anisotropy, logo, name, number, panelResolution, sleeveResolution, style, team]);

  useEffect(() => () => {
    textures.front.dispose();
    textures.back.dispose();
    textures.sleeve.dispose();
  }, [textures]);

  return { style, ...textures };
}

function JerseyScene({ team, name, number, requestedAngle, requestId, onReady, onAngleChange, onInteraction }) {
  const customModelUrl = getTeamModelUrl(team);
  const modelUrl = customModelUrl || BASE_JERSEY_MODEL_URL;
  const { scene } = useGLTF(modelUrl);
  const logoTexture = useTexture(teamLogoSrc(team));
  const controlsRef = useRef(null);
  const targetAngleRef = useRef(null);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const { style, front, back, sleeve } = useDynamicTextures(team, name, number, logoTexture.image);

  const materials = useMemo(() => ({
    front: new MeshPhysicalMaterial({ map: front, color: '#ffffff', roughness: 0.7, clearcoat: 0.04 }),
    back: new MeshPhysicalMaterial({ map: back, color: '#ffffff', roughness: 0.72, clearcoat: 0.04 }),
    side: new MeshPhysicalMaterial({ color: style.side, roughness: 0.78 }),
    sleeve: new MeshPhysicalMaterial({ map: sleeve, color: '#ffffff', roughness: 0.72, clearcoat: 0.03 }),
    trim: new MeshPhysicalMaterial({ color: style.trim, roughness: 0.58, clearcoat: 0.08 }),
    inner: new MeshPhysicalMaterial({ color: '#070b12', roughness: 0.92 }),
  }), [back, front, sleeve, style.side, style.trim]);

  useEffect(() => () => {
    Object.values(materials).forEach(mat => mat.dispose());
  }, [materials]);

  useEffect(() => {
    clonedScene.traverse(object => {
      if (!object.isMesh) return;
      object.castShadow = true;
      object.receiveShadow = true;
      if (customModelUrl) return;
      if (object.name === 'TorsoFront') object.material = materials.front;
      else if (object.name === 'TorsoBack') object.material = materials.back;
      else if (object.name === 'SidePanels') object.material = materials.side;
      else if (object.name === 'SleeveLeft' || object.name === 'SleeveRight') object.material = materials.sleeve;
      else if (object.name === 'NeckInsert') object.material = materials.inner;
      else object.material = materials.trim;
    });
  }, [clonedScene, customModelUrl, materials]);

  useEffect(() => {
    targetAngleRef.current = requestedAngle;
  }, [requestId, requestedAngle]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || targetAngleRef.current === null) return;
    const current = controls.getAzimuthalAngle();
    const delta = Math.atan2(
      Math.sin(targetAngleRef.current - current),
      Math.cos(targetAngleRef.current - current),
    );
    if (Math.abs(delta) < 0.004) {
      controls.setAzimuthalAngle(targetAngleRef.current);
      targetAngleRef.current = null;
    } else {
      controls.setAzimuthalAngle(current + delta * 0.13);
    }
    controls.update();
  });

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight castShadow position={[3.2, 4.5, 5]} intensity={3.2} shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, 3]} intensity={1.5} color="#9ac8ff" />
      <pointLight position={[0, 2.5, -4]} intensity={2.2} color={style.trim} />
      <primitive
        object={clonedScene}
        position={customModelUrl ? [0, 0, 0] : [0, 0.12, 0]}
        scale={customModelUrl ? 1.48 : 1}
      />
      <ContactShadows position={[0, -1.49, 0]} opacity={0.42} scale={4.8} blur={2.8} far={3.3} resolution={256} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={5.5}
        maxDistance={8.2}
        minPolarAngle={Math.PI / 2.18}
        maxPolarAngle={Math.PI / 1.9}
        rotateSpeed={0.65}
        zoomSpeed={0.7}
        target={[0, -0.05, 0]}
        onStart={onInteraction}
        onChange={() => {
          if (controlsRef.current) onAngleChange?.(controlsRef.current.getAzimuthalAngle());
        }}
      />
    </>
  );
}

export default function Jersey3DViewer({ team, name, number }) {
  const [ready, setReady] = useState(false);
  const [viewMode, setViewMode] = useState('front');
  const [viewRequest, setViewRequest] = useState({ angle: FRONT_ANGLE, id: 0 });
  const currentAngleRef = useRef(FRONT_ANGLE);

  const requestAngle = useCallback((angle, mode = null) => {
    setViewMode(mode);
    setViewRequest(previous => ({ angle, id: previous.id + 1 }));
  }, []);

  const handleKeyDown = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      requestAngle(currentAngleRef.current + direction * (Math.PI / 12));
    } else if (event.key === 'Home') {
      event.preventDefault();
      requestAngle(FRONT_ANGLE, 'front');
    } else if (event.key === 'End') {
      event.preventDefault();
      requestAngle(BACK_ANGLE, 'back');
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl"
      role="application"
      aria-label={`Visor 3D de la remera ${team.nombre}. Usá las flechas para girar.`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.05, 7], fov: 35, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <JerseyScene
            team={team}
            name={name}
            number={number}
            requestedAngle={viewRequest.angle}
            requestId={viewRequest.id}
            onReady={() => setReady(true)}
            onAngleChange={angle => { currentAngleRef.current = angle; }}
            onInteraction={() => setViewMode(null)}
          />
        </Suspense>
      </Canvas>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-secondary/75 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
            Preparando vista 3D
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-primary/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 backdrop-blur sm:text-xs">
        <Rotate3D className="h-4 w-4 text-accent-light" aria-hidden="true" />
        Arrastrá para girar
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-xl border border-white/10 bg-primary/75 p-1.5 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={() => requestAngle(FRONT_ANGLE, 'front')}
          aria-pressed={viewMode === 'front'}
          className={`min-h-9 rounded-lg px-4 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            viewMode === 'front' ? 'bg-accent text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          Frente
        </button>
        <button
          type="button"
          onClick={() => requestAngle(BACK_ANGLE, 'back')}
          aria-pressed={viewMode === 'back'}
          className={`min-h-9 rounded-lg px-4 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            viewMode === 'back' ? 'bg-accent text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
          }`}
        >
          Espalda
        </button>
      </div>
    </div>
  );
}

useGLTF.preload(BASE_JERSEY_MODEL_URL);
Object.values(TEAM_MODEL_URLS).forEach(modelUrl => useGLTF.preload(modelUrl));
