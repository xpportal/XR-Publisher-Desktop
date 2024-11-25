export class CharacterPublisher {
  constructor(workerUrl = 'https://xr-publisher.sxpdigital.workers.dev') {
    this.workerUrl = workerUrl;
  }

  async publishCharacter(character) {
    const apiKey = localStorage.getItem('xr_publisher_api_key');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const [username] = apiKey.split('.');
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit'
    };

    try {
      const endpoint = character.status === 'published' 
        ? '/update-character'  // Update existing character
        : '/upload-character'; // Create new character

		const response = await fetch(`${this.workerUrl}${endpoint}`, {
			...fetchOptions,
			body: JSON.stringify({
			  userId: username,
			  character: {
				name: character.name,
				modelProvider: character.modelProvider || 'LLAMALOCAL',
				clients: character.clients || ['DIRECT'],
				bio: character.bio,
				vrmUrl: character.vrmUrl,
				lore: character.lore || [],
				messageExamples: character.messageExamples || [],
				postExamples: character.postExamples || [],
				topics: character.topics || [],
				style: character.style || {
				  all: [],
				  chat: [],
				  post: []
				},
				adjectives: character.adjectives || [],
				settings: {
				  ...character.settings,
				  secrets: character.settings?.secrets || undefined
				}
			  }
			})
		  });
	  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish character');
      }

      return await response.json();
    } catch (error) {
      console.error('Character publishing error:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('xr_publisher_api_key');
      }
      throw error;
    }
  }

  async unpublishCharacter(characterName, userId) {
    const apiKey = localStorage.getItem('xr_publisher_api_key');
    if (!apiKey) {
      throw new Error('API key not found');
    }

    const [username] = apiKey.split('.');

    try {
      const response = await fetch(`${this.workerUrl}/delete-character`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          userId: username,
          characterName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unpublish character');
      }

      return await response.json();
    } catch (error) {
      console.error('Character unpublishing error:', error);
      if (error.message.includes('401')) {
        localStorage.removeItem('xr_publisher_api_key');
      }
      throw error;
    }
  }
}