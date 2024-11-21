// src/components/VRMViewer.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const vertexShader = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vColor;

void main() {
    vUv = uv;
    vec3 newPosition = position + normal * u_intensity * sin(position.y * 10.0 + u_time);
    vDisplacement = sin(position.y * 10.0 + u_time);
    
    // Smoother gradient for sphere
    float mixValue = position.y * 0.5 + 0.5;  // normalize y position
    mixValue = smoothstep(0.0, 1.0, mixValue);
    vColor = mix(u_color1, u_color2, mixValue);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}`;

const fragmentShader = `
uniform float u_intensity;
uniform float u_time;
varying vec2 vUv;
varying float vDisplacement;
varying vec3 vColor;

void main() {
    float distort = 2.0 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time);
    vec3 finalColor = vColor * (1.0 + distort * 0.1);
    gl_FragColor = vec4(finalColor, 1.0);
}`;

const mixamoVRMRigMap = {
	mixamorigHips: 'hips',
	mixamorigSpine: 'spine',
	mixamorigSpine1: 'chest',
	mixamorigSpine2: 'upperChest',
	mixamorigNeck: 'neck',
	mixamorigHead: 'head',
	mixamorigLeftShoulder: 'leftShoulder',
	mixamorigLeftArm: 'leftUpperArm',
	mixamorigLeftForeArm: 'leftLowerArm',
	mixamorigLeftHand: 'leftHand',
	mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
	mixamorigLeftHandThumb2: 'leftThumbProximal',
	mixamorigLeftHandThumb3: 'leftThumbDistal',
	mixamorigLeftHandIndex1: 'leftIndexProximal',
	mixamorigLeftHandIndex2: 'leftIndexIntermediate',
	mixamorigLeftHandIndex3: 'leftIndexDistal',
	mixamorigLeftHandMiddle1: 'leftMiddleProximal',
	mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
	mixamorigLeftHandMiddle3: 'leftMiddleDistal',
	mixamorigLeftHandRing1: 'leftRingProximal',
	mixamorigLeftHandRing2: 'leftRingIntermediate',
	mixamorigLeftHandRing3: 'leftRingDistal',
	mixamorigLeftHandPinky1: 'leftLittleProximal',
	mixamorigLeftHandPinky2: 'leftLittleIntermediate',
	mixamorigLeftHandPinky3: 'leftLittleDistal',
	mixamorigRightShoulder: 'rightShoulder',
	mixamorigRightArm: 'rightUpperArm',
	mixamorigRightForeArm: 'rightLowerArm',
	mixamorigRightHand: 'rightHand',
	mixamorigRightHandPinky1: 'rightLittleProximal',
	mixamorigRightHandPinky2: 'rightLittleIntermediate',
	mixamorigRightHandPinky3: 'rightLittleDistal',
	mixamorigRightHandRing1: 'rightRingProximal',
	mixamorigRightHandRing2: 'rightRingIntermediate',
	mixamorigRightHandRing3: 'rightRingDistal',
	mixamorigRightHandMiddle1: 'rightMiddleProximal',
	mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
	mixamorigRightHandMiddle3: 'rightMiddleDistal',
	mixamorigRightHandIndex1: 'rightIndexProximal',
	mixamorigRightHandIndex2: 'rightIndexIntermediate',
	mixamorigRightHandIndex3: 'rightIndexDistal',
	mixamorigRightHandThumb1: 'rightThumbMetacarpal',
	mixamorigRightHandThumb2: 'rightThumbProximal',
	mixamorigRightHandThumb3: 'rightThumbDistal',
	mixamorigLeftUpLeg: 'leftUpperLeg',
	mixamorigLeftLeg: 'leftLowerLeg',
	mixamorigLeftFoot: 'leftFoot',
	mixamorigLeftToeBase: 'leftToes',
	mixamorigRightUpLeg: 'rightUpperLeg',
	mixamorigRightLeg: 'rightLowerLeg',
	mixamorigRightFoot: 'rightFoot',
	mixamorigRightToeBase: 'rightToes',
};


async function loadMixamoAnimation(url, vrm) {
	const loader = new FBXLoader();
	const asset = await loader.loadAsync(url);
	const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com');
	const tracks = [];
  
	const restRotationInverse = new THREE.Quaternion();
	const parentRestWorldRotation = new THREE.Quaternion();
	const _quatA = new THREE.Quaternion();
	const _vec3 = new THREE.Vector3();
  
	// Get hips height
	const motionHipsHeight = asset.getObjectByName('mixamorigHips').position.y;
	const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y;
	const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
	const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
	const hipsPositionScale = vrmHipsHeight / motionHipsHeight;
  
	clip.tracks.forEach((track) => {
	  const trackSplitted = track.name.split('.');
	  const mixamoRigName = trackSplitted[0];
	  const vrmBoneName = mixamoVRMRigMap[mixamoRigName];
	  const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name;
	  const mixamoRigNode = asset.getObjectByName(mixamoRigName);
  
	  if (vrmNodeName != null) {
		const propertyName = trackSplitted[1];
  
		// Store rotations of rest-pose
		mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
		mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation);
  
		if (track instanceof THREE.QuaternionKeyframeTrack) {
		  for (let i = 0; i < track.values.length; i += 4) {
			const flatQuaternion = track.values.slice(i, i + 4);
			_quatA.fromArray(flatQuaternion);
			_quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse);
			_quatA.toArray(flatQuaternion);
			flatQuaternion.forEach((v, index) => {
			  track.values[index + i] = v;
			});
		  }
  
		  tracks.push(
			new THREE.QuaternionKeyframeTrack(
			  `${vrmNodeName}.${propertyName}`,
			  track.times,
			  track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v)),
			),
		  );
		} else if (track instanceof THREE.VectorKeyframeTrack) {
		  const value = track.values.map((v, i) => 
			(vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale
		  );
		  tracks.push(new THREE.VectorKeyframeTrack(
			`${vrmNodeName}.${propertyName}`, 
			track.times, 
			value
		  ));
		}
	  }
	});
  
	return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks);
  }
  
  export const VRMViewer = ({ url, animationUrl }) => {
	const canvasRef = useRef();
	const sceneRef = useRef();
	const rendererRef = useRef();
	const cameraRef = useRef();
	const mixerRef = useRef();
	const vrmRef = useRef();
	const controlsRef = useRef();
	const clockRef = useRef(new THREE.Clock());
	const uniformsRef = useRef({
		u_intensity: { value: 0.5 },
		u_time: { value: 0 },
		u_color1: { value: new THREE.Color("#876eac") },
		u_color2: { value: new THREE.Color("#4adbb7") }
	  });
			
	  useEffect(() => {
		if (!url) return;
	
		const canvas = canvasRef.current;
		const renderer = new THREE.WebGLRenderer({ 
		  canvas, 
		  alpha: true,
		  antialias: true
		});
		
		renderer.setPixelRatio(window.devicePixelRatio);
		rendererRef.current = renderer;
	
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(30.0, canvas.clientWidth / canvas.clientHeight, 0.1, 20.0);
		cameraRef.current = camera;
		camera.position.set(0.0, 0.1, 3.5);
		
		// Add lights
		scene.add(new THREE.AmbientLight(0xffffff, 0.8));
		scene.add(new THREE.DirectionalLight(0xffffff, 0.5));
		sceneRef.current = scene;
	
		    // Add OrbitControls
			const controls = new OrbitControls(camera, canvas);
			controls.enableDamping = true;
			controls.dampingFactor = 0.05;
			controls.maxPolarAngle = Math.PI / 2.2; // Restrict downward rotation
			controls.minPolarAngle = Math.PI / 3;   // Restrict upward rotation
			controls.enableZoom = false;            // Disable zoom
			controls.enablePan = false;             // Disable panning
			controlsRef.current = controls;

    // Replace plane with sphere
    const bgGeometry = new THREE.SphereGeometry(10, 32, 32);
    const bgMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      side: THREE.BackSide  // Render inside of sphere
    });
    const background = new THREE.Mesh(bgGeometry, bgMaterial);
    background.position.set(0, 0, 0);
    scene.add(background);

		// Add floor
		const floorGeometry = new THREE.PlaneGeometry(10, 10);
		const floorMaterial = new THREE.MeshStandardMaterial({ 
		  color: 0x6816cc,
		  metalness: 0.5,
		  roughness: 0.5
		});
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -0.805;
		scene.add(floor);

		const handleResize = () => {
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		if (canvas.width !== width || canvas.height !== height) {
		  renderer.setSize(width, height, false);
		  camera.aspect = width / height;
		  camera.updateProjectionMatrix();
		}
	  };
  
	  handleResize();
	  window.addEventListener('resize', handleResize);
  
	  const loader = new GLTFLoader();
	  loader.register((parser) => new VRMLoaderPlugin(parser));
  
	  loader.load(url, async (gltf) => {
		const vrm = gltf.userData.vrm;
		vrmRef.current = vrm;
		scene.add(vrm.scene);
		
		vrm.humanoid.resetPose();
		VRMUtils.rotateVRM0(vrm);

		  // Add smile expression
		  if (vrm.expressionManager) {
			vrm.expressionManager.setValue('happy', 0.6); // Adjust value between 0-1 for intensity
		  }
		
		
  
		const box = new THREE.Box3().setFromObject(vrm.scene);
		const center = box.getCenter(new THREE.Vector3());
		vrm.scene.position.sub(center);
  
		if (animationUrl) {
		  try {
			const clip = await loadMixamoAnimation(animationUrl, vrm);
			const mixer = new THREE.AnimationMixer(vrm.scene);
			mixerRef.current = mixer;
			mixer.clipAction(clip).play();
		  } catch (error) {
			console.error('Failed to load animation:', error);
		  }
		}
	  });
  
	  const animate = () => {
		requestAnimationFrame(animate);
		
		// Update controls
		controlsRef.current.update();
		
		// Update uniforms and mixers
		uniformsRef.current.u_time.value += 0.01;
		if (mixerRef.current) {
		  mixerRef.current.update(clockRef.current.getDelta());
		}
		if (vrmRef.current) {
		  vrmRef.current.update(clockRef.current.getDelta());
		}
		
		renderer.render(scene, camera);
	  };

	  animate();
  
	  return () => {
		window.removeEventListener('resize', handleResize);
		controlsRef.current.dispose();
		scene.clear();
		renderer.dispose();
		if (mixerRef.current) mixerRef.current.stopAllAction();
	  };
	  }, [url, animationUrl]);
  
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
  