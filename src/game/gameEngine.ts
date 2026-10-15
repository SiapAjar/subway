import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AnimalType } from '../types/game';
import { AnimatedCharacterMesh, createAnimalCharacter } from './characterBuilder';
import {
  CoinData,
  createCoin,
  createHurdleObstacle,
  createMysteryBox,
  createOverheadObstacle,
  createTrainObstacle,
  MysteryBoxData,
  ObstacleData,
  TRACK_LANES,
  WorldBuilder,
} from './worldBuilder';
import { soundManager } from './audio';

export interface GameEngineCallbacks {
  onStatsUpdate: (stats: { score: number; distance: number; coins: number; lives: number }) => void;
  onMysteryBox: () => void;
  onHit: (livesLeft: number) => void;
  onGameOver: (finalStats: { score: number; distance: number; coins: number }) => void;
}

export class GameEngine {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private character: AnimatedCharacterMesh;
  private world: WorldBuilder;
  private callbacks: GameEngineCallbacks;

  // Dynamic Jungle Lighting rig (synchronized with player position)
  private hemiLight: THREE.HemisphereLight;
  private keyLight: THREE.DirectionalLight;
  private keyLightTarget: THREE.Object3D;
  private rimLight: THREE.DirectionalLight;

  // Game Loop & Clock
  private clock: THREE.Clock;
  private reqId: number | null = null;
  private isPaused: boolean = false;
  private isDestroyed: boolean = false;
  private isGameOver: boolean = false;

  // Player State
  private currentLane: number = 1; // 0: Left, 1: Center, 2: Right
  private targetLaneX: number = 0;
  private playerPos = new THREE.Vector3(0, 0, 0);
  private playerVy: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private invulnerableTimer: number = 0;
  private runAnimTime: number = 0;

  // Physics constants
  private readonly GRAVITY = -34;
  private readonly JUMP_VELOCITY = 13.5;
  private readonly SLIDE_DURATION = 0.65;
  private baseSpeed = 22;
  private currentSpeed = 22;

  // Stats
  private score: number = 0;
  private distance: number = 0;
  private coins: number = 0;
  private lives: number = 3;

  // Spawned elements
  private obstacles: ObstacleData[] = [];
  private coinList: CoinData[] = [];
  private mysteryBoxes: MysteryBoxData[] = [];
  private nextSpawnZ: number = -25;
  private lastMysteryBoxZ: number = 0;

  // Particle Sparkles / Glow System for Bonus Reward
  private sparkleGroup: THREE.Group;
  private auraRing: THREE.Mesh;
  private bonusGlowLight: THREE.PointLight;
  private sparkleParticles: {
    mesh: THREE.Mesh;
    angle: number;
    radius: number;
    speed: number;
    vy: number;
    scaleBase: number;
  }[] = [];
  private sparkleTimer: number = 0;
  private readonly SPARKLE_DURATION = 2.4;

  constructor(
    container: HTMLDivElement,
    animal: AnimalType,
    initialLives: number = 3,
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.lives = initialLives;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Setup Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // Setup Scene & Jungle Fog
    const JUNGLE_MIST = 0x064e3b; // Deep emerald rainforest canopy mist
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(JUNGLE_MIST);
    this.scene.fog = new THREE.Fog(JUNGLE_MIST, 35, 125);

    // Studio Environment reflection
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Camera: behind and slightly elevated Subway Surfers perspective
    this.camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 180);
    this.camera.position.set(0, 3.8, 5.5);
    this.camera.lookAt(0, 1.2, -8);

    // Tropical Jungle 3-point lighting rig (dynamically follows player)
    this.hemiLight = new THREE.HemisphereLight(0xa7f3d0, 0x14532d, 0.9);
    this.scene.add(this.hemiLight);

    // Dynamic target for sunlight direction
    this.keyLightTarget = new THREE.Object3D();
    this.keyLightTarget.position.set(0, 0, -8);
    this.scene.add(this.keyLightTarget);

    // Warm golden tropical sunlight piercing through tree canopy
    this.keyLight = new THREE.DirectionalLight(0xfef08a, 1.6);
    this.keyLight.position.set(12, 22, 10);
    this.keyLight.target = this.keyLightTarget;
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 80;
    const d = 16;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.keyLight.shadow.bias = -0.0005;
    this.keyLight.shadow.normalBias = 0.02;
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.DirectionalLight(0x34d399, 0.7);
    this.rimLight.position.set(-10, 8, -15);
    this.scene.add(this.rimLight);

    // Build World Track & Sleepers
    this.world = new WorldBuilder(this.scene);

    // Build Animal Character
    this.character = createAnimalCharacter(animal);
    this.character.position.set(0, 0, 0);
    this.scene.add(this.character);

    // Setup 3D Sparkle & Aura Ring System for Quiz Reward
    this.sparkleGroup = new THREE.Group();
    this.sparkleGroup.visible = false;
    this.scene.add(this.sparkleGroup);

    // Glowing Aura Ring beneath feet
    const auraGeo = new THREE.RingGeometry(0.8, 1.45, 32);
    auraGeo.rotateX(-Math.PI / 2);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.auraRing = new THREE.Mesh(auraGeo, auraMat);
    this.auraRing.position.y = 0.05;
    this.sparkleGroup.add(this.auraRing);

    // Glowing Dynamic Point Light on character
    this.bonusGlowLight = new THREE.PointLight(0xfacc15, 0, 10, 1.8);
    this.bonusGlowLight.position.set(0, 1.2, 0);
    this.sparkleGroup.add(this.bonusGlowLight);

    // 40 Sparkling Gems/Stars
    const sparkleGeo = new THREE.OctahedronGeometry(0.12);
    const sparkleColors = [0xfacc15, 0x10b981, 0x38bdf8, 0xfef08a, 0x34d399, 0xf43f5e];
    for (let i = 0; i < 40; i++) {
      const color = sparkleColors[i % sparkleColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(sparkleGeo, mat);
      this.sparkleGroup.add(mesh);
      this.sparkleParticles.push({
        mesh,
        angle: 0,
        radius: 0.5,
        speed: 3.0,
        vy: 2.0,
        scaleBase: 0.16,
      });
    }

    // Initial spawn ahead
    this.populateInitialTrack();

    // Start loop
    this.tick = this.tick.bind(this);
    this.reqId = requestAnimationFrame(this.tick);

    // Initial stats callback
    this.callbacks.onStatsUpdate({
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      lives: this.lives,
    });
  }

  // Pre-seed the track with obstacles & coins
  private populateInitialTrack() {
    for (let i = 0; i < 6; i++) {
      this.spawnNextTrackSegment();
    }
  }

  // Spawns varied obstacles and coin paths along the track ahead
  private spawnNextTrackSegment() {
    const z = this.nextSpawnZ;
    this.nextSpawnZ -= 22 + Math.random() * 8; // spacing

    // Random lane for obstacle
    const obstacleLane = Math.floor(Math.random() * 3);
    const randType = Math.random();

    let obs: ObstacleData;
    if (randType < 0.4) {
      obs = createHurdleObstacle(obstacleLane, z);
    } else if (randType < 0.75) {
      obs = createOverheadObstacle(obstacleLane, z);
    } else {
      obs = createTrainObstacle(obstacleLane, z);
    }

    this.scene.add(obs.mesh);
    this.obstacles.push(obs);

    // In other lanes, spawn coin arcs or straight lines
    const coinLane = (obstacleLane + (Math.random() > 0.5 ? 1 : 2)) % 3;
    const numCoins = 3 + Math.floor(Math.random() * 3);
    for (let c = 0; c < numCoins; c++) {
      const coin = createCoin(coinLane, z - 3 - c * 2.2, 0.6);
      this.scene.add(coin.mesh);
      this.coinList.push(coin);
    }

    // Spawn Mystery Quiz Box periodically (e.g. every 50-70 meters)
    const distSinceLastBox = Math.abs(z - this.lastMysteryBoxZ);
    if (distSinceLastBox > 55) {
      const mysteryLane = (coinLane + 1) % 3;
      const box = createMysteryBox(mysteryLane, z - 8, 0.85);
      this.scene.add(box.mesh);
      this.mysteryBoxes.push(box);
      this.lastMysteryBoxZ = z;
    }
  }

  // Main 60fps tick
  private tick() {
    if (this.isDestroyed) return;
    this.reqId = requestAnimationFrame(this.tick);

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // clamp

    if (this.isPaused || this.isGameOver) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.runAnimTime += dt;
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // Difficulty ramp: speed gradually increases
    this.currentSpeed = this.baseSpeed + Math.min(this.distance * 0.006, 12);

    // Forward motion (Z axis is negative moving forward)
    const forwardStep = this.currentSpeed * dt;
    this.playerPos.z -= forwardStep;
    this.distance += forwardStep;
    this.score += Math.floor(forwardStep * 1.5);

    // Smooth horizontal lane transition
    this.playerPos.x = THREE.MathUtils.damp(this.playerPos.x, this.targetLaneX, 16, dt);

    // Vertical jump physics
    if (!this.isGrounded) {
      this.playerVy += this.GRAVITY * dt;
      this.playerPos.y += this.playerVy * dt;

      if (this.playerPos.y <= 0) {
        this.playerPos.y = 0;
        this.playerVy = 0;
        this.isGrounded = true;
      }
    }

    // Slide timer
    if (this.isSliding) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // Update character position & animation
    this.character.position.copy(this.playerPos);
    this.character.updateAnimation(
      this.runAnimTime,
      !this.isGrounded,
      this.isSliding,
      this.invulnerableTimer > 0
    );

    // Camera follow smoothly behind player
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.playerPos.x * 0.45, 10, dt);
    this.camera.position.z = this.playerPos.z + 5.5;
    this.camera.lookAt(this.playerPos.x * 0.25, 1.2, this.playerPos.z - 8);

    // Update dynamic jungle lighting to lock directly with player position
    this.keyLight.position.set(this.playerPos.x + 14, 24, this.playerPos.z + 10);
    this.keyLightTarget.position.set(this.playerPos.x, 0.5, this.playerPos.z - 10);
    this.keyLightTarget.updateMatrixWorld();
    this.rimLight.position.set(this.playerPos.x - 12, 10, this.playerPos.z - 15);
    this.hemiLight.position.set(this.playerPos.x, 15, this.playerPos.z);

    // Update track and scenery illusion
    this.world.update(this.playerPos.z);

    // Animate coins & mystery boxes
    this.coinList.forEach((coin) => {
      if (coin.active) {
        coin.mesh.rotation.z += dt * 4;
      }
    });

    this.mysteryBoxes.forEach((box) => {
      if (box.active) {
        box.mesh.rotation.y += dt * 2.5;
        box.mesh.position.y = box.y + Math.sin(this.runAnimTime * 4) * 0.15;
      }
    });

    // Animate Bonus Reward Sparkles & Aura Ring around player
    if (this.sparkleTimer > 0) {
      this.sparkleTimer -= dt;
      const progress = 1 - (this.sparkleTimer / this.SPARKLE_DURATION);

      this.sparkleParticles.forEach((p, idx) => {
        p.angle += p.speed * dt;
        p.radius += 0.22 * dt;
        p.mesh.position.x = this.playerPos.x + Math.cos(p.angle) * p.radius;
        p.mesh.position.z = this.playerPos.z + Math.sin(p.angle) * p.radius;
        p.mesh.position.y += p.vy * dt;

        // Twinkling scale with smooth fade out
        const twinkle = 0.85 + 0.35 * Math.sin(this.runAnimTime * 25 + idx);
        const fade = Math.max(0, 1 - progress * progress);
        p.mesh.scale.setScalar(p.scaleBase * fade * twinkle);

        p.mesh.rotation.x += dt * 6;
        p.mesh.rotation.y += dt * 8;
      });

      if (this.auraRing) {
        this.auraRing.position.set(this.playerPos.x, this.playerPos.y + 0.05, this.playerPos.z);
        this.auraRing.scale.setScalar(0.8 + progress * 2.2);
        (this.auraRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - progress) * 0.95);
      }

      if (this.bonusGlowLight) {
        this.bonusGlowLight.position.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
        this.bonusGlowLight.intensity = Math.max(0, (1 - progress) * 5.0);
      }

      if (this.sparkleTimer <= 0) {
        this.sparkleGroup.visible = false;
        if (this.bonusGlowLight) {
          this.bonusGlowLight.intensity = 0;
        }
      }
    }

    // Check Collisions
    this.checkCollisions();

    // Spawn more segments if approaching nextSpawnZ
    if (this.playerPos.z - 70 < this.nextSpawnZ) {
      this.spawnNextTrackSegment();
    }

    // Cleanup passed elements
    this.cleanupPassedElements();

    // Render scene
    this.renderer.render(this.scene, this.camera);

    // Throttled UI stats update
    if (Math.random() < 0.25) {
      this.callbacks.onStatsUpdate({
        score: this.score,
        distance: Math.floor(this.distance),
        coins: this.coins,
        lives: this.lives,
      });
    }
  }

  // Check player collisions with obstacles, coins, and mystery boxes
  private checkCollisions() {
    const playerZ = this.playerPos.z;
    const playerX = this.playerPos.x;
    const playerY = this.playerPos.y;

    // 1. Coins
    for (let i = 0; i < this.coinList.length; i++) {
      const coin = this.coinList[i];
      if (!coin.active) continue;

      const dz = Math.abs(playerZ - coin.z);
      const dx = Math.abs(playerX - TRACK_LANES[coin.lane]);
      const dy = Math.abs(playerY + 0.4 - coin.y);

      if (dz < 1.1 && dx < 0.85 && dy < 1.0) {
        coin.active = false;
        this.scene.remove(coin.mesh);
        this.disposeObject(coin.mesh);
        this.coins += 1;
        this.score += 25;
        soundManager.playCoin();
      }
    }

    // 2. Mystery Box
    for (let i = 0; i < this.mysteryBoxes.length; i++) {
      const box = this.mysteryBoxes[i];
      if (!box.active) continue;

      const dz = Math.abs(playerZ - box.z);
      const dx = Math.abs(playerX - TRACK_LANES[box.lane]);

      if (dz < 1.3 && dx < 0.95) {
        box.active = false;
        this.scene.remove(box.mesh);
        this.disposeObject(box.mesh);
        soundManager.playMysteryBox();
        this.pause();
        this.callbacks.onMysteryBox();
        return;
      }
    }

    // 3. Obstacles (only if not currently invulnerable)
    if (this.invulnerableTimer > 0) return;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      if (!obs.active) continue;

      const dz = Math.abs(playerZ - obs.z);
      const dx = Math.abs(playerX - TRACK_LANES[obs.lane]);

      // Check depth overlap
      const hitDepth = obs.type === 'train' ? 4.2 : 0.8;
      if (dz < hitDepth && dx < 0.85) {
        let isSafe = false;

        if (obs.type === 'hurdle' && playerY > 0.85) {
          // Successfully jumped over hurdle!
          isSafe = true;
        } else if (obs.type === 'overhead' && this.isSliding) {
          // Successfully ducked/slid under overhead!
          isSafe = true;
        }

        if (!isSafe) {
          // Collision occurred!
          this.handleHit();
          obs.active = false; // deactivate so it doesn't hit repeatedly
          break;
        }
      }
    }
  }

  // Handle hitting obstacle
  private handleHit() {
    this.lives -= 1;
    this.invulnerableTimer = 1.6; // 1.6s grace period with visual shake
    soundManager.playHit();

    this.callbacks.onStatsUpdate({
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      lives: this.lives,
    });
    this.callbacks.onHit(this.lives);

    if (this.lives <= 0) {
      this.isGameOver = true;
      soundManager.playGameOver();
      this.callbacks.onGameOver({
        score: this.score,
        distance: Math.floor(this.distance),
        coins: this.coins,
      });
    }
  }

  // Recursively dispose geometry and material to prevent GPU memory creep
  private disposeObject(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }

  // Recycle / remove objects that are well behind camera
  private cleanupPassedElements() {
    const cutoffZ = this.playerPos.z + 14;

    this.obstacles = this.obstacles.filter((obs) => {
      if (obs.z > cutoffZ) {
        this.scene.remove(obs.mesh);
        this.disposeObject(obs.mesh);
        return false;
      }
      return true;
    });

    this.coinList = this.coinList.filter((coin) => {
      if (coin.z > cutoffZ) {
        this.scene.remove(coin.mesh);
        this.disposeObject(coin.mesh);
        return false;
      }
      return true;
    });

    this.mysteryBoxes = this.mysteryBoxes.filter((box) => {
      if (box.z > cutoffZ) {
        this.scene.remove(box.mesh);
        this.disposeObject(box.mesh);
        return false;
      }
      return true;
    });
  }

  // Controls
  public moveLeft() {
    if (this.currentLane > 0) {
      this.currentLane -= 1;
      this.targetLaneX = TRACK_LANES[this.currentLane];
      soundManager.playSwitchLane();
    }
  }

  public moveRight() {
    if (this.currentLane < 2) {
      this.currentLane += 1;
      this.targetLaneX = TRACK_LANES[this.currentLane];
      soundManager.playSwitchLane();
    }
  }

  public jump() {
    if (this.isGrounded) {
      this.playerVy = this.JUMP_VELOCITY;
      this.isGrounded = false;
      this.isSliding = false;
      soundManager.playJump();
    }
  }

  public slide() {
    this.isSliding = true;
    this.slideTimer = this.SLIDE_DURATION;
    // Fast drop if jumping
    if (!this.isGrounded) {
      this.playerVy = -18;
    }
    soundManager.playSlide();
  }

  // Trigger celebratory 3D particles & aura ring around character
  public triggerBonusSparkles() {
    this.sparkleTimer = this.SPARKLE_DURATION;
    this.sparkleGroup.visible = true;

    // Reset particles spiraling around player current position
    this.sparkleParticles.forEach((p, idx) => {
      p.angle = (idx / this.sparkleParticles.length) * Math.PI * 2 + (Math.random() - 0.5);
      p.radius = 0.35 + Math.random() * 0.75;
      p.speed = 2.5 + Math.random() * 3.5;
      p.vy = 1.3 + Math.random() * 2.2;
      p.scaleBase = 0.14 + Math.random() * 0.12;
      p.mesh.position.set(
        this.playerPos.x + Math.cos(p.angle) * p.radius,
        this.playerPos.y + 0.1 + Math.random() * 0.7,
        this.playerPos.z + Math.sin(p.angle) * p.radius
      );
      p.mesh.scale.setScalar(p.scaleBase);
    });

    if (this.auraRing) {
      this.auraRing.position.set(this.playerPos.x, this.playerPos.y + 0.05, this.playerPos.z);
      this.auraRing.scale.set(0.8, 0.8, 0.8);
      (this.auraRing.material as THREE.MeshBasicMaterial).opacity = 0.95;
    }

    if (this.bonusGlowLight) {
      this.bonusGlowLight.position.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z);
      this.bonusGlowLight.intensity = 5.0;
    }
  }

  // Add life & bonus points when answering question correctly
  public addBonusLifeAndScore(lifeCount: number = 1, bonusScore: number = 250) {
    this.lives += lifeCount;
    this.score += bonusScore;
    this.triggerBonusSparkles();
    this.callbacks.onStatsUpdate({
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      lives: this.lives,
    });
  }

  public addBonusScoreOnly(bonusScore: number = 300) {
    this.score += bonusScore;
    this.triggerBonusSparkles();
    this.callbacks.onStatsUpdate({
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      lives: this.lives,
    });
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.clock.getDelta(); // reset delta so no sudden warp
  }

  public handleResize() {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
      this.reqId = null;
    }
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
