import { useState, useEffect } from 'react';

const ApiKeyModal = ({ isOpen, onClose, onKeySave }) => {
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    // Load saved API key from localStorage when modal opens
    if (isOpen) {
      const savedKey = localStorage.getItem('toybox_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen]);

  const handleSaveKey = () => {
    localStorage.setItem('toybox_api_key', apiKey);
    onKeySave(apiKey);
    onClose();
  };

  const handleClearKey = () => {
    localStorage.removeItem('toybox_api_key');
    setApiKey('');
    onKeySave(null);
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? '' : 'hidden'} z-50 bg-black bg-opacity-50`}>
      <div className="bg-[#242025] p-6 rounded-3xl max-w-md w-full">
        <p className="text-sm mb-4">
          Enter your Toybox API key to enable asset management and storage capabilities.
        </p>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Enter API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveKey}
              className="bg-slime-500 text-black px-4 py-1 text-md rounded-full font-semibold hover:bg-slime-600 focus:outline-none focus:ring-2 focus:ring-slime-500"
            >
              Save Key
            </button>
            {apiKey && (
              <button
                onClick={handleClearKey}
                className="bg-red-500 text-white px-4 py-1 text-md rounded-full font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-8 py-2 rounded-full font-semibold tracking-wider hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;