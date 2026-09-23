'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Scene3DProps {
  accentColor?: string;
}

export default function InteractiveScene({ accentColor = '#ea580c' }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 26;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Ambient & Subtle Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(accentColor), 2.5, 60);
    pointLight.position.set(12, 12, 15);
    scene.add(pointLight);

    const softOrangeLight = new THREE.PointLight(0xfb923c, 1.5, 50);
    softOrangeLight.position.set(-12, -10, 10);
    scene.add(softOrangeLight);

    // 3. Floating Geometric Wireframes in Orange
    const group = new THREE.Group();
    scene.add(group);

    const torusGeometry = new THREE.TorusKnotGeometry(4.2, 1.1, 100, 20);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(accentColor),
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      roughness: 0.3,
    });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.position.set(14, 2, -6);
    group.add(torusKnot);

    const icoGeometry = new THREE.IcosahedronGeometry(2.6, 1);
    const icoMaterial = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
    icosahedron.position.set(-14, 8, -8);
    group.add(icosahedron);

    // 4. Floating Warm Orange Particles
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const primaryColor = new THREE.Color(accentColor);
    const warmAmberColor = new THREE.Color(0xf59e0b);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 85;
      positions[i + 1] = (Math.random() - 0.5) * 85;
      positions[i + 2] = (Math.random() - 0.5) * 55;

      const mixed = Math.random() > 0.4 ? primaryColor : warmAmberColor;
      colors[i] = mixed.r;
      colors[i + 1] = mixed.g;
      colors[i + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 5. Mouse and Scroll Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      torusKnot.rotation.x += 0.003;
      torusKnot.rotation.y += 0.005;

      icosahedron.rotation.x += 0.004;
      icosahedron.rotation.z += 0.005;

      particles.rotation.y = scrollY * 0.0004 + targetX * 0.15;
      particles.rotation.x = targetY * 0.15;

      const maxScroll = Math.max(
        document.body.scrollHeight - window.innerHeight,
        1
      );
      const scrollFraction = scrollY / maxScroll;

      camera.position.z = 26 - scrollFraction * 8;
      camera.position.x = targetX * 2 + Math.sin(scrollFraction * Math.PI) * 3;
      camera.position.y = -scrollFraction * 6 + targetY * 1.2;
      camera.lookAt(0, -scrollFraction * 3, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      torusGeometry.dispose();
      icoGeometry.dispose();
    };
  }, [accentColor]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}
