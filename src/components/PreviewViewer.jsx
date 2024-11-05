import React, { useRef, useEffect, useState, Suspense, use } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import Skybox from './skybox';
import { ACESFilmicToneMapping } from 'three';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader';
const isSafari = typeof window !== 'undefined' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false;

function Model({ handleCanvasLoaded, assetCameraSettings, url, setCanvasSnapshot, setCameraSettings, cameraSettings, selectedAssetCameraSettings, onSetThumbDataFormat, canvasSnapshot}) {
  const [model, setModel] = useState(null);
  const { clock, camera, gl, scene } = useThree();
  const orbitRef = useRef();
  function mouseUp() {
	captureCanvasSnapshot();
	}
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('pointerup', mouseUp, false);
			return () => {
				window.removeEventListener('pointerup', mouseUp, false);
			};
		}
	}, []);

	useEffect(() => {
		captureCanvasSnapshot();
	}, [model]);
	
	const captureCanvasSnapshot = () => {
		gl.render(scene, camera);
		gl.toneMapping = ACESFilmicToneMapping;
		gl.toneMappingExposure = 0.84;
	
		const canvas = gl.domElement;
		const resizedCanvas = document.createElement('canvas');
		const resizedContext = resizedCanvas.getContext('2d');
	
		const thumbnailWidth = 1024;
		const thumbnailHeight = 1024;
	
		resizedCanvas.width = thumbnailWidth;
		resizedCanvas.height = thumbnailHeight;
	
		resizedContext.drawImage(canvas, 0, 0, thumbnailWidth, thumbnailHeight);
	
		if (isSafari) {
		resizedCanvas.toBlob((blob) => {
			const reader = new FileReader();
			reader.onloadend = () => {
			const base64data = reader.result;
			// remove data:image/png;base64,
			// @ts-ignore
			const base64dataWithoutPrefix = base64data.split(',')[1];
			setCanvasSnapshot(base64dataWithoutPrefix);
			onSetThumbDataFormat('image/jpg');
			};
			reader.readAsDataURL(blob);
		}, 'image/jpeg', 0.70);
		} else {
		resizedCanvas.toBlob((blob) => {
			const reader = new FileReader();
			reader.onloadend = () => {
			const base64data = reader.result;
			//@ts-ignore
			const base64dataWithoutPrefix = base64data.split(',')[1];
			setCanvasSnapshot(base64dataWithoutPrefix);
			onSetThumbDataFormat('image/webp');
			};
			reader.readAsDataURL(blob);
		}, 'image/webp', 0.96);
		}
	};

  useEffect(() => {
	if (selectedAssetCameraSettings) {
		const cameraSettings = JSON.parse(selectedAssetCameraSettings);
	  setCameraSettings(cameraSettings);
	  camera.position.set(cameraSettings.position.x, cameraSettings.position.y, cameraSettings.position.z);
	  camera.zoom = cameraSettings.zoom;
	  camera.rotation.set(cameraSettings.rotation.x, cameraSettings.rotation.y, cameraSettings.rotation.z);
	}
  }, [selectedAssetCameraSettings]);

  useEffect(() => {
    const loadModel = async () => {
      const loader = new GLTFLoader();
      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath("/utils/basis/");
      ktx2Loader.detectSupport(gl);
      loader.setKTX2Loader(ktx2Loader);
      const dracoLoader = new DRACOLoader();
	  const usdzLoader = new USDZLoader();
      dracoLoader.setDecoderPath("/utils/draco/");
      dracoLoader.setDecoderConfig({ type: 'js' });
      loader.setDRACOLoader(dracoLoader);

	  if(url.split(/[#?]/)[0].split('.').pop().trim() === "usdz") {
			usdzLoader.load( url, function ( usd ) {
				setModel(usd);
			} );
			handleCanvasLoaded();
	   } else {
			const loadedModel = await loader.loadAsync(url);
			setModel(loadedModel);
			handleCanvasLoaded();
	   }
    };
    loadModel();
  }, [url, gl]);

  useEffect(() => {
    if (model?.scene) {
      model.scene.traverse((obj) => {
        obj.frustumCulled = false;
        if (obj.isMesh) {
          obj.castShadow = true;
        }
      });
    } else if (model) {
	  model.traverse((obj) => {
		obj.frustumCulled = false;
		if (obj.isMesh) {
		  obj.castShadow = true;
		}
	  });
	}
  }, [model]);

  if (model) {
    return (
		<>
		<OrbitControls
		ref={orbitRef}
		enableZoom={true}
		enablePan={true}
		enableDamping={true}
		dampingFactor={0.2}
		onEnd={() => {
		  setCameraSettings(
			  {
				  // @ts-ignore
				  target: orbitRef.current.target,
				  position: camera.position,
				  zoom: camera.zoom,
				  rotation: camera.rotation,
			  }
		  );
		}}
		  target={cameraSettings?.target ? ([cameraSettings.target.x , cameraSettings.target.y, cameraSettings.target.z]) : [0, 0, 0]}
	  />
	<primitive object={model?.scene ? model.scene : model} position={[0, -0.8, 0]} scale={[1, 1, 1]} shadows />
	</>
	);
  }

  return null;
}


export default PreviewViewer = ({ url, thumburl, background, backgroundColor, backgroundColor2, canvasSnapshot, setCanvasSnapshot, assetName, selectedAssetCameraSettings }) => {
	// "selectedAssetCameraSettings": "{\"position\":{\"x\":0,\"y\":3.061616997868383e-16,\"z\":5},\"zoom\":3.5,\"azimuthalAngle\":-0.5589602285523705,\"polarAngle\":1.2372747085201616}"
  const orbitRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [thumbFormat, setThumbFormat] = useState('image/jpg');
  const [assetCameraSettings, setCameraSettings] = useState(null);
  const cameraSettings = JSON.parse(selectedAssetCameraSettings);
  let backgroundSettings = {};
  // if background is  a string json parse
  if (background && typeof background === 'string') {
	backgroundSettings = JSON.parse(background);
  } else {
	backgroundSettings = background;
  }
  useEffect(() => {
	setShowPreview(false);
	setLoading(true);
  }, [url]);

  const handlePreviewClick = () => {
	console.log("show preview", loading);
    setShowPreview(true);
  };

  const handleCanvasLoaded = () => {
    setLoading(false);
  };


  if (!url) {
    return null; // or render a placeholder or loading state
  }

  const handleThumbnailUpload = async () => {
	const token = localStorage.getItem('access_token');
	const base64Thumbnail = canvasSnapshot;
  
	try {
	  const response = await fetch( ( process.env.NEXT_PUBLIC_CFDB_WORKER + '/upload-thumbnail' ), {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		  },
	    body: JSON.stringify({
		  fileData: base64Thumbnail,
		  fileName: assetName,
		  selectedAssetCameraSettings: JSON.stringify(assetCameraSettings)
		}),
	  });
  
	  if (response.ok) {
		console.log('Thumbnail uploaded successfully');
		// Refresh the asset or perform any necessary actions
	  } else {
		console.error('Failed to upload thumbnail');
	  }
	} catch (error) {
	  console.error('Error uploading thumbnail:', error);
	}
  };
  
  
  return (
    <div
      className="mb-0 m-auto margin-auto w-100 shadow-xl"
      style={{
        width: '350px',
        height: '350px !important',
		borderRadius: '10px',
		backgroundImage: thumburl ? `url(${thumburl})` : 'none',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
        position: 'relative',
        top: 0,
        left: 0,
      }}
    >
	  <Suspense fallback={
					<div
					style={{
					  display: 'flex',
					  justifyContent: 'center',
					  alignItems: 'center',
					  width: '350px',
					  height: '350px',
					  minHeight: '350px',
					  borderRadius: '10px',
					  backgroundColor: '#000000',
					  backgroundImage: thumburl ? `url(${thumburl})` : 'none',
					  backgroundSize: 'cover',
					  backgroundPosition: 'center',
					  color: '#ffffff',
					  cursor: 'pointer',
					}}
					className={"shadow-xl"}
				  >
					<button 
						className={
							(`text-sm text-white px-3 py-2 rounded-full shadow-xl`)
							}
						style={
							//@ts-ignore
							backgroundSettings.backgroundColor ?
							// @ts-ignore
								{ backgroundImage: `linear-gradient(45deg, ${backgroundSettings.backgroundColor + 'd4'}, ${backgroundSettings.backgroundColor2 + 'd4'} 100%)` }: 
								{ backgroundColor: "#000000" }
						}
					>
						<p>Loading...</p>
					</button>
					</div>	
	  }>
      {!showPreview ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '350px',
			height: '350px',
            minHeight: '350px',
			borderRadius: '10px',
            backgroundColor: '#000000',
			backgroundImage: thumburl ? `url(${thumburl})` : 'none',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
            color: '#ffffff',
            cursor: 'pointer',
          }}
		  className={"shadow-xl"}
          onClick={handlePreviewClick}
        >
			<button 
				className={
					(`text-sm text-white px-3 py-2 rounded-full shadow-xl`)
					}
				onClick={handlePreviewClick}
				style={
					//@ts-ignore
					backgroundSettings.backgroundColor ?
					// @ts-ignore
						{ backgroundImage: `linear-gradient(45deg, ${backgroundSettings.backgroundColor + 'd4'}, ${backgroundSettings.backgroundColor2 + 'd4'} 100%)` }: 
						{ backgroundColor: "#000000" }
				}
			>
				<p
				// style={{mixBlendMode: 'difference'}}
				>
				Preview</p>
			</button>
        </div>
      ) : (
			<Canvas
				key={url}
				style={{
					position: 'relative',
					top: 0,
					left: 0,
					width: '100%',
					minHeight: '350px',
					height: '350px',
				}}
				dpr={2}
				resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
				camera={{ zoom: 3.5 }}
				className=""
			>        
				{/* <color attach="background" args={[backgroundColor]} /> */}
				{/* @ts-ignore */}
				<Skybox
					//@ts-ignore
					colors={[backgroundSettings.backgroundColor ? backgroundSettings.backgroundColor : "#ffffff", backgroundSettings.backgroundColor2 ? backgroundSettings.backgroundColor2 : "#000000"]}
					//@ts-ignore
					gradientCenter={ backgroundSettings.gradientCenter ? backgroundSettings.gradientCenter : 0.5 }  />

				<Stars
				radius={100}
				depth={50}
				count={100}
				factor={4}
				saturation={0}
				fade
				/>
				<ambientLight intensity={0.8} />
				<pointLight position={[0, 3, -1]} color="#ffffff" intensity={0.8} />
				<Model url={url}
				handleCanvasLoaded={handleCanvasLoaded}
				cameraSettings={cameraSettings}
				assetCameraSettings={assetCameraSettings}
				onSetThumbDataFormat={setThumbFormat}
				selectedAssetCameraSettings={selectedAssetCameraSettings}
				setCanvasSnapshot={setCanvasSnapshot}
				setCameraSettings={setCameraSettings}
				canvasSnapshot={canvasSnapshot} />
				<Environment preset="city" />
			</Canvas>
	  )}
	  </Suspense>
	  { showPreview && (
		<button
			onClick={handleThumbnailUpload}
			className="absolute mt-10 -bottom-[45px] right-0 m-4 px-2 p-1 text-xs text-black bg-neonpink-500 hover:bg-neonpink-400 rounded-full"
		>
			<p className="text-xs">Save Thumbnail</p>
		</button>
	  )}
    </div>
  );
};
