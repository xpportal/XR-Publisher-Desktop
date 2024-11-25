export class ElizaService {
    static instance = null;
    isInitialized = false;
    currentCharacter = null;
  
    static getInstance() {
      if (!ElizaService.instance) {
        ElizaService.instance = new ElizaService();
      }
      return ElizaService.instance;
    }
  
    async initialize(character = null) {
      if (this.isInitialized && this.currentCharacter?.id === character?.id) {
        return;
      }
  
      // Format config according to what AgentRuntime expects
      const config = character ? {
        name: character.name,
        modelProvider: "LLAMALOCAL",
        character: character.toConfig(), // Pass full character config here
        conversationLength: 10,
        serverUrl: "http://localhost:11434",
        settings: {
          model: "llama2",
          embedModel: "mxbai-embed-large"
        }
      } : {
        name: "DefaultAssistant",
        modelProvider: "LLAMALOCAL",
        character: {
          bio: ["Default assistant for testing"],
          style: {
            all: ["Be helpful and direct"]
          }
        },
        conversationLength: 10,
        serverUrl: "http://localhost:11434",
        settings: {
          model: "llama2",
          embedModel: "mxbai-embed-large"
        }
      };
	  console.log('Eliza config,', config);
      try {
        const success = await window.electron.eliza.start(config);
        if (!success) {
          throw new Error('Failed to initialize Eliza runtime');
        }
        this.isInitialized = true;
        this.currentCharacter = character;
      } catch (error) {
        console.error('Failed to initialize Eliza:', error);
        throw error;
      }
    }
  
    async sendMessage(message) {
        if (!this.isInitialized) {
          throw new Error("ElizaService not initialized");
        }
  
        try {
          console.log('Sending message:', message);
          
          // Format the message as expected by the main process
          const response = await window.electron.eliza.sendMessage(message);
          console.log('Received response:', response);
          
          if (!response) {
            throw new Error('No response received from Eliza');
          }
  
          // Handle potential response formats
          if (typeof response === 'string') {
            return response;
          } else if (response.content?.text) {
            return response.content.text;
          } else if (response.response) {
            return response.response;
          }
          
          return String(response);
        } catch (error) {
          console.error("Error in Eliza message handling:", error);
          throw error;
        }
      }  
  
    async cleanup() {
      if (this.isInitialized) {
        await window.electron.eliza.stop();
        this.isInitialized = false;
        this.currentCharacter = null;
      }
    }
}
