import React, { useState, useEffect } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { ElizaService } from '../../services/eliza/ElizaService';
import { Character } from '../../services/eliza/Character';
import { CharacterStorage } from '../../services/eliza/CharacterStorage';
import { VRMViewer } from '../VRMViewer';
import { CharacterForm } from '../CharacterForm';

export const CharacterManagerView = () => {
  const { editor } = useEditor();
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [elizaInstance, setElizaInstance] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCharacter, setNewCharacter] = useState(null);
  const [vrmUrl, setVrmUrl] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        await CharacterStorage.initializeStorage();
        await loadCharacters();
        const instance = ElizaService.getInstance();
        setElizaInstance(instance);
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    
    init();
  }, []);
  
  useEffect(() => {
    loadCharacters();
    const instance = ElizaService.getInstance();
    setElizaInstance(instance);
  }, []);

  useEffect(() => {
    if (selectedCharacter && elizaInstance) {
      elizaInstance.initialize(selectedCharacter);
    }
  }, [selectedCharacter]);

  const loadCharacters = async () => {
    try {
      const loaded = await CharacterStorage.getCharacters();
      setCharacters(loaded || []); // Ensure we always set an array
    } catch (error) {
      console.error('Failed to load characters:', error);
      setCharacters([]); // Set empty array on error
    }
  };
  
  const handleCreateCharacter = () => {
    setIsCreating(true);
    setNewCharacter(new Character());
  };

  const handleSaveCharacter = () => {
    if (newCharacter) {
      CharacterStorage.saveCharacter(newCharacter);
      loadCharacters();
      setIsCreating(false);
      setNewCharacter(null);
    }
  };

  const handleVRMSelect = (character) => {
    if (vrmUrl.trim()) {
      if (isCreating) {
        setNewCharacter({ ...character, vrmUrl });
      } else {
        const updated = { ...selectedCharacter, vrmUrl };
        setSelectedCharacter(updated);
        CharacterStorage.saveCharacter(updated);
      }
      setVrmUrl('');
    }
  };

  const VrmSelector = ({ character, onSelect }) => (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Enter VRM URL"
        className="w-full bg-gray-800 text-white p-2 rounded"
        value={vrmUrl}
        onChange={(e) => setVrmUrl(e.target.value)}
      />
      <button
        className="bg-lime-500 text-black px-4 py-2 rounded w-full"
        onClick={() => onSelect(character)}
      >
        Set VRM Model
      </button>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-xl text-white mb-2">Characters</h2>
          <button 
            className="w-full bg-lime-500 text-black px-4 py-2 rounded"
            onClick={handleCreateCharacter}
          >
            Add Character
          </button>
        </div>
        <div className="space-y-2">
          {characters.map(char => (
            <div 
              key={char.id}
              className={`p-2 rounded cursor-pointer ${
                selectedCharacter?.id === char.id ? 'bg-lime-500 text-black' : 'bg-gray-700 text-white'
              }`}
              onClick={() => setSelectedCharacter(char)}
            >
              {char.name}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-900 overflow-y-auto">
        {isCreating ? (
          <div className="p-4">
            <h2 className="text-2xl text-white mb-4">Create Character</h2>
            <CharacterForm
              character={newCharacter}
              onChange={setNewCharacter}
              onSubmit={handleSaveCharacter}
            />
            <div className="mt-4">
              <VrmSelector character={newCharacter} onSelect={handleVRMSelect} />
              {newCharacter.vrmUrl && (
                <div className="h-96 mt-4">
                  <VRMViewer url={newCharacter.vrmUrl} />
                </div>
              )}
            </div>
          </div>
        ) : selectedCharacter ? (
          <>
            <div className="p-4 bg-gray-700">
              <h2 className="text-2xl text-white mb-4">Edit Character</h2>
              <CharacterForm
                character={selectedCharacter}
                onChange={(updated) => {
                  setSelectedCharacter(updated);
                  CharacterStorage.saveCharacter(updated);
                }}
                onSubmit={() => {
                  CharacterStorage.saveCharacter(selectedCharacter);
                }}
              />
              <div className="mt-4">
                <VrmSelector character={selectedCharacter} onSelect={handleVRMSelect} />
                {selectedCharacter.vrmUrl && (
                  <div className="h-96 mt-4">
                    <VRMViewer url={selectedCharacter.vrmUrl} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-lime-500 text-black ml-auto' 
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 bg-gray-800 text-white px-4 py-2 rounded"
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button 
                  className="bg-lime-500 text-black px-6 py-2 rounded"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select or create a character to begin
          </div>
        )}
      </div>
    </div>
  );

  async function handleSendMessage() {
    if (!input.trim() || !elizaInstance) return;
    
    const userMessage = { text: input, sender: 'user' };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
  
    try {
      console.log('Sending message to Eliza:', input);
      const response = await elizaInstance.sendMessage(input);
      console.log('Received response from Eliza:', response);
      
      // Handle the response
      const responseText = typeof response === 'string' ? response : 
                          response?.content?.text || 
                          response?.response || 
                          'No readable response received';
      
      setChatHistory(prev => [...prev, { 
        text: responseText, 
        sender: 'assistant' 
      }]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setChatHistory(prev => [...prev, { 
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        sender: 'assistant' 
      }]);
    }
  }
  
};