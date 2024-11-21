import React, { useState } from 'react';
import { CharacterPublisher } from './CharacterPublisher';

export const CharacterPublishControl = ({ character, onPublish, onUnpublish }) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState(null);
  const publisher = new CharacterPublisher();

  const handlePublishOrUpdate = async () => {
    if (!character.name) {
      setError('Character must have a name');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const apiKey = localStorage.getItem('xr_publisher_api_key');
      if (!apiKey) {
        if (window.editor && window.editor.signals) {
          window.editor.signals.xrPublisherApiKeyNeeded.dispatch();
        }
        return;
      }

      const result = await publisher.publishCharacter(character);
      const updatedCharacter = {
        ...character,
        status: 'published',
        publishedAt: character.publishedAt || new Date().toISOString()
      };
      onPublish(updatedCharacter);
    } catch (error) {
      setError(error.message);
      if (error.message.includes('401')) {
        if (window.editor && window.editor.signals) {
          window.editor.signals.xrPublisherApiKeyNeeded.dispatch();
        }
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setIsPublishing(true);
    setError(null);
    try {
      await publisher.unpublishCharacter(character.name);
      onUnpublish(character.name);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-white">Status: {character.status || 'local'}</span>
        {(!character.status || character.status === 'local') ? (
          <button
            className="bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-600"
            onClick={handlePublishOrUpdate}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Publish Character'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              className="bg-lime-500 text-black px-4 py-2 rounded hover:bg-lime-600"
              onClick={handlePublishOrUpdate}
              disabled={isPublishing}
            >
              {isPublishing ? 'Updating...' : 'Update'}
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleUnpublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Unpublishing...' : 'Unpublish'}
            </button>
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};