// src/components/VRMViewer.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export const VRMViewer = ({ url }) => {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const rendererRef = useRef();
  const cameraRef = useRef();
  
  useEffect(() => {
    if (!url) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: true // Enable antialiasing
    });
    
    // Handle device pixel ratio
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30.0, canvas.clientWidth / canvas.clientHeight, 0.1, 20.0);
    cameraRef.current = camera;
    
    camera.position.set(0.0, 0.2, 5.0);
    
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    sceneRef.current = scene;

    // Handle resize
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    };

    // Initial size setup
    handleResize();
    window.addEventListener('resize', handleResize);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(url, (gltf) => {
      const vrm = gltf.userData.vrm;
      scene.add(vrm.scene);
      
      // Reset to T-pose
      vrm.humanoid.resetPose();
      // rotate 180
      VRMUtils.rotateVRM0(vrm);

      // Center the model
      const box = new THREE.Box3().setFromObject(vrm.scene);
      const center = box.getCenter(new THREE.Vector3());
      vrm.scene.position.sub(center);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      handleResize(); // Check size on each frame
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.clear();
      renderer.dispose();
    };
  }, [url]);

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '400px',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};