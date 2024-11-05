'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { USDZLoader } from 'three/examples/jsm/loaders/USDZLoader';
import { Object3D, ACESFilmicToneMapping, Color, WebGLRenderTarget, PerspectiveCamera } from 'three';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, Backdrop, GradientTexture } from '@react-three/drei';
import init from '../utils/wasm/rusted_gltf_transform.js';
import generate_report from '../utils/wasm/rusted_gltf_transform.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier';
// import { KtxDecoder } from './ktx_decoder';
import { HexColorPicker } from "react-colorful";
import Skybox from './skybox';
import * as Switch from '@radix-ui/react-switch';

const isSafari = typeof window !== 'undefined' ? /^((?!chrome|android).)*safari/i.test(navigator.userAgent) : false;

const handleGenerateReport = async (file) => {
	if (file) {
	  try {
		await init();
		const fileData = atob(file);
		const arrayBuffer = new ArrayBuffer(fileData.length);

		// const fileData = file;
		const optimizedDocument = new Uint8Array(arrayBuffer);
		for (let i = 0; i < fileData.length; i++) {
			optimizedDocument[i] = fileData.charCodeAt(i);
		}
		// console.log("document processing", optimizedDocument);
		const report = await generate_report(new Uint8Array(optimizedDocument));
		console.log('Report:', report);
	  } catch (error) {
		console.error('Error generating report:', error);
	  }
	}
};

function OptimizedObject(props) {
	const { gl, scene, camera } = useThree();
	const [gltf, setGltf] = useState(null);
	const orbitRef = useRef();
	useEffect(() => {
		const loadModel = async () => {
			const loader = new GLTFLoader();
			const ktx2Loader = new KTX2Loader();
			ktx2Loader.setTranscoderPath('/utils/basis/');
			ktx2Loader.detectSupport(gl);
			loader.setKTX2Loader(ktx2Loader);
			const dracoLoader = new DRACOLoader();
			const usdzLoader = new USDZLoader();
			dracoLoader.setDecoderPath('/utils/draco/');
			dracoLoader.setDecoderConfig({ type: 'js' });
			loader.setDRACOLoader(dracoLoader);

			let url;

			if (props.optimizedData) {

				// props.optimized data is
				// data:application/octet-stream;base64,Z2xURgIAAADMfiQAeJUCAEpTT057ImFzc2V0Ijp7ImdlbmVyYXRvciI6ImdsVEYtVHJhbnNmb3JtIHYzLjEwLjEiLCJ2ZXJzaW9uIjoiMi4wIiwiZXh0ZW5zaW9ucyI6eyJLSFJfeG1wX2pzb25fbGQiOnsicG
				// convert it to a blob
				const binaryData = atob(props.optimizedData);
				const arrayBuffer = new ArrayBuffer(binaryData.length);
				// props.onSetSelectedAssetOriginalSize(arrayBuffer.byteLength);

				const uint8Array = new Uint8Array(arrayBuffer);
				for (let i = 0; i < binaryData.length; i++) {
					uint8Array[i] = binaryData.charCodeAt(i);
				}
				handleGenerateReport(props.optimizedData);

				const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
				url = URL.createObjectURL(blob);
			} else {
				const binaryData = atob(props.data);
				const arrayBuffer = new ArrayBuffer(binaryData.length);
				// props.onSetSelectedAssetOriginalSize(arrayBuffer.byteLength);

				const uint8Array = new Uint8Array(arrayBuffer);

				for (let i = 0; i < binaryData.length; i++) {
					uint8Array[i] = binaryData.charCodeAt(i);
				}
				handleGenerateReport(props.data);

				const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
				url = URL.createObjectURL(blob);
			}

			let model;

			if (props.selectedAssetFilename.split(/[#?]/)[0].split('.').pop().trim() === "usdz") {
				model = usdzLoader.load(url, function (usd) {
					setGltf(usd);

				});


			} else {
				model = await loader.loadAsync(url);
				setGltf(model);
			}
			URL.revokeObjectURL(url);

			let vertexCount = 0;
			let polygonCount = 0;
			if (!model) {
				console.log('Model is undefined');
				return;
			}
			const xmpLoadedData = model?.userData.gltfExtensions?.KHR_xmp_json_ld?.packets[model?.asset?.extensions?.KHR_xmp_json_ld.packet] ?? model.asset.extensions?.KHR_xmp_json_ld?.packets[model.asset.extensions?.KHR_xmp_json_ld.packet] ?? null;
			if (xmpLoadedData) {
				props.setXmpFields(xmpLoadedData);
			}

			console.log(xmpLoadedData, 'xmpLoadedData', model);
			if (model?.scene) {
				vertexCount = model.scene.children.reduce((acc, child) => {
					// @ts-ignore
					if (child.isMesh) {
						// @ts-ignore
						acc += child.geometry.attributes.position.count;
					}
					return acc;
				}, 0);
			} else {
				console.log(model, 'no scene');
				vertexCount = model.children.reduce((acc, child) => {
					// @ts-ignore
					if (child.isMesh) {
						// @ts-ignore
						acc += child.geometry.attributes.position.count;
					}
					return acc;
				}, 0);
			}


			polygonCount = vertexCount / 3;

			props.onCountsCalculated(vertexCount, polygonCount);
		};
		loadModel();
	}, [props.data, props.optimizedData]);

	function mouseUp() {
		captureCanvasSnapshot();
	}

	useEffect(() => {
		window.addEventListener('pointerup', mouseUp, false);
		return () => {
			window.removeEventListener('pointerup', mouseUp, false);
		};
	}, []);

	useEffect(() => {
		captureCanvasSnapshot();
	}, [props.backgroundColor, gltf]);

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
					props.onCaptureCanvasSnapshot(base64data);
					props.onSetThumbDataFormat('image/jpg');
				};
				reader.readAsDataURL(blob);
			}, 'image/jpeg', 0.70);
		} else {
			resizedCanvas.toBlob((blob) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					const base64data = reader.result;
					props.onCaptureCanvasSnapshot(base64data);
					props.onSetThumbDataFormat('image/webp');
				};
				reader.readAsDataURL(blob);
			}, 'image/webp', 0.96);
		}
	};

	useEffect(() => {
		if (gltf?.scene) {
			gltf.scene.traverse((obj) => {
				obj.frustumCulled = false;
				if (obj.isMesh) {
					obj.castShadow = true;
				}
			});
		}
	}, [gltf]);

	if (gltf) {
		return (<>
			<primitive object={gltf.scene ? gltf.scene : gltf} position={[0, -0.8, 0]} scale={[1, 1, 1]} shadows />
			<OrbitControls
				ref={orbitRef}
				enableZoom={true}
				enablePan={true}
				enableDamping={true}
				dampingFactor={0.4}
				// @ts-ignore
				onUpdate={(e) => {
					// @ts-ignore
					orbitRef.current?.update();
				}}
				onEnd={() => {
					// @ts-ignore
					if (!orbitRef.current || !orbitRef.current.position0) return;
					props.onSetSelectedAssetCameraSettings({
						// @ts-ignore
						target: orbitRef.current.target,
						position: camera.position,
						zoom: camera.zoom,
						rotation: camera.rotation,
					});
				}}
			/>

		</>);
	}

	return null;
}

const UploadAsset = ({
	data,
	optimizedData,
	onCompressedGltfReady,
	onCaptureCanvasSnapshot,
	setSelectedAssetData,
	onSetColor,
	onSetColor2,
	backgroundColor,
	backgroundColor2,
	gradientCenter,
	onSetGradientCenter,
	onSetAssetTags,
	selectedAssetOriginalSize,
	onSetSelectedAssetOriginalSize,
	onSetSelectedAsssetOptimizedSize,
	newSize,
	onSetXMP,
	xmp,
	onSetTextureCompress,
	textureCompress,
	onSetXMPData,
	onSetAuthor,
	selectedAssetFilename,
	author,
	onClassifyImage,
	canvasSnapshot,
	selectedAssetTags,
	onSetThumbDataFormat,
	onSetCategories,
	selectedCategories,
	categories,
	setShowCategoryModal,
	onSetSelectedAssetCameraSettings,
	onSetTextureCompressionType,
	onSetTextureCompressionSize,
	handleGenerateReport,
}) => {
	const orbitRef = useRef();
	const [polyCount, setPolyCount] = useState(0.5);
	const [textureQuality, setTextureQuality] = useState(0.8);
	const [textureFormat, setTextureFormat] = useState('png');
	const [vertexCount, setVertexCount] = useState(0);
	const [polygonCount, setPolygonCount] = useState(0);
	const [isGeneratingTags, setIsGeneratingTags] = useState(false);
	const [xmpData, setXMPData] = useState({"@context": {"dc":"http://purl.org/dc/elements/1.1/"}});
	const canvasRef = useRef();
	const [inputValue, setInputValue] = useState(Array.isArray(selectedCategories) ? selectedCategories.join(', ') : '');
	const handleCountsCalculated = (vCount, pCount) => {
		setVertexCount(vCount);
		setPolygonCount(pCount);
	};
	const [xmpFields, setXmpFields] = useState(xmpData);
	const [ onCountsCalculated ] = useState(handleCountsCalculated);


	useEffect(() => {
		setXMPData(xmpFields);
	}, [xmpFields]);



	const renderXmpFields = (obj, path = '') => {
		return Object.entries(obj).map(([key, value], index) => {
			const currentPath = path ? `${path}.${index}` : index.toString();
			const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value;

			return (
				<div key={currentPath} className="flex gap-2">
					<input
						type="text"
						placeholder="Key"
						value={key}
						onChange={(e) => handleXmpFieldChange(currentPath, 'key', e.target.value)}
						className="p-2 pl-3 text-black text-sm w-1/2 my-2 rounded-2xl"
					/>
					<input
						type="text"
						placeholder="Value"
						//@ts-ignore
						value={stringifiedValue}
						onChange={(e) => handleXmpFieldChange(currentPath, 'value', e.target.value)}
						className="p-2 pl-2 text-black text-sm w-1/2 my-2 rounded-2xl"
					/>
					<button
						onClick={() => handleRemoveXmpField(currentPath)}
						className="text-red-500"
					>
						Remove
					</button>
				</div>
			);
		});
	};

	const handleXmpFieldChange = (path, field, value) => {
		setXmpFields((prevFields) => {
			const newFields = Array.isArray(prevFields) ? [...prevFields] : Object.entries(prevFields);
			const pathArray = path.split('.');
			const index = parseInt(pathArray[pathArray.length - 1]);

			if (field === 'key') {
				newFields[index][0] = value;
			} else {
				try {
					newFields[index][1] = JSON.parse(value);
				} catch (error) {
					newFields[index][1] = value;
				}
			}

			return Object.fromEntries(newFields);
		});
	};

	const handleAddXmpField = () => {
		setXmpFields((prevFields) => {
			const newFields = Array.isArray(prevFields) ? [...prevFields] : Object.entries(prevFields);
			return Object.fromEntries([...newFields, ['', '']]);
		});
	};

	const handleRemoveXmpField = (path) => {
		setXmpFields((prevFields) => {
			const newFields = Array.isArray(prevFields) ? [...prevFields] : Object.entries(prevFields);
			const pathArray = path.split('.');
			const index = parseInt(pathArray[pathArray.length - 1]);
			newFields.splice(index, 1);
			return Object.fromEntries(newFields);
		});
	};

	const [textureCompressDimensions, setTextureCompressDimensions] = useState({ width: 1024, height: 1024 });
	const handleCategorySelect = (category) => {
		onSetCategories((prevSelectedCategories) => {
			if (prevSelectedCategories.includes(category)) {
				return prevSelectedCategories.filter((c) => c !== category);
			} else {
				return [...prevSelectedCategories, category];
			}
		});
	};

	return (
		<div
			className="mb-2 margin-auto w-100"
			style={{
				height: '550px !important',
				position: 'relative',
				top: 0,
				left: 0,
			}}
		>
			<div className="w-100">
				<div className='m-2 mb-6 lg:m-8 flex flex justify-center'>
					<div className="w-[350px] h-[350px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px]">
						<Suspense
							fallback={
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										width: '100%',
										minHeight: '350px',
										backgroundColor: '#000000',
										color: '#ffffff',
									}} />
							}
						>

							<Canvas
								style={{
									position: 'relative',
									top: 0,
									left: 0,
									width: '100%',
									height: '100%',
								}}
								ref={canvasRef}
								dpr={2}
								gl={{
									preserveDrawingBuffer: true,
								}}
								resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
								camera={{
									zoom: 3.5,
									far: 1500,
								}}
							>
								<Skybox colors={[backgroundColor, backgroundColor2]} gradientCenter={gradientCenter} />
								<ambientLight intensity={1} />
								<pointLight position={[0, 3, -1]} color={0xffffff} intensity={1} />
								<OptimizedObject
									data={data}
									optimizedData={optimizedData}
									selectedAssetFilename={selectedAssetFilename}
									filename={data.name}
									polyCount={polyCount}
									textureQuality={textureQuality}
									setSelectedAssetData={setSelectedAssetData}
									textureFormat={textureFormat}
									onCountsCalculated={onCountsCalculated}
									onCaptureCanvasSnapshot={onCaptureCanvasSnapshot}
									onSetSelectedAsssetOptimizedSize={onSetSelectedAsssetOptimizedSize}
									onSetThumbDataFormat={onSetThumbDataFormat}
									backgroundColor={backgroundColor}
									backgroundColor2={backgroundColor2}
									handleGenerateReport={handleGenerateReport}
									setXmpFields={setXmpFields}
									onSetXMPData={setXMPData}
									xmpData={xmpData}
									onSetSelectedAssetOriginalSize={onSetSelectedAssetOriginalSize}
									onSetSelectedAssetCameraSettings={onSetSelectedAssetCameraSettings}
								/>
								{/* <Environment preset="city" /> */}
							</Canvas>
						</Suspense>
					</div>
				</div>
				<div className='lg:-mt-0 sm:mt-2 ml-8 '>
					<div className="flex flex-row gap-8 flex items-center justify-center">
						<HexColorPicker color={backgroundColor} onChange={onSetColor} />
						<HexColorPicker color={backgroundColor2} onChange={onSetColor2} />
					</div>
					<div className="mt-4 items-center flex justify-center">
						<label className="mr-2 text-sm">Gradient Center</label>
						<input
							type="range"
							min="0.0002"
							max="1"
							step="0.001"
							value={gradientCenter}
							onChange={(e) => onSetGradientCenter(parseFloat(e.target.value))}
						/>
					</div>
				</div>
				<div className="mb-8">
					<div className="m-4 optimization-controls">
						<div className="p-4 p-8 flex justify-center items-center">
							<div className="p-4 items-center flex">
								<label htmlFor="textureCompress">Compress Textures</label>
								<Switch.Root
									checked={textureCompress}
									onCheckedChange={(e) => {
										onSetTextureCompress(!textureCompress);
									}}
									className="SwitchRoot ml-2"
									id="texture-compress"
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>

								{/* <input 
							type="checkbox"
							id="textureCompress"
							name="Texture Compress"
							value="textureCompress"
							className='mt-1 p-2 text-black ml-2'
							onChange={(e) => {
								onSetTextureCompress(!textureCompress);
							}}				  
						/> */}
							</div>
							<div className="p-4 items-center flex">
								<label htmlFor="xmp">Enable XMP</label>

								<Switch.Root
									checked={xmp}
									onCheckedChange={(e) => {
										onSetXMP(!xmp);
									}}
									className="SwitchRoot ml-2"
									id="xmp-enable"
								>
									<Switch.Thumb className="SwitchThumb" />
								</Switch.Root>
							</div>
						</div>
						{textureCompress ? (
							<>
								<p className="text-sm mb-3 p-2">Select an image type and dimensions to resize your textures to. To finalize your texture compression, click Process then Finish your upload.</p>
								<div className="p-4 bg-[#191919] rounded-2xl shadow-sm items-center flex justify-center gap-3">
									{/* // make two inputs one a select with the options of webp jpb and png and two others with for the dimentions */}
									<select
										className="p-2 text-black text-sm w-[50%] my-2 rounded-2xl"
										value={textureFormat}
										onChange={(e) => {
											setTextureFormat(e.target.value);
											onSetTextureCompressionType(e.target.value);
										}}
									>
										<option value="webp">webp</option>
										<option value="jpeg">jpeg</option>
										<option value="png">png</option>
									</select>
									<select
										className="p-2 text-black text-sm w-[50%] my-2 rounded-2xl"
										onChange={(e) => {
											setTextureCompressDimensions({ width: Number(e.target.value), height: Number(e.target.value) });
											onSetTextureCompressionSize(Number(e.target.value));
										}}
									>
										<option value="1024">1024x1024</option>
										<option value="512">512x512</option>
									</select>
								</div>
							</>
						) : null}
						{xmp ? (
							<>
								<p className="text-sm mb-3 p-2">To finalize your XMP data, click Process then Finish your upload.</p>
								<div className="p-4 bg-[#191919] rounded-2xl shadow-sm items-center">
									{renderXmpFields(xmpFields)}
									<div className="flex justify-end mt-4">
										<button
											onClick={handleAddXmpField}
											className="text-black p-1 px-3 rounded-full text-sm bg-slime-500 hover:bg-slime-400"
										>
											Add Field
										</button>
									</div>
								</div>
							</>
						) : null}

						<div className="pt-4 flex flex-col">
							<div className="pt-4 flex flex-col grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div className="mb-4">
									<div className="flex flex-wrap gap-2 p-4 bg-[#191919] rounded-2xl shadow-sm items-currentMixer">
										<label className="block text-sm font-semibold text-gray-200">Categories:</label>
										{categories?.map((category) => (
											<button
												key={category.id}
												onClick={() => handleCategorySelect(category.category)}
												className={`px-3 py-1 rounded-full text-sm ${selectedCategories.includes(category.category)
														? 'bg-blue-500 text-white'
														: 'bg-violet-500'
													}`}
											>
												{category.category}
											</button>
										))}
										<button
											onClick={() => setShowCategoryModal(true)}
											className="bg-slime-400 ml-2 text-sm text-gray-800 px-2 py-1 rounded-3xl font-semibold tracking-wider hover:bg-slime-500 focus:outline-none focus:ring-2 focus:ring-slime-500"
										>
											Manage Categories
										</button>
									</div>
								</div>
								<div className="flex gap-2 py-2 px-8 bg-[#191919] rounded-2xl shadow-sm items-center grid grid-cols-1">
									<label className={"m-2 text-center text-sm rounded-2xl"}>Tags</label>
									<textarea
										className=" py-2 px-4 text-black text-sm w-full mx-auto m-4 mb-2 mt-0 rounded-2xl "
										id="tags"
										name="tags"
										placeholder="Enter tags here (comma separated)"
										value={selectedAssetTags} // Set the value to the tags prop
										onChange={(e) => {
											onSetAssetTags(e.target.value);
										}
										}
									/>
									<button
										onClick={() => {
											setIsGeneratingTags(true);
											onClassifyImage(canvasSnapshot, setIsGeneratingTags);
										}}
										className="text-black text-xs lg:text-sm md:text-sm font-bold bg-orange-500 max-w-[200px]  mx-auto rounded-full px-6 py-1 m-4 mt-0 mb-2"
									>
										{isGeneratingTags ? "Generating...pls wait." : "Generate Tags"}
									</button>

								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UploadAsset;