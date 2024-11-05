import { useEffect, useState } from 'react';
const XRPublisherKeyModal = ({ isOpen, onClose, onKeySave }) => {
	const [apiKey, setApiKey] = useState('');
	
	useEffect(() => {
	  if (isOpen) {
		const savedKey = localStorage.getItem('xr_publisher_api_key');
		if (savedKey) {
		  setApiKey(savedKey);
		}
	  }
	}, [isOpen]);
  
	const handleSaveKey = () => {
	  localStorage.setItem('xr_publisher_api_key', apiKey);
	  onKeySave(apiKey);
	  onClose();
	};
  
	const handleClearKey = () => {
	  localStorage.removeItem('xr_publisher_api_key');
	  setApiKey('');
	  onKeySave(null);
	};
  
	return (
	  <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? '' : 'hidden'} z-50 bg-black bg-opacity-50`}>
		<div className="bg-[#242025] p-6 rounded-3xl max-w-md w-full">
		  <h2 className="text-xl mb-4">XR Publisher API Key</h2>
		  <p className="text-sm mb-4">
			Enter your XR Publisher API key to enable world publishing.
		  </p>
		  <div className="mb-4">
			<input
			  type="password"
			  placeholder="username.keyId"
			  value={apiKey}
			  onChange={(e) => setApiKey(e.target.value)}
			  className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-violet-500"
			/>
			<div className="flex gap-2 mt-4">
			  <button
				onClick={handleSaveKey}
				className="bg-slime-500 text-black px-4 py-1 text-md rounded-full font-semibold hover:bg-slime-600"
			  >
				Save Key
			  </button>
			  {apiKey && (
				<button
				  onClick={handleClearKey}
				  className="bg-red-500 text-white px-4 py-1 text-md rounded-full font-semibold hover:bg-red-600"
				>
				  Clear Key
				</button>
			  )}
			</div>
		  </div>
		  <button onClick={onClose} className="mt-4 bg-gray-500 text-white px-8 py-2 rounded-full">
			Close
		  </button>
		</div>
	  </div>
	);
  };

export default XRPublisherKeyModal;