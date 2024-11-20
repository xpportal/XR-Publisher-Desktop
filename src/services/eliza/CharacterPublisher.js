export class CharacterPublisher {
    constructor(edgeWorkerUrl) {
      this.edgeWorkerUrl = edgeWorkerUrl;
    }
  
    async publishCharacter(character) {
      try {
        const response = await fetch(`${this.edgeWorkerUrl}/characters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...character.toJSON(),
            status: 'published',
            publishedAt: Date.now()
          })
        });
  
        if (!response.ok) {
          throw new Error(`Publication failed: ${response.statusText}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Character publication failed:', error);
        throw error;
      }
    }
  
    async unpublishCharacter(characterId) {
      try {
        const response = await fetch(`${this.edgeWorkerUrl}/characters/${characterId}`, {
          method: 'DELETE'
        });
  
        if (!response.ok) {
          throw new Error(`Unpublication failed: ${response.statusText}`);
        }
  
        return true;
      } catch (error) {
        console.error('Character unpublication failed:', error);
        throw error;
      }
    }
  
    async getPublishedCharacters() {
      try {
        const response = await fetch(`${this.edgeWorkerUrl}/characters`);
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch published characters:', error);
        throw error;
      }
    }
  }
  