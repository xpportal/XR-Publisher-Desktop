export class WorldInteractionService {
    static async joinWorld(character, worldUrl) {
      if (character.status !== 'published') {
        throw new Error('Character must be published to join worlds');
      }
  
      return await fetch(`${worldUrl}?agent=${character.id}&action=join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          characterId: character.id,
          capabilities: character.availableActions
        })
      });
    }
  
    static async inspectWorldComponents(worldUrl) {
      let doc;
      
      if (typeof window !== 'undefined') {
        // Browser environment
        const response = await fetch(worldUrl);
        const html = await response.text();
        const parser = new DOMParser();
        doc = parser.parseFromString(html, 'text/html');
      } else {
        // Node environment - you might want to use a library like jsdom here
        throw new Error('Node.js environment not supported for component inspection');
      }
  
      return Array.from(doc.querySelectorAll('*'))
        .filter(el => el.tagName.includes('-'))
        .map(component => ({
          tag: component.tagName.toLowerCase(),
          attributes: Array.from(component.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })),
          interactable: WorldInteractionService.isComponentInteractable(component)
        }));
    }
  
    static isComponentInteractable(component) {
      const interactableAttributes = ['clickable', 'interactive', 'trigger'];
      return Array.from(component.attributes)
        .some(attr => interactableAttributes.includes(attr.name));
    }
  }
  