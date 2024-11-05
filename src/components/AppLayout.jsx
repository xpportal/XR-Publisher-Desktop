import React, { useState, useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ChevronRight } from 'lucide-react';
import { CreateView } from './views/CreateView';
import { BrowseView } from './views/BrowseView';
import { ManageView } from './views/ManageView';
import { ToyboxView } from './views/ToyboxView';
import { ProfileView } from './views/ProfileView';
import XRPublisherKeyModal from './XRPublisherKeyModal'; // Add this import

import logo from '../../public/images/xrpublisher-logo-2048x475.png';

const AppLayout = () => {
	const [activeView, setActiveView] = useState('create');
	const [previousView, setPreviousView] = useState(null);
	const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
	const { editor } = useEditor();

	useEffect(() => {
		if (editor && editor.signals) {
		  // Listen for API key requests
		  const handleApiKeyNeeded = () => {
			const savedKey = localStorage.getItem('xr_publisher_api_key');
			if (!savedKey) {
			  setIsKeyModalOpen(true);
			}
		  };
	
		  editor.signals.xrPublisherApiKeyNeeded.add(handleApiKeyNeeded);
	
		  return () => {
			editor.signals.xrPublisherApiKeyNeeded.remove(handleApiKeyNeeded);
		  };
		}
	  }, [editor]);

	  const handleKeySave = (apiKey) => {
	if (editor && editor.signals) {
		editor.signals.xrPublisherApiKeyChanged.dispatch(apiKey);
	}
	};

		
  const views = [
    { id: 'browse', label: 'Browse' },
    { id: 'create', label: 'Create' },
    { id: 'manage', label: 'Manage' },
    { id: 'toybox', label: 'Toybox' },
	{ id: 'profile', label: 'Profile' }
  ];

  useEffect(() => {
    if (previousView === 'create' && activeView !== 'create') {
      if (editor) {
        editor.signals.rendererUpdated.dispatch();
      }
    }

    setPreviousView(activeView);
  }, [activeView, previousView, editor]);



  const renderView = () => {
    switch (activeView) {
      case 'browse':
        return <BrowseView />;
      case 'create':
        return <CreateView />;
      case 'manage':
        return <ManageView />;
      case 'toybox':
        return <ToyboxView />;
	  case 'profile':
		return <ProfileView />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Navigation Bar */}
      <div className="topHeader flex h-12 bg-[#1b1b1b] border-b border-[#333] items-center px-4">
        <div className="flex items-center space-x-1 px-2 z-10 topHeader">
          <img 
            src={logo}
            alt="XR Publisher"
            className="h-8"
            style={{
              width: 'auto',
              maxHeight: '50px',
              float: 'left'
            }}
          />

          <div className="flex items-center mt-3">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  backgroundColor: activeView === view.id ? '#84cc16' : '#333',
                  color: activeView === view.id ? '#000' : '#ccc',
                  padding: '11px 16px',
                  borderRadius: '4px',
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0',
                  transition: 'all 0.2s',
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1" />
      </div>

      {/* Content Area */}
      <div className="w-full h-[calc(100vh-48px)]">
        {renderView()}
      </div>

      {/* XR Publisher API Key Modal */}
      <XRPublisherKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeySave={handleKeySave}
      />
    </div>
  );
};

export default AppLayout;