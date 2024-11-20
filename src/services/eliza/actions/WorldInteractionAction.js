export const WorldInteractionAction = {
    name: "INTERACT_WITH_WORLD",
    similes: ["EXPLORE_WORLD", "JOIN_WORLD", "INSPECT_WORLD"],
    description: "Enables character to interact with XR world components and attributes",
    
    validate: async (runtime, message) => {
      // Verify world URL and character permissions
      const worldUrl = message.content.worldUrl;
      return worldUrl && worldUrl.includes('xr-publisher.sxpdigital.workers.dev/directory/');
    },
    
    handler: async (runtime, message) => {
      const { worldUrl, characterId, action } = message.content;
      try {
        const worldResponse = await fetch(`${worldUrl}?agent=${characterId}&action=${action}`);
        const worldData = await worldResponse.json();
        
        // Process web components and their attributes
        const components = await runtime.processWorldComponents(worldData);
        
        return {
          success: true,
          components,
          actions: determineAvailableActions(components)
        };
      } catch (error) {
        console.error('World interaction failed:', error);
        return { success: false, error: error.message };
      }
    }
  };
  