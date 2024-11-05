import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaRegCopy, FaDownload } from 'react-icons/fa';
// import PreviewViewer from '../PreviewViewer';
import UploadAsset from '../UploadAsset';
import { Upload } from 'lucide-react';

export function ToyboxView() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Asset states
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Upload states
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [uploadingMessage, setUploadingMessage] = useState(null);
  const [assetFile, setAssetFile] = useState(null);
  const [selectedAssetData, setSelectedAssetData] = useState(null);
  const [selectedAssetFilename, setSelectedAssetFilename] = useState('');
  const [selectedAssetTags, setSelectedAssetTags] = useState('');
  const [canvasSnapshot, setCanvasSnapshot] = useState(null);
  const [backgroundColor, setColor] = useState("#00ffdd");
  const [backgroundColor2, setColor2] = useState("#aa00ff");
  const [gradientCenter, setGradientCenter] = useState(0.1);
  const [selectedAssetPolyCount, setSelectedAssetPolyCount] = useState(0);
  const [selectedAssetOriginalSize, setSelectedAssetOriginalSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const [processingAsset, setProcessingAsset] = useState(false);

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAssetSelect = async (file) => {
    try {
		setSelectedAssetFilename(file.name);
      const fileData = await convertFileToBase64(file);
	  setSelectedAssetOriginalSize(file.size);
      setSelectedAssetData(fileData);
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
  };
  // Storage metrics
  const [currentStorage, setCurrentStorage] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(1073.74);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length !== 1 || !acceptedFiles[0].name.match(/\.(glb|vrm|usdz|gltf)$/)) {
      return;
    }
    if (currentStorage > currentLimit) {
      return;
    }
    setAssetFile(acceptedFiles[0]);
    handleAssetSelect(acceptedFiles[0]);
  }, [currentStorage, currentLimit]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleAssetUpload = async () => {
    if (!assetFile) return;

    setUploadingAsset(true);
    const token = localStorage.getItem('access_token');

    try {
      const fileBase64 = selectedAssetData;
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
      const totalChunks = Math.ceil(fileBase64.length / CHUNK_SIZE);
      const chunkPromises = [];

      const assetFileExtension = assetFile.name.split('.').pop();
      let assetFileNameWithoutExtension = selectedAssetFilename.replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, '');
      const finalUploadFileName = `${assetFileNameWithoutExtension}.${assetFileExtension}`;

      // Upload chunks
      for (let chunkNumber = 1; chunkNumber <= totalChunks; chunkNumber++) {
        const start = (chunkNumber - 1) * CHUNK_SIZE;
        const end = chunkNumber * CHUNK_SIZE;
        const chunkData = fileBase64.slice(start, end);

        setUploadingMessage(`Uploading chunk ${chunkNumber} of ${totalChunks}`);

        const chunkPromise = fetch('https://cfdb.sxpdigital.workers.dev/asset-upload-chunk', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: finalUploadFileName,
            fileData: chunkData,
            chunkNumber,
            totalChunks,
            categories: selectedCategories.join(','),
          }),
        });

        chunkPromises.push(chunkPromise);
      }

      await Promise.all(chunkPromises);
      setUploadingMessage('Finalizing upload...');

      // Complete upload
      const finalResponse = await fetch('https://cfdb.sxpdigital.workers.dev/asset-upload-complete', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: finalUploadFileName,
          fileSize: newSize || selectedAssetOriginalSize,
          polyCount: selectedAssetPolyCount,
          thumb: canvasSnapshot,
          background: JSON.stringify({
            backgroundColor,
            backgroundColor2,
            gradientCenter
          }),
          tags: selectedAssetTags,
          categories: selectedCategories.join(','),
        }),
      });

      if (!finalResponse.ok) throw new Error('Upload failed');

      // Reset states and refresh assets
      setAssetFile(null);
      setSelectedAssetData(null);
      setUploadingAsset(false);
      fetchAssets(token);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadingMessage('Upload failed: ' + error.message);
      setUploadingAsset(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchAssets(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAssets = async (token) => {
    try {
      const response = await axios.get(`https://cfdb.sxpdigital.workers.dev/assets`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          search: searchQuery,
          categories: selectedCategories.join(','),
          limit: 10,
          offset: 0
        }
      });

      if (response.status === 200) {
        setAssets(response.data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`https://cfdb.sxpdigital.workers.dev/login`, {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setIsLoggedIn(true);
      fetchAssets(access_token);
    } catch (error) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsLoggedIn(false);
    setAssets([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#191919] p-8">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="bg-[#242025] rounded-3xl p-6 shadow-lg">
              <div className="h-48 bg-gray-600 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div 
	  	className="min-h-screen bg-[#191919] flex items-center justify-center p-8"
		>
        <div className="bg-[#242025] p-8 rounded-3xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Login to Toybox</h2>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 rounded-full bg-[#191919] text-white border border-gray-700 focus:outline-none focus:border-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-full bg-[#191919] text-white border border-gray-700 focus:outline-none focus:border-violet-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191919] p-8"
		style={{
			overflow: "auto",
			height:"100vh"
		}}
	>
      {/* Upload Section */}
      <div className="max-w-7xl mx-auto">
        <div className={`shadow-lg mx-auto px-1 py-8 lg:p-8 pt-10 bg-[#242025] sm:p-1 ${
          (isDragActive || selectedAssetData) && currentStorage < currentLimit
            ? 'glower glower-orange'
            : 'glower'
        }`}>
          {!selectedAssetData && currentStorage < currentLimit && (
            <>
              <h2 className="text-xl text-center font-semibold mb-4 pt-4 text-white">
                Add to Toybox
              </h2>
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} accept=".glb,.vrm,.usdz,.gltf" />
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <FaFileUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-300">
                    Drop a .glb, .vrm, or .usdz file to process and optimize it
                  </p>
                </div>
              </div>
            </>
          )}
		{selectedAssetData && (
		<UploadAsset
			data={selectedAssetData}
			selectedAssetFilename={selectedAssetFilename}
			onSetAssetTags={setSelectedAssetTags}
			onSetColor={setColor}
			onSetColor2={setColor2}
			onSetGradientCenter={setGradientCenter}
			backgroundColor={backgroundColor}
			backgroundColor2={backgroundColor2}
			gradientCenter={gradientCenter}
			// ... other props
		/>
		)}
        </div>
		<div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search assets..."
              className="px-4 py-2 rounded-full bg-[#242025] text-white border border-gray-700 focus:outline-none focus:border-violet-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => fetchAssets(localStorage.getItem('access_token'))}
              className="bg-violet-600 text-white px-4 py-2 rounded-full hover:bg-violet-700 transition-colors"
            >
              Search
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <div 
              key={asset.id}
              className="bg-[#242025] rounded-3xl p-6 shadow-lg"
              style={{
                backgroundImage: asset.background ? 
                  `linear-gradient(45deg, ${JSON.parse(asset.background).backgroundColor}, ${JSON.parse(asset.background).backgroundColor2})` :
                  'linear-gradient(45deg, #2aff00, #00ffb3)'
              }}
            >
              <img
                src={asset.thumburl + '?thumb=' + Date.now()}
                alt={asset.filename}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-lg font-bold text-white mb-2">{asset.filename}</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {(asset.filesize / 1000000).toFixed(2)} MB
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(asset.fileurl)}
                  className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm hover:bg-violet-700 transition-colors"
                >
                  Copy URL
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
	</div>
  );
}