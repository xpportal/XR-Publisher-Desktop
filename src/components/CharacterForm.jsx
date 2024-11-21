import React from 'react';

export const CharacterForm = ({ character, onChange, onSubmit }) => {
  const handleTextInput = (field, text) => {
    console.log(`Text input on ${field}:`, text);
    onChange({
      ...character,
      [field]: text
    });
  };

  const handleArrayInput = (field, text) => {
    console.log(`Array input on ${field}:`, text);
    onChange({
      ...character,
      [field]: text === '' ? [] : text.split('\n')
    });
  };

  const handleStyleInput = (styleType, text) => {
    console.log(`Style input on ${styleType}:`, text);
    onChange({
      ...character,
      style: {
        ...character.style,
        [styleType]: text === '' ? [] : text.split('\n').map(line => line.trim()).filter(line => line)
      }
    });
  };
  
  const handleKeyDown = (e, field, handler) => {
    console.log(`Key down on ${field}:`, e.key, e.target.value);
    if (e.key === 'Backspace') {
      const newValue = e.target.value.slice(0, -1);
      handler(field, newValue);
    }
  };

  const createInputProps = (field, handler, isArray = false) => ({
    className: "w-full bg-gray-800 text-white text-sm p-2 rounded",
    value: isArray 
      ? (Array.isArray(character[field]) ? character[field].join('\n') : '')
      : (character[field] || ''),
    onChange: (e) => handler(field, e.target.value),
    onKeyDown: (e) => handleKeyDown(e, field, handler),
    onInput: (e) => handler(field, e.target.value)
  });

  const createStyleInputProps = (styleType) => ({
    className: "w-full bg-gray-800 text-white text-sm p-2 rounded",
    value: Array.isArray(character.style?.[styleType]) 
      ? character.style[styleType].join('\n') 
      : '',
    onChange: (e) => handleStyleInput(styleType, e.target.value),
    onKeyDown: (e) => handleKeyDown(styleType, handleStyleInput),
    onInput: (e) => handleStyleInput(styleType, e.target.value)
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm mb-2">Name</label>
        <input
          type="text"
		  
          {...createInputProps('name', handleTextInput)}
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Description</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)
  {...createInputProps('description', handleTextInput)}
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Model Provider</label>
        <select
          className="w-full bg-gray-800 text-white text-sm p-2 rounded"
          value={character.modelProvider || 'LLAMALOCAL'}
          onChange={(e) => handleTextInput('modelProvider', e.target.value)}
        >
          <option value="LLAMALOCAL">Llama Local</option>
          <option value="ANTHROPIC">Anthropic</option>
          <option value="OPENAI">OpenAI</option>
        </select>
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Bio (one per line)</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

          {...createInputProps('bio', handleArrayInput, true)}
          placeholder="Enter each bio line on a new line"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Lore (one per line)</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

          {...createInputProps('lore', handleArrayInput, true)}
          placeholder="Enter each lore line on a new line"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Knowledge (one per line)</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

          {...createInputProps('knowledge', handleArrayInput, true)}
          placeholder="Enter each knowledge item on a new line"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Topics (one per line)</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

          {...createInputProps('topics', handleArrayInput, true)}
          placeholder="Enter each topic on a new line"
        />
      </div>

      <div>
        <label className="block text-white text-sm mb-2">Adjectives (one per line)</label>
        <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

          {...createInputProps('adjectives', handleArrayInput, true)}
          placeholder="Enter each adjective on a new line"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-white text-sm text-lg font-semibold">Style Guidelines</h3>
        
        <div>
          <label className="block text-white text-sm mb-2">General Style (one per line)</label>
          <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

            {...createStyleInputProps('all')}
            placeholder="Enter each general style guideline on a new line"
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">Chat Style (one per line)</label>
          <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

            {...createStyleInputProps('chat')}
            placeholder="Enter each chat style guideline on a new line"
          />
        </div>

        <div>
          <label className="block text-white text-sm mb-2">Post Style (one per line)</label>
          <textarea
  style={{ fontSize: '0.675rem' }} // This sets the font size to small (14px)

            {...createStyleInputProps('post')}
            placeholder="Enter each post style guideline on a new line"
          />
        </div>
      </div>

      <button
        className="w-full bg-lime-500 text-black px-4 py-2 rounded"
        onClick={onSubmit}
      >
        Save Character
      </button>
    </div>
  );
};