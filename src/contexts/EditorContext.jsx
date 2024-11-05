import React, { createContext, useContext, useState, useEffect } from 'react';

const EditorContext = createContext();

export function EditorProvider({ children }) {
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    // Initialize editor when needed
    if (!editor && window.editor) {
      setEditor(window.editor);
    }
  }, []);
  const pauseEditor = () => {
    if (editor) {
      editor.signals.rendererUpdated.dispatch();
    }
  };

  const resumeEditor = () => {
    if (editor) {
      editor.signals.windowResize.dispatch();
    }
  };

  return (
    <EditorContext.Provider value={{ editor, setEditor, pauseEditor, resumeEditor }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}



// import React, { createContext, useContext, useEffect, useState } from 'react';

// const EditorContext = createContext(null);

// export function EditorProvider({ children }) {
//   const [editor, setEditor] = useState(null);

//   useEffect(() => {
//     // Wait for the editor to be initialized
//     const checkEditor = setInterval(() => {
//       if (window.editor) {
//         setEditor(window.editor);
//         clearInterval(checkEditor);
//       }
//     }, 100);

//     return () => clearInterval(checkEditor);
//   }, []);

//   const pauseEditor = () => {
//     if (editor) {
//       // Pause rendering and animations
//       editor.signals.rendererUpdated.dispatch();
//       // Could add more cleanup here
//     }
//   };

//   const resumeEditor = () => {
//     if (editor) {
//       // Resume rendering and dispatch resize to ensure proper state
//       editor.signals.windowResize.dispatch();
//       // Could add more initialization here
//     }
//   };

//   return (
//     <EditorContext.Provider value={{ editor, pauseEditor, resumeEditor }}>
//       {children}
//     </EditorContext.Provider>
//   );
// }

// export function useEditor() {
//   const context = useContext(EditorContext);
//   if (!context) {
//     throw new Error('useEditor must be used within an EditorProvider');
//   }
//   return context;
// }