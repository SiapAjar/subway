import * as THREE from 'three';

export const TRACK_LANES = [-2.5, 0, 2.5] as const;
export type LaneIndex = 0 | 1 | 2;

export interface ObstacleData {
  mesh: THREE.Group;
  lane: number;
  z: number;
  type: 'hurdle' | 'overhead' | 'train' | 'barrier';
  width: number;
  height: number;
  depth: number;
  requiresSlide: boolean;
  canJumpOver: boolean;
  active: boolean;
}

export interface CoinData {
  mesh: THREE.Mesh;
  lane: number;
  z: number;
  y: number;
  active: boolean;
}

export interface MysteryBoxData {
  mesh: THREE.Group;
  lane: number;
  z: number;
  y: number;
  active: boolean;
}

export interface SceneryElement {
  mesh: THREE.Group | THREE.Mesh;
  z: number;
  baseX: number;
}

// Procedural Jungle Environment Builder with Infinite Procedural Cycling
export class WorldBuilder {
  private scene: THREE.Scene;
  private trackGroup: THREE.Group;
  private ground: THREE.Mesh;
  private jungleL: THREE.Mesh;
  private jungleR: THREE.Mesh;
  private sleepersInstanced: THREE.InstancedMesh;
  private railsInstanced: THREE.InstancedMesh;
  private sleeperCount = 180;
  private railSegmentCount = 55;
  private sceneryItems: SceneryElement[] = [];
  private archPool: THREE.Group[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.trackGroup = new THREE.Group();
    this.scene.add(this.trackGroup);

    // 1. Jungle Ground Track Bed (Moist forest soil & moss) - 360 units long
    const groundGeo = new THREE.PlaneGeometry(18, 360);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1c2826, // Moist forest loam
      roughness: 0.95,
      metalness: 0.05,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.position.set(0, -0.05, -90);
    this.ground.receiveShadow = true;
    this.trackGroup.add(this.ground);

    // 2. Dense Jungle Undergrowth / Rainforest Floor Borders - 360 units long
    const jungleFloraMat = new THREE.MeshStandardMaterial({
      color: 0x0f5132, // Deep jungle emerald
      roughness: 0.85,
    });
    const jungleFloorGeo = new THREE.PlaneGeometry(42, 360);
    jungleFloorGeo.rotateX(-Math.PI / 2);

    this.jungleL = new THREE.Mesh(jungleFloorGeo, jungleFloraMat);
    this.jungleL.position.set(-28, -0.04, -90);
    this.jungleL.receiveShadow = true;

    this.jungleR = new THREE.Mesh(jungleFloorGeo, jungleFloraMat);
    this.jungleR.position.set(28, -0.04, -90);
    this.jungleR.receiveShadow = true;
    this.trackGroup.add(this.jungleL, this.jungleR);

    // 3. Track Sleepers (Weathered Jungle Timber Ties) - covers +30 to -294
    const sleeperGeo = new THREE.BoxGeometry(8.2, 0.12, 0.38);
    const sleeperMat = new THREE.MeshStandardMaterial({
      color: 0x3e2723, // Weathered jungle wood
      roughness: 0.9,
    });
    this.sleepersInstanced = new THREE.InstancedMesh(sleeperGeo, sleeperMat, this.sleeperCount);
    this.sleepersInstanced.receiveShadow = true;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < this.sleeperCount; i++) {
      dummy.position.set(0, 0.02, 30 - i * 1.8);
      dummy.updateMatrix();
      this.sleepersInstanced.setMatrixAt(i, dummy.matrix);
    }
    this.sleepersInstanced.instanceMatrix.needsUpdate = true;
    this.trackGroup.add(this.sleepersInstanced);

    // 4. Heavy Iron Rails - covers +30 to -289
    const railGeo = new THREE.BoxGeometry(0.09, 0.13, 6.0);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Aged steel patina
      metalness: 0.8,
      roughness: 0.3,
    });
    this.railsInstanced = new THREE.InstancedMesh(railGeo, railMat, this.railSegmentCount * 6);
    this.railsInstanced.receiveShadow = true;
    this.railsInstanced.castShadow = true;

    let rIdx = 0;
    TRACK_LANES.forEach((laneX) => {
      [-0.7, 0.7].forEach((railOffset) => {
        for (let s = 0; s < this.railSegmentCount; s++) {
          dummy.position.set(laneX + railOffset, 0.08, 30 - s * 5.8);
          dummy.updateMatrix();
          this.railsInstanced.setMatrixAt(rIdx++, dummy.matrix);
        }
      });
    });
    this.railsInstanced.instanceMatrix.needsUpdate = true;
    this.trackGroup.add(this.railsInstanced);

    // 5. Rich Jungle Flora & Ancient Safari Stone Ruins Pool
    this.createJungleScenery();
  }

  private createJungleScenery() {
    // Palm trees & Tropical Canopy Trees along the jungle flanks
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2c11, roughness: 0.9 });
    const palmFoliageMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.65 });
    const palmFoliageMat2 = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });

    // Spawn 36 tropical trees & boulders along both sides spanning 230m
    const pairsCount = 36;
    for (let i = 0; i < pairsCount; i++) {
      const z = 10 - i * 6.5;

      [-8.5, 8.5].forEach((xSide, sideIdx) => {
        const xOffset = xSide + (Math.random() * 2.5 - 1.25);
        const isPalm = (i + sideIdx) % 2 === 0;

        if (isPalm) {
          // Tropical Palm Tree
          const palm = new THREE.Group();
          const palmTrunkGeo = new THREE.CylinderGeometry(0.18, 0.32, 3.6, 7);
          const palmTrunk = new THREE.Mesh(palmTrunkGeo, trunkMat);
          palmTrunk.position.y = 1.8;
          palmTrunk.rotation.z = (Math.random() - 0.5) * 0.15;
          palmTrunk.castShadow = true;
          palm.add(palmTrunk);

          // 5 Spreading Palm Fronds
          for (let f = 0; f < 5; f++) {
            const frondGeo = new THREE.ConeGeometry(1.2, 2.2, 5);
            frondGeo.rotateX(Math.PI / 2.5);
            const frond = new THREE.Mesh(frondGeo, palmFoliageMat1);
            frond.position.set(0, 3.6, 0);
            frond.rotation.y = (f / 5) * Math.PI * 2;
            frond.castShadow = true;
            palm.add(frond);
          }

          palm.position.set(xOffset, 0, z);
          this.trackGroup.add(palm);
          this.sceneryItems.push({ mesh: palm, z, baseX: xSide });
        } else {
          // Lush Multi-Layer Jungle Canopy Tree
          const tree = new THREE.Group();
          const trunkGeo = new THREE.CylinderGeometry(0.28, 0.42, 2.4, 6);
          const trunk = new THREE.Mesh(trunkGeo, trunkMat);
          trunk.position.y = 1.2;
          trunk.castShadow = true;

          // 3 Layered Jungle Canopy Foliage
          const f1Geo = new THREE.DodecahedronGeometry(1.6);
          const f1 = new THREE.Mesh(f1Geo, palmFoliageMat2);
          f1.position.y = 3.0;
          f1.castShadow = true;

          const f2Geo = new THREE.DodecahedronGeometry(1.2);
          const f2 = new THREE.Mesh(f2Geo, palmFoliageMat1);
          f2.position.set(0.3, 4.2, 0.2);
          f2.castShadow = true;

          tree.add(trunk, f1, f2);
          tree.position.set(xOffset, 0, z);
          this.trackGroup.add(tree);
          this.sceneryItems.push({ mesh: tree, z, baseX: xSide });
        }

        // Mossy Jungle Boulders on the ground
        if (i % 3 === 0) {
          const boulderGeo = new THREE.DodecahedronGeometry(0.75 + Math.random() * 0.4);
          const boulder = new THREE.Mesh(boulderGeo, rockMat);
          const bz = z + 2;
          boulder.position.set(xOffset * 0.75, 0.35, bz);
          boulder.castShadow = true;
          boulder.receiveShadow = true;
          this.trackGroup.add(boulder);
          this.sceneryItems.push({ mesh: boulder, z: bz, baseX: xSide * 0.75 });
        }
      });
    }

    // Ancient Jungle Temple / Bamboo Safari Archway Pool (3 arches)
    const arch1 = this.createJungleSafariArch();
    arch1.position.set(0, 0, -45);
    this.trackGroup.add(arch1);
    this.archPool.push(arch1);

    const arch2 = this.createJungleSafariArch();
    arch2.position.set(0, 0, -125);
    this.trackGroup.add(arch2);
    this.archPool.push(arch2);

    const arch3 = this.createJungleSafariArch();
    arch3.position.set(0, 0, -205);
    this.trackGroup.add(arch3);
    this.archPool.push(arch3);
  }

  // Ancient Jungle Ruin / Safari Arch with vines
  private createJungleSafariArch(): THREE.Group {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Ancient temple stone
      roughness: 0.9,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Jungle timber
      roughness: 0.8,
    });
    const vineMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Green jungle creepers
      roughness: 0.6,
    });

    // Left & Right Carved Stone Pillars
    const pillarGeo = new THREE.BoxGeometry(0.65, 6.2, 0.65);
    const pillarL = new THREE.Mesh(pillarGeo, stoneMat);
    pillarL.position.set(-4.6, 3.1, 0);
    pillarL.castShadow = true;

    const pillarR = new THREE.Mesh(pillarGeo, stoneMat);
    pillarR.position.set(4.6, 3.1, 0);
    pillarR.castShadow = true;

    // Cross Jungle Timber Beam
    const crossGeo = new THREE.BoxGeometry(9.8, 0.5, 0.5);
    const cross = new THREE.Mesh(crossGeo, woodMat);
    cross.position.set(0, 5.9, 0);

    // Carved Wooden Safari Sign
    const signGeo = new THREE.BoxGeometry(5.2, 1.2, 0.15);
    const signMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 5.2, 0);

    // Hanging Jungle Vines from the arch
    const vineGeo = new THREE.CylinderGeometry(0.04, 0.03, 2.2, 5);
    [-2.2, -0.8, 0.8, 2.2].forEach((vx) => {
      const vine = new THREE.Mesh(vineGeo, vineMat);
      vine.position.set(vx, 4.4, 0.1);
      group.add(vine);
    });

    group.add(pillarL, pillarR, cross, sign);
    return group;
  }

  // Seamless procedural update of ground, rails, sleepers, trees, and arches
  public update(playerZ: number) {
    // 1. Ground & jungle flanks continuously track with player - zero void forever
    this.ground.position.z = playerZ - 90;
    this.jungleL.position.z = playerZ - 90;
    this.jungleR.position.z = playerZ - 90;

    // 2. Sleepers and rails snap to grid intervals around player
    this.sleepersInstanced.position.z = Math.floor(playerZ / 1.8) * 1.8;
    this.railsInstanced.position.z = Math.floor(playerZ / 5.8) * 5.8;

    // 3. Recycle passed scenery items (trees, palms, boulders) ahead of player
    const recycleThreshold = playerZ + 25;
    for (let i = 0; i < this.sceneryItems.length; i++) {
      const item = this.sceneryItems[i];
      if (item.mesh.position.z > recycleThreshold) {
        // Find front-most element (lowest Z)
        let minZ = playerZ - 100;
        for (let j = 0; j < this.sceneryItems.length; j++) {
          if (this.sceneryItems[j].mesh.position.z < minZ) {
            minZ = this.sceneryItems[j].mesh.position.z;
          }
        }
        const newZ = minZ - (5.5 + Math.random() * 2.5);
        item.mesh.position.z = newZ;
        item.z = newZ;
        item.mesh.position.x = item.baseX + (Math.random() * 2.2 - 1.1);
      }
    }

    // 4. Recycle passed safari arches ahead of player
    for (let i = 0; i < this.archPool.length; i++) {
      const arch = this.archPool[i];
      if (arch.position.z > recycleThreshold) {
        let minArchZ = playerZ - 120;
        for (let j = 0; j < this.archPool.length; j++) {
          if (this.archPool[j].position.z < minArchZ) {
            minArchZ = this.archPool[j].position.z;
          }
        }
        arch.position.z = minArchZ - (85 + Math.random() * 35);
      }
    }
  }
}

// 1. JUNGLE HURDLE: Giant Fallen Mossy Log with Mushrooms (Lompat / Jump)
export function createHurdleObstacle(lane: number, z: number): ObstacleData {
  const group = new THREE.Group();
  const x = TRACK_LANES[lane];

  const logMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Dark fallen tree bark
    roughness: 0.9,
  });
  const mossMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Bright jungle moss
    roughness: 0.7,
  });
  const shroomMat = new THREE.MeshStandardMaterial({
    color: 0xef4444, // Red wild mushrooms
    roughness: 0.3,
  });

  // Main fallen log trunk across lane
  const trunkGeo = new THREE.CylinderGeometry(0.36, 0.4, 2.1, 12);
  trunkGeo.rotateZ(Math.PI / 2);
  const trunk = new THREE.Mesh(trunkGeo, logMat);
  trunk.position.set(0, 0.4, 0);
  trunk.castShadow = true;
  trunk.receiveShadow = true;

  // Moss patch on top of log
  const mossGeo = new THREE.BoxGeometry(1.6, 0.08, 0.4);
  const moss = new THREE.Mesh(mossGeo, mossMat);
  moss.position.set(0, 0.74, 0);

  // Wild bracket mushrooms growing on log
  const capGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.04, 8);
  const shroom1 = new THREE.Mesh(capGeo, shroomMat);
  shroom1.position.set(-0.5, 0.65, 0.3);
  shroom1.rotation.x = 0.4;

  const shroom2 = new THREE.Mesh(capGeo, shroomMat);
  shroom2.position.set(0.4, 0.7, 0.28);
  shroom2.rotation.x = 0.3;

  group.add(trunk, moss, shroom1, shroom2);
  group.position.set(x, 0, z);

  return {
    mesh: group,
    lane,
    z,
    type: 'hurdle',
    width: 2.0,
    height: 0.85,
    depth: 0.6,
    requiresSlide: false,
    canJumpOver: true,
    active: true,
  };
}

// 2. JUNGLE OVERHEAD: Low-hanging Tree Branch & Hanging Jungle Lianas (Meluncur / Slide)
export function createOverheadObstacle(lane: number, z: number): ObstacleData {
  const group = new THREE.Group();
  const x = TRACK_LANES[lane];

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.85 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  const vineMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });

  // Two bamboo / timber side posts
  const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.6, 8);
  const postL = new THREE.Mesh(postGeo, woodMat);
  postL.position.set(-0.95, 1.3, 0);

  const postR = new THREE.Mesh(postGeo, woodMat);
  postR.position.set(0.95, 1.3, 0);

  // Low hanging jungle branch bar
  const branchGeo = new THREE.BoxGeometry(2.1, 0.6, 0.35);
  const branch = new THREE.Mesh(branchGeo, woodMat);
  branch.position.set(0, 1.85, 0);
  branch.castShadow = true;

  // Bushy jungle leaves on top of the branch
  const leafGeo = new THREE.SphereGeometry(0.35, 8, 8);
  leafGeo.scale(2.2, 0.8, 1);
  const leaves = new THREE.Mesh(leafGeo, foliageMat);
  leaves.position.set(0, 2.2, 0);
  leaves.castShadow = true;

  // Dangling jungle vines
  const vineGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.7, 5);
  [-0.6, -0.2, 0.2, 0.6].forEach((vx) => {
    const vine = new THREE.Mesh(vineGeo, vineMat);
    vine.position.set(vx, 1.3, 0.05);
    group.add(vine);
  });

  group.add(postL, postR, branch, leaves);
  group.position.set(x, 0, z);

  return {
    mesh: group,
    lane,
    z,
    type: 'overhead',
    width: 2.0,
    height: 2.5,
    depth: 0.45,
    requiresSlide: true, // Must slide underneath!
    canJumpOver: false,
    active: true,
  };
}

// 3. JUNGLE TRAIN: Jungle Safari Expedition Cargo Wagon (Pindah Jalur / Dodge)
export function createTrainObstacle(lane: number, z: number): ObstacleData {
  const group = new THREE.Group();
  const x = TRACK_LANES[lane];

  // Safari Khaki-Green Expedition Wagon
  const bodyGeo = new THREE.BoxGeometry(2.1, 2.7, 7.8);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a1e, // Jungle safari olive
    roughness: 0.5,
    metalness: 0.25,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.35, 0);
  body.castShadow = true;
  body.receiveShadow = true;

  // Safari Wooden Cargo Crates on Roof
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
  const crateGeo1 = new THREE.BoxGeometry(0.8, 0.7, 1.0);
  const crate1 = new THREE.Mesh(crateGeo1, crateMat);
  crate1.position.set(-0.4, 2.95, -1.2);
  crate1.castShadow = true;

  const crate2 = new THREE.Mesh(crateGeo1, crateMat);
  crate2.position.set(0.3, 2.95, 1.0);
  crate2.castShadow = true;

  // Front Windshield with safari grille
  const windGeo = new THREE.BoxGeometry(1.6, 0.85, 0.1);
  const windMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
  });
  const windshield = new THREE.Mesh(windGeo, windMat);
  windshield.position.set(0, 1.95, 3.92);

  // Safari Golden Search Headlights
  const lightGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.1,
    roughness: 0.15,
  });
  const lightL = new THREE.Mesh(lightGeo, lightMat);
  lightL.position.set(-0.7, 0.85, 3.92);

  const lightR = new THREE.Mesh(lightGeo, lightMat);
  lightR.position.set(0.7, 0.85, 3.92);

  // Safari Yellow/Black Front Bumper Bar
  const bumperGeo = new THREE.BoxGeometry(1.9, 0.25, 0.3);
  const bumperMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  bumper.position.set(0, 0.45, 3.98);

  group.add(body, crate1, crate2, windshield, lightL, lightR, bumper);
  group.position.set(x, 0, z);

  return {
    mesh: group,
    lane,
    z,
    type: 'train',
    width: 2.1,
    height: 2.8,
    depth: 7.8,
    requiresSlide: false,
    canJumpOver: false,
    active: true,
  };
}

// 4. Aztec / Jungle Sun Gold Coin
export function createCoin(lane: number, z: number, y: number = 0.6): CoinData {
  const geo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14);
  geo.rotateX(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.position.set(TRACK_LANES[lane], y, z);

  return {
    mesh,
    lane,
    z,
    y,
    active: true,
  };
}

// 5. Ancient Jungle Mystery Relic Box
export function createMysteryBox(lane: number, z: number, y: number = 0.9): MysteryBoxData {
  const group = new THREE.Group();

  // Emerald & Gold Ancient Jungle Relic Cube
  const boxGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x059669, // Glowing jungle emerald
    emissive: 0x047857,
    emissiveIntensity: 0.6,
    roughness: 0.2,
    metalness: 0.5,
  });
  const boxMesh = new THREE.Mesh(boxGeo, boxMat);
  boxMesh.castShadow = true;

  // Golden vine bands wrapped around the relic
  const ribGeo = new THREE.BoxGeometry(0.88, 0.88, 0.16);
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 0.65,
  });
  const rib1 = new THREE.Mesh(ribGeo, ribMat);
  const rib2 = new THREE.Mesh(ribGeo, ribMat);
  rib2.rotation.y = Math.PI / 2;

  // Floating mystical rune star on top
  const starGeo = new THREE.OctahedronGeometry(0.18);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfef08a,
    emissiveIntensity: 1.0,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.set(0, 0.65, 0);

  group.add(boxMesh, rib1, rib2, star);
  group.position.set(TRACK_LANES[lane], y, z);

  return {
    mesh: group,
    lane,
    z,
    y,
    active: true,
  };
}
