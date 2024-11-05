import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { initializeEditor } from '../../editor/renderer';

export function CreateView() {
  const containerRef = useRef(null);
  const editorInitializedRef = useRef(false);
  const { editor, setEditor } = useEditor();
  
  useEffect(() => {
    if (!containerRef.current || editorInitializedRef.current) return;

    // Create a container for editor elements
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editor-container';
    containerRef.current.appendChild(editorContainer);

    // Initialize the editor
    const newEditor = initializeEditor(editorContainer);
    setEditor(newEditor);
    editorInitializedRef.current = true;

    return () => {
      if (newEditor) {
        // Cleanup editor
        newEditor.signals.rendererUpdated.dispatch();
        editorContainer.remove();
        editorInitializedRef.current = false;
      }
    };
  }, [setEditor]);

  return (
    <div ref={containerRef} className="w-full h-full relative" />
  );
}