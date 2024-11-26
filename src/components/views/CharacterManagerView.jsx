import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { ElizaService } from '../../services/eliza/ElizaService';
import { Character } from '../../services/eliza/Character';
import { CharacterStorage } from '../../services/eliza/CharacterStorage';
import { VRMViewer } from '../VRMViewer';
import { CharacterForm } from '../CharacterForm';
import { CharacterPublishControl } from '../CharacterPublishControl';

const MemoizedVRMViewer = React.memo(VRMViewer);
const MemoizedCharacterForm = React.memo(CharacterForm);

const CharacterView = ({
	character,
	isNew,
	onVrmSelect,
	chatHistory = [],
	input = '',
	onInputChange = () => { },
	onSendMessage = () => { },
	onCharacterChange,
	onCharacterSave,
	onPublish,
	onUnpublish
}) => {
	const [localVrmUrl, setLocalVrmUrl] = useState('');

	return (
		<div className="flex h-full">
			<div className="w-2/3 p-4 bg-gray-800">
				<div className="space-y-2">
					<input
						type="text"
						placeholder="Enter VRM URL"
						className="w-full bg-gray-800 text-white p-2 rounded"
						value={localVrmUrl}
						onChange={(e) => setLocalVrmUrl(e.target.value)}
					/>
					<button
						className="bg-lime-500 text-black px-4 py-2 rounded w-50"
						onClick={() => {
							onVrmSelect(character, localVrmUrl);
							setLocalVrmUrl('');
						}}
					>
						Apply VRM Model URL
					</button>
				</div>
				{character?.vrmUrl && (
					<div className="h-[calc(100%-140px)] mt-4">
						<MemoizedVRMViewer
							url={character.vrmUrl}
							animationUrl="/models/friendly.fbx"
						/>
					</div>
				)}
			</div>
			<div className="w-1/3 flex flex-col">
				<div className="p-4 bg-gray-700 overflow-y-auto">
					<h2 className="text-2xl text-white mb-4">
						{isNew ? 'Create Character' : 'Edit Character'}
					</h2>
					<MemoizedCharacterForm
						character={character}
						onChange={onCharacterChange}
						onSubmit={onCharacterSave}
					/>
					{!isNew && ( 
						<div className="mt-4">
							<CharacterPublishControl
								character={character}
								onPublish={onPublish}
								onUnpublish={onUnpublish}
							/>
						</div>
					)}

				</div>
				{!isNew && (
					<div className="flex-1 flex flex-col p-4">
						<div className="flex-1 overflow-y-auto mb-4 space-y-4">
							{chatHistory.map((msg, idx) => (
								<div
									key={idx}
									className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'user'
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
								onChange={onInputChange}
								className="flex-1 bg-gray-800 text-white px-4 py-2 rounded"
								placeholder="Type your message..."
								onKeyPress={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										onSendMessage();
									}
								}}
							/>
							<button
								className="bg-lime-500 text-black px-6 py-2 rounded"
								onClick={onSendMessage}
							>
								Send
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const MemoizedCharacterView = React.memo(CharacterView);

export const CharacterManagerView = () => {
	const { editor } = useEditor();
	const [characters, setCharacters] = useState([]);
	const [selectedCharacter, setSelectedCharacter] = useState(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [input, setInput] = useState('');
	const [elizaInstance, setElizaInstance] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [newCharacter, setNewCharacter] = useState(null);

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
		if (selectedCharacter && elizaInstance) {
			elizaInstance.initialize(selectedCharacter);
		}
	}, [selectedCharacter]);

	const loadCharacters = async () => {
		try {
			const loaded = await CharacterStorage.getCharacters();
			setCharacters(loaded || []);
		} catch (error) {
			console.error('Failed to load characters:', error);
			setCharacters([]);
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

	const handleVRMSelect = (character, url) => {
		if (url.trim()) {
			if (isCreating) {
				setNewCharacter({ ...character, vrmUrl: url });
			} else {
				const updated = { ...selectedCharacter, vrmUrl: url };
				setSelectedCharacter(updated);
				CharacterStorage.saveCharacter(updated);
			}
		}
	};
	const handlePublishCharacter = async (publishedCharacter) => {
		try {
		  // Update local storage with published status
		  const updated = {
			...publishedCharacter,
			status: 'published',
			publishedAt: new Date().toISOString()
		  };
		  await CharacterStorage.saveCharacter(updated);
		  
		  // Update UI
		  setSelectedCharacter(updated);
		  await loadCharacters(); // Reload the list
		} catch (error) {
		  console.error('Failed to handle publish:', error);
		}
	  };
	
	  const handleUnpublishCharacter = async (characterName) => {
		try {
		  // Find the character in local storage
		  const char = await CharacterStorage.getCharacter(selectedCharacter.id);
		  if (char) {
			// Update local storage
			const updated = {
			  ...char,
			  status: 'local',
			  publishedAt: null
			};
			await CharacterStorage.saveCharacter(updated);
			
			// Update UI
			setSelectedCharacter(updated);
			await loadCharacters(); // Reload the list
		  }
		} catch (error) {
		  console.error('Failed to handle unpublish:', error);
		}
	  };
	
	async function handleSendMessage() {
		if (!input.trim() || !elizaInstance) return;

		const userMessage = { text: input, sender: 'user' };
		setChatHistory(prev => [...prev, userMessage]);
		setInput('');

		try {
			const response = await elizaInstance.sendMessage(input);
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
				text: 'Sorry, I encountered an error processing your message.',
				sender: 'assistant'
			}]);
		}
	}

	return (
		<div className="flex h-full">
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
				  <div className="flex items-center justify-between">
					<span>{char.name}</span>
					{char.status === 'published' && (
					  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
						Published
					  </span>
					)}
				  </div>
				</div>
			  ))}
			</div>
		  </div>
	
		  <div className="flex-1 bg-gray-900">
			{isCreating ? (
			  <MemoizedCharacterView 
				character={newCharacter}
				isNew={true}
				onVrmSelect={handleVRMSelect}
				onCharacterChange={setNewCharacter}
				onCharacterSave={handleSaveCharacter}
			  />
			) : selectedCharacter ? (
			  <MemoizedCharacterView 
				character={selectedCharacter}
				isNew={false}
				onVrmSelect={handleVRMSelect}
				chatHistory={chatHistory}
				input={input}
				onInputChange={(e) => setInput(e.target.value)}
				onSendMessage={handleSendMessage}
				onCharacterChange={(updated) => {
				  setSelectedCharacter(updated);
				  CharacterStorage.saveCharacter(updated);
				}}
				onCharacterSave={() => CharacterStorage.saveCharacter(selectedCharacter)}
				onPublish={handlePublishCharacter}
				onUnpublish={handleUnpublishCharacter}
			  />
			) : (
			  <div className="flex items-center justify-center h-full text-gray-400">
				Select or create a character to begin
			  </div>
			)}
		  </div>
		</div>
	  );
	};
	
export default CharacterManagerView;