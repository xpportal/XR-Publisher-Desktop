export const CharacterPublishControl = ({ character, onPublish, onUnpublish }) => {
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);
    const publisher = new CharacterPublisher(process.env.EDGE_WORKER_URL);
  
    const handlePublish = async () => {
      setIsPublishing(true);
      setError(null);
      try {
        const published = await publisher.publishCharacter(character);
        onPublish(published);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsPublishing(false);
      }
    };
  
    const handleUnpublish = async () => {
      setIsPublishing(true);
      setError(null);
      try {
        await publisher.unpublishCharacter(character.id);
        onUnpublish(character.id);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsPublishing(false);
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-white">Status: {character.status}</span>
          {character.status === 'local' ? (
            <button
              className="bg-lime-500 text-black px-4 py-2 rounded"
              onClick={handlePublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Character'}
            </button>
          ) : (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleUnpublish}
              disabled={isPublishing}
            >
              {isPublishing ? 'Unpublishing...' : 'Unpublish Character'}
            </button>
          )}
        </div>
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
      </div>
    );
  };
  