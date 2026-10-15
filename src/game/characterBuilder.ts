import * as THREE from 'three';
import { AnimalInfo, AnimalType } from '../types/game';

export const ANIMAL_LIST: AnimalInfo[] = [
  {
    id: 'kelinci',
    name: 'Kelinci',
    emoji: '🐰',
    primaryColor: '#F8FAFC',
    secondaryColor: '#F472B6',
    accentColor: '#FB7185',
    description: 'Lincah, telinga panjang, dan lompatan tinggi!',
    perk: 'Lompatan Ringan & Responsif',
  },
  {
    id: 'jerapah',
    name: 'Jerapah',
    emoji: '🦒',
    primaryColor: '#F59E0B',
    secondaryColor: '#78350F',
    accentColor: '#D97706',
    description: 'Leher jenjang gagah dengan motif tutul khas Afrika.',
    perk: 'Jangkauan Pandang Luas',
  },
  {
    id: 'kuda',
    name: 'Kuda',
    emoji: '🐴',
    primaryColor: '#854D0E',
    secondaryColor: '#451A03',
    accentColor: '#CA8A04',
    description: 'Pelari tangguh dengan surai hitam gagah!',
    perk: 'Akselerasi Berlari Cepat',
  },
  {
    id: 'katak',
    name: 'Katak',
    emoji: '🐸',
    primaryColor: '#22C55E',
    secondaryColor: '#BBF7D0',
    accentColor: '#15803D',
    description: 'Mata belo ceria dan lompatan super elastis!',
    perk: 'Mendarat Seimbang',
  },
  {
    id: 'harimau',
    name: 'Harimau',
    emoji: '🐯',
    primaryColor: '#EA580C',
    secondaryColor: '#18181B',
    accentColor: '#FED7AA',
    description: 'Si belang penguasa rimba yang pemberani dan lincah.',
    perk: 'Refleks Belok Tajam',
  },
  {
    id: 'singa',
    name: 'Singa',
    emoji: '🦁',
    primaryColor: '#EAB308',
    secondaryColor: '#78350F',
    accentColor: '#FDE047',
    description: 'Raja hutan bersurai lebat nan megah.',
    perk: 'Daya Tahan Kuat',
  },
  {
    id: 'burung',
    name: 'Burung',
    emoji: '🦜',
    primaryColor: '#0EA5E9',
    secondaryColor: '#FACC15',
    accentColor: '#38BDF8',
    description: 'Sayap cerah meluncur di atas rel dengan gesit!',
    perk: 'Waktu Melayang Halus',
  },
  {
    id: 'monyet',
    name: 'Monyet',
    emoji: '🐒',
    primaryColor: '#92400E',
    secondaryColor: '#FDE68A',
    accentColor: '#B45309',
    description: 'Ekor panjang akrobatik yang selalu ceria!',
    perk: 'Manuver Gesit',
  },
  {
    id: 'babi',
    name: 'Babi',
    emoji: '🐷',
    primaryColor: '#F472B6',
    secondaryColor: '#FDA4AF',
    accentColor: '#DB2777',
    description: 'Hidung bulat menggemaskan dan ekor mungil melingkar.',
    perk: 'Hoki Magnet Bonus',
  },
  {
    id: 'anjing',
    name: 'Anjing',
    emoji: '🐶',
    primaryColor: '#D97706',
    secondaryColor: '#FEF3C7',
    accentColor: '#EF4444',
    description: 'Sahabat setia dengan telinga mengibas dan kalung merah.',
    perk: 'Fokus Tajam',
  },
  {
    id: 'kucing',
    name: 'Kucing',
    emoji: '🐱',
    primaryColor: '#F97316',
    secondaryColor: '#FFFFFF',
    accentColor: '#FB923C',
    description: 'Langkah kaki seringan kapas dan kumis detektor.',
    perk: 'Dodge Cepat Menghindar',
  },
];

export interface AnimatedCharacterMesh extends THREE.Group {
  updateAnimation: (runTime: number, isJumping: boolean, isSliding: boolean, isHit: boolean) => void;
  characterType: AnimalType;
}

export function createAnimalCharacter(type: AnimalType): AnimatedCharacterMesh {
  const root = new THREE.Group() as AnimatedCharacterMesh;
  root.characterType = type;

  // Material helpers with varying roughness / metalness
  const matMain = new THREE.MeshStandardMaterial({
    roughness: 0.65,
    metalness: 0.1,
  });
  const matSecondary = new THREE.MeshStandardMaterial({
    roughness: 0.45,
    metalness: 0.15,
  });
  const matAccent = new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 0.2,
  });
  const matEyes = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9,
  });
  const matEyeWhites = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
  });

  const animalDef = ANIMAL_LIST.find((a) => a.id === type) || ANIMAL_LIST[0];
  matMain.color.set(animalDef.primaryColor);
  matSecondary.color.set(animalDef.secondaryColor);
  matAccent.color.set(animalDef.accentColor);

  // Body container (pivoted so bottom sits on ground Y=0)
  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0.55;
  root.add(bodyGroup);

  // Torso
  const torsoGeo = new THREE.CapsuleGeometry(0.32, 0.45, 8, 14);
  const torsoMesh = new THREE.Mesh(torsoGeo, matMain);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  bodyGroup.add(torsoMesh);

  // Belly patch (front: -Z)
  const bellyGeo = new THREE.SphereGeometry(0.24, 12, 12);
  bellyGeo.scale(0.9, 1.2, 0.4);
  const bellyMesh = new THREE.Mesh(bellyGeo, matSecondary);
  bellyMesh.position.set(0, -0.05, -0.18);
  bodyGroup.add(bellyMesh);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.42, -0.05);
  bodyGroup.add(headGroup);

  // Giraffe special: extra tall neck
  if (type === 'jerapah') {
    const neckGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.65, 10);
    const neckMesh = new THREE.Mesh(neckGeo, matMain);
    neckMesh.position.set(0, 0.3, -0.05);
    neckMesh.castShadow = true;
    bodyGroup.add(neckMesh);
    headGroup.position.set(0, 0.85, -0.1);
  }

  // Head mesh
  const headGeo = new THREE.SphereGeometry(type === 'katak' ? 0.38 : 0.32, 14, 14);
  headGeo.scale(1, 0.95, 1.05);
  const headMesh = new THREE.Mesh(headGeo, matMain);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Eyes (Left & Right facing forward -Z)
  const eyeWhiteGeo = new THREE.SphereGeometry(0.09, 10, 10);
  const pupilGeo = new THREE.SphereGeometry(0.05, 8, 8);

  const leftEyeWhite = new THREE.Mesh(eyeWhiteGeo, matEyeWhites);
  const rightEyeWhite = new THREE.Mesh(eyeWhiteGeo, matEyeWhites);
  const leftPupil = new THREE.Mesh(pupilGeo, matEyes);
  const rightPupil = new THREE.Mesh(pupilGeo, matEyes);

  leftPupil.position.set(0, 0, -0.06);
  rightPupil.position.set(0, 0, -0.06);
  leftEyeWhite.add(leftPupil);
  rightEyeWhite.add(rightPupil);

  if (type === 'katak') {
    // Frog has big eyes bulging on top
    leftEyeWhite.position.set(-0.2, 0.28, -0.15);
    rightEyeWhite.position.set(0.2, 0.28, -0.15);
    leftEyeWhite.scale.set(1.4, 1.4, 1.4);
    rightEyeWhite.scale.set(1.4, 1.4, 1.4);
  } else {
    leftEyeWhite.position.set(-0.13, 0.06, -0.26);
    rightEyeWhite.position.set(0.13, 0.06, -0.26);
  }
  headGroup.add(leftEyeWhite, rightEyeWhite);

  // Custom Ears / Mane / Beak / Snout according to animal
  const earGroupL = new THREE.Group();
  const earGroupR = new THREE.Group();

  if (type === 'kelinci') {
    // Long upright ears
    const earGeo = new THREE.CapsuleGeometry(0.07, 0.42, 6, 10);
    const innerEarGeo = new THREE.CapsuleGeometry(0.04, 0.34, 6, 8);
    const leftEar = new THREE.Mesh(earGeo, matMain);
    const leftInner = new THREE.Mesh(innerEarGeo, matSecondary);
    leftInner.position.set(0, 0, -0.04);
    leftEar.add(leftInner);

    const rightEar = leftEar.clone();

    earGroupL.position.set(-0.15, 0.32, 0);
    earGroupR.position.set(0.15, 0.32, 0);
    earGroupL.rotation.z = 0.15;
    earGroupR.rotation.z = -0.15;
    earGroupL.add(leftEar);
    earGroupR.add(rightEar);
    headGroup.add(earGroupL, earGroupR);

    // Cute pink nose facing front (-Z)
    const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const noseMesh = new THREE.Mesh(noseGeo, matSecondary);
    noseMesh.position.set(0, -0.05, -0.32);
    headGroup.add(noseMesh);
  } else if (type === 'jerapah') {
    // Ossicones (horns)
    const hornGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8);
    const hornTopGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const hornL = new THREE.Mesh(hornGeo, matAccent);
    const hornTopL = new THREE.Mesh(hornTopGeo, matSecondary);
    hornTopL.position.y = 0.12;
    hornL.add(hornTopL);
    hornL.position.set(-0.12, 0.32, 0.05);
    hornL.rotation.z = 0.15;

    const hornR = hornL.clone();
    hornR.position.x = 0.12;
    hornR.rotation.z = -0.15;
    headGroup.add(hornL, hornR);

    // Snout
    const snoutGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.22, 10);
    snoutGeo.rotateX(-Math.PI / 2);
    const snoutMesh = new THREE.Mesh(snoutGeo, matSecondary);
    snoutMesh.position.set(0, -0.08, -0.28);
    headGroup.add(snoutMesh);
  } else if (type === 'kuda') {
    // Horse muzzle & mane
    const muzzleGeo = new THREE.BoxGeometry(0.2, 0.22, 0.28);
    const muzzle = new THREE.Mesh(muzzleGeo, matSecondary);
    muzzle.position.set(0, -0.06, -0.28);
    headGroup.add(muzzle);

    const maneGeo = new THREE.BoxGeometry(0.08, 0.45, 0.18);
    const mane = new THREE.Mesh(maneGeo, matAccent);
    mane.position.set(0, 0.18, 0.18);
    headGroup.add(mane);

    // Pointed ears
    const earGeo = new THREE.ConeGeometry(0.07, 0.18, 5);
    const earL = new THREE.Mesh(earGeo, matMain);
    earL.position.set(-0.14, 0.32, 0.05);
    earL.rotation.z = 0.2;
    const earR = earL.clone();
    earR.position.x = 0.14;
    earR.rotation.z = -0.2;
    headGroup.add(earL, earR);
  } else if (type === 'singa') {
    // Big lion mane encircling head
    const maneGeo = new THREE.TorusGeometry(0.38, 0.16, 10, 16);
    const maneMesh = new THREE.Mesh(maneGeo, matSecondary);
    maneMesh.position.set(0, 0, 0.05);
    maneMesh.castShadow = true;
    headGroup.add(maneMesh);

    // Muzzle
    const snoutGeo = new THREE.SphereGeometry(0.12, 10, 10);
    snoutGeo.scale(1.2, 0.9, 0.9);
    const snoutMesh = new THREE.Mesh(snoutGeo, matAccent);
    snoutMesh.position.set(0, -0.08, -0.26);
    headGroup.add(snoutMesh);
  } else if (type === 'harimau') {
    // Tiger snout
    const snoutGeo = new THREE.SphereGeometry(0.13, 10, 10);
    const snoutMesh = new THREE.Mesh(snoutGeo, matAccent);
    snoutMesh.position.set(0, -0.08, -0.26);
    headGroup.add(snoutMesh);

    // Round ears with dark inner
    const earGeo = new THREE.SphereGeometry(0.11, 8, 8);
    earGeo.scale(1, 0.9, 0.5);
    const earL = new THREE.Mesh(earGeo, matMain);
    const earR = new THREE.Mesh(earGeo, matMain);
    earL.position.set(-0.24, 0.22, 0);
    earR.position.set(0.24, 0.22, 0);
    headGroup.add(earL, earR);
  } else if (type === 'burung') {
    // Beak pointing forward (-Z)
    const beakGeo = new THREE.ConeGeometry(0.1, 0.26, 6);
    beakGeo.rotateX(-Math.PI / 2);
    const beakMesh = new THREE.Mesh(beakGeo, matSecondary);
    beakMesh.position.set(0, -0.02, -0.35);
    headGroup.add(beakMesh);

    // Crest on top of head
    const crestGeo = new THREE.ConeGeometry(0.08, 0.25, 4);
    const crestMesh = new THREE.Mesh(crestGeo, matAccent);
    crestMesh.position.set(0, 0.34, 0.08);
    crestMesh.rotation.x = 0.3;
    headGroup.add(crestMesh);
  } else if (type === 'monyet') {
    // Round protruding ears
    const earGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 10);
    earGeo.rotateZ(Math.PI / 2);
    const earL = new THREE.Mesh(earGeo, matSecondary);
    const earR = new THREE.Mesh(earGeo, matSecondary);
    earL.position.set(-0.35, 0.05, 0);
    earR.position.set(0.35, 0.05, 0);
    headGroup.add(earL, earR);

    // Muzzle
    const muzzleGeo = new THREE.SphereGeometry(0.16, 10, 10);
    muzzleGeo.scale(1.1, 0.8, 1);
    const muzzle = new THREE.Mesh(muzzleGeo, matSecondary);
    muzzle.position.set(0, -0.08, -0.22);
    headGroup.add(muzzle);
  } else if (type === 'babi') {
    // Pig big snout with nostrils facing front (-Z)
    const snoutGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.12, 12);
    snoutGeo.rotateX(-Math.PI / 2);
    const snout = new THREE.Mesh(snoutGeo, matSecondary);
    snout.position.set(0, -0.08, -0.32);

    const nostrilGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.06, 6);
    nostrilGeo.rotateX(-Math.PI / 2);
    const nostrilL = new THREE.Mesh(nostrilGeo, matAccent);
    const nostrilR = new THREE.Mesh(nostrilGeo, matAccent);
    nostrilL.position.set(-0.05, 0, -0.04);
    nostrilR.position.set(0.05, 0, -0.04);
    snout.add(nostrilL, nostrilR);
    headGroup.add(snout);

    // Floppy ears
    const earGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
    const earL = new THREE.Mesh(earGeo, matMain);
    earL.position.set(-0.2, 0.24, -0.05);
    earL.rotation.z = 0.5;
    earL.rotation.x = 0.3;
    const earR = earL.clone();
    earR.position.x = 0.2;
    earR.rotation.z = -0.5;
    headGroup.add(earL, earR);
  } else if (type === 'anjing') {
    // Dog muzzle & collar facing front (-Z)
    const muzzleGeo = new THREE.BoxGeometry(0.18, 0.16, 0.2);
    const muzzle = new THREE.Mesh(muzzleGeo, matSecondary);
    muzzle.position.set(0, -0.08, -0.28);
    const noseGeo = new THREE.SphereGeometry(0.05, 6, 6);
    const nose = new THREE.Mesh(noseGeo, matEyes);
    nose.position.set(0, 0.06, -0.1);
    muzzle.add(nose);
    headGroup.add(muzzle);

    // Floppy ears drooping down
    const earGeo = new THREE.CapsuleGeometry(0.08, 0.25, 6, 8);
    const earL = new THREE.Mesh(earGeo, matAccent);
    earL.position.set(-0.26, 0.05, 0);
    earL.rotation.z = 0.3;
    const earR = earL.clone();
    earR.position.x = 0.26;
    earR.rotation.z = -0.3;
    headGroup.add(earL, earR);

    // Red Collar
    const collarGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16);
    collarGeo.rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(collarGeo, matAccent);
    collar.position.set(0, -0.22, 0);
    headGroup.add(collar);
  } else if (type === 'kucing') {
    // Cat triangle pointy ears
    const earGeo = new THREE.ConeGeometry(0.11, 0.2, 4);
    const earL = new THREE.Mesh(earGeo, matMain);
    earL.position.set(-0.18, 0.26, 0);
    earL.rotation.z = 0.25;
    const earR = earL.clone();
    earR.position.x = 0.18;
    earR.rotation.z = -0.25;
    headGroup.add(earL, earR);

    // Cute nose & muzzle facing front (-Z)
    const noseGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const nose = new THREE.Mesh(noseGeo, matSecondary);
    nose.position.set(0, -0.06, -0.3);
    headGroup.add(nose);
  }

  // Limbs: Left & Right Arms/Paws
  const armGeo = new THREE.CapsuleGeometry(0.09, 0.32, 6, 8);
  const leftArm = new THREE.Mesh(armGeo, matMain);
  const rightArm = new THREE.Mesh(armGeo, matMain);
  leftArm.castShadow = true;
  rightArm.castShadow = true;

  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.38, 0.15, 0);
  leftArm.position.set(0, -0.15, 0);
  leftArmGroup.add(leftArm);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.38, 0.15, 0);
  rightArm.position.set(0, -0.15, 0);
  rightArmGroup.add(rightArm);

  bodyGroup.add(leftArmGroup, rightArmGroup);

  // Limbs: Left & Right Legs
  const legGeo = new THREE.CapsuleGeometry(0.11, 0.34, 6, 8);
  const leftLeg = new THREE.Mesh(legGeo, matMain);
  const rightLeg = new THREE.Mesh(legGeo, matMain);
  leftLeg.castShadow = true;
  rightLeg.castShadow = true;

  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.18, -0.22, 0);
  leftLeg.position.set(0, -0.16, 0);
  leftLegGroup.add(leftLeg);

  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.18, -0.22, 0);
  rightLeg.position.set(0, -0.16, 0);
  rightLegGroup.add(rightLeg);

  bodyGroup.add(leftLegGroup, rightLegGroup);

  // Tail (located at the back: +Z towards camera!)
  const tailGroup = new THREE.Group();
  tailGroup.position.set(0, -0.15, 0.26);
  if (type === 'kelinci') {
    const puffGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const puff = new THREE.Mesh(puffGeo, matSecondary);
    tailGroup.add(puff);
  } else if (type === 'babi') {
    const curlyGeo = new THREE.TorusGeometry(0.08, 0.03, 6, 12);
    const curly = new THREE.Mesh(curlyGeo, matMain);
    curly.position.set(0, 0, 0.06);
    tailGroup.add(curly);
  } else {
    const tailGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 6);
    tailGeo.rotateX(0.5);
    const tailMesh = new THREE.Mesh(tailGeo, matMain);
    tailMesh.position.set(0, 0.1, 0.12);
    tailGroup.add(tailMesh);
  }
  bodyGroup.add(tailGroup);

  // Contact shadow disk beneath character
  const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowDisk = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisk.position.y = 0.02;
  root.add(shadowDisk);

  // Animation controller
  root.updateAnimation = (runTime: number, isJumping: boolean, isSliding: boolean, isHit: boolean) => {
    // Hit flash / shake
    if (isHit) {
      bodyGroup.position.x = Math.sin(runTime * 40) * 0.12;
      bodyGroup.rotation.y = Math.sin(runTime * 20) * 0.3;
    } else {
      bodyGroup.position.x = 0;
      bodyGroup.rotation.y = 0;
    }

    if (isSliding) {
      // Sliding pose: squash & duck forward
      bodyGroup.scale.set(1.15, 0.45, 1.35);
      bodyGroup.position.y = 0.28;
      bodyGroup.rotation.x = -0.4;
      leftLegGroup.rotation.x = -1.2;
      rightLegGroup.rotation.x = -1.2;
      leftArmGroup.rotation.x = 1.0;
      rightArmGroup.rotation.x = 1.0;
      shadowDisk.scale.set(1.4, 1.4, 1.4);
      return;
    }

    // Normal scale
    bodyGroup.scale.set(1, 1, 1);
    bodyGroup.rotation.x = 0;

    if (isJumping) {
      // Jumping pose: arms reach up, legs tuck in
      bodyGroup.position.y = 0.65;
      leftLegGroup.rotation.x = 0.6;
      rightLegGroup.rotation.x = 0.6;
      leftArmGroup.rotation.x = -2.2;
      rightArmGroup.rotation.x = -2.2;
      tailGroup.rotation.x = 0.3;
      shadowDisk.scale.set(0.6, 0.6, 0.6);
    } else {
      // Running cycle
      const swing = Math.sin(runTime * 15) * 0.75;
      leftLegGroup.rotation.x = swing;
      rightLegGroup.rotation.x = -swing;
      leftArmGroup.rotation.x = -swing * 0.9;
      rightArmGroup.rotation.x = swing * 0.9;

      // Slight bounce
      bodyGroup.position.y = 0.55 + Math.abs(Math.sin(runTime * 15)) * 0.1;
      headGroup.rotation.y = Math.sin(runTime * 7.5) * 0.08;
      tailGroup.rotation.z = Math.sin(runTime * 15) * 0.3;
      shadowDisk.scale.set(1, 1, 1);

      if (earGroupL && earGroupR) {
        earGroupL.rotation.x = Math.sin(runTime * 15) * 0.15;
        earGroupR.rotation.x = -Math.sin(runTime * 15) * 0.15;
      }
    }
  };

  return root;
}
