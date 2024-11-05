import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorProvider } from './contexts/EditorContext.jsx';
import AppLayout from './components/AppLayout.jsx';

// Only import the styles
import './editors/css/main.css';
import './editors/libs/codemirror/codemirror.css';
import './editors/libs/codemirror/theme/monokai.css';
import './editors/libs/codemirror/addon/dialog.css';
import './editors/libs/codemirror/addon/show-hint.css';
import './editors/libs/codemirror/addon/tern.css';
import './styles/main.css';

function App() {
  useEffect(() => {
    // Add importmap programmatically
    const importMapScript = document.createElement('script');
    importMapScript.type = 'importmap';
    importMapScript.textContent = JSON.stringify({
      imports: {
        "three": "/node_modules/three/build/three.module.js",
        "three/addons/": "/node_modules/three/examples/jsm/",
        "three/examples/": "/node_modules/three/examples/"
      }
    });
    document.head.appendChild(importMapScript);
  }, []);

  return (
    <React.StrictMode>
      <EditorProvider>
        <AppLayout />
      </EditorProvider>
    </React.StrictMode>
  );
}

// Initialize React
const root = createRoot(document.getElementById('root'));
root.render(<App />);