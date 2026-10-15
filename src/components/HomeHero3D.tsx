import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AnimalType } from '../types/game';
import { AnimatedCharacterMesh, createAnimalCharacter } from '../game/characterBuilder';

interface HomeHero3DProps {
  selectedAnimal: AnimalType;
}

export const HomeHero3D: React.FC<HomeHero3DProps> = ({ selectedAnimal }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<AnimatedCharacterMesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Scene & Environment
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Camera: angled 3/4 perspective to admire the animal from front/side
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.2, 1.8, 3.8);
    camera.lookAt(0, 0.7, 0);

    // Lighting: Tropical jungle sun and emerald canopy bounce
    const hemiLight = new THREE.HemisphereLight(0xa7f3d0, 0x14532d, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfef08a, 1.7);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x34d399, 1.1);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Stage Platform (Pedestal disk with jungle moss stone and emerald glowing ring)
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const pedGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a29, // Jungle mossy stone
      roughness: 0.7,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedGeo, pedMat);
    pedestal.position.y = -0.125;
    pedestal.receiveShadow = true;
    stageGroup.add(pedestal);

    // Emerald Glowing Accent Ring
    const ringGeo = new THREE.TorusGeometry(1.62, 0.04, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    stageGroup.add(ring);

    // Floating Gold Coins around the stage
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    const coinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 16);
    coinGeo.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });

    const coins: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const c = new THREE.Mesh(coinGeo, coinMat);
      c.position.set(Math.cos(angle) * 1.8, 0.8 + Math.sin(i * 1.5) * 0.2, Math.sin(angle) * 1.8);
      c.castShadow = true;
      coinGroup.add(c);
      coins.push(c);
    }

    // Floating Emerald Mystery Gift Box
    const giftBoxGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const giftBoxMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const giftBox = new THREE.Mesh(giftBoxGeo, giftBoxMat);
    giftBox.position.set(-1.4, 1.2, -0.6);
    giftBox.castShadow = true;
    scene.add(giftBox);

    // Initial character
    const char = createAnimalCharacter(selectedAnimal);
    char.position.set(0, 0, 0);
    // On the showcase pedestal, turn the character slightly towards the camera (angle 3/4) so player sees front & details!
    char.rotation.y = 0.7;
    scene.add(char);
    characterRef.current = char;

    // Animation loop
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const time = clock.getElapsedTime();

      // Animate character running cycle on pedestal
      if (characterRef.current) {
        characterRef.current.updateAnimation(time, false, false, false);
      }

      // Slowly rotate platform & coins
      stageGroup.rotation.y = time * 0.2;
      coinGroup.rotation.y = -time * 0.4;
      coins.forEach((c, idx) => {
        c.rotation.z += dt * 3;
        c.position.y = 0.75 + Math.sin(time * 3 + idx) * 0.15;
      });

      // Animate floating mystery gift
      giftBox.rotation.y += dt * 1.5;
      giftBox.rotation.x += dt * 0.8;
      giftBox.position.y = 1.2 + Math.sin(time * 2.5) * 0.12;

      // Gentle camera sway
      camera.position.x = 2.2 + Math.sin(time * 0.5) * 0.3;
      camera.position.y = 1.8 + Math.cos(time * 0.4) * 0.15;
      camera.lookAt(0, 0.6, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(reqId);
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update character when user selects a different animal
  useEffect(() => {
    if (!sceneRef.current) return;
    if (characterRef.current) {
      sceneRef.current.remove(characterRef.current);
    }
    const newChar = createAnimalCharacter(selectedAnimal);
    newChar.position.set(0, 0, 0);
    newChar.rotation.y = 0.7; // Showcase angle
    sceneRef.current.add(newChar);
    characterRef.current = newChar;
  }, [selectedAnimal]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full min-h-[300px]" />
    </div>
  );
};
