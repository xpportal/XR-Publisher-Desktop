export class Character {
    constructor(data = {}) {
      // Basic properties
      this.id = data.id || crypto.randomUUID();
      this.name = data.name || '';
      this.description = data.description || '';
      this.vrmUrl = data.vrmUrl || '';
      this.modelProvider = data.modelProvider || 'LLAMALOCAL';
      
      // Array properties with safe initialization
      this.clients = [...(Array.isArray(data.clients) ? data.clients : ['DISCORD', 'DIRECT'])];
      this.bio = [...(Array.isArray(data.bio) ? data.bio : [])];
      this.lore = [...(Array.isArray(data.lore) ? data.lore : [])];
      this.knowledge = [...(Array.isArray(data.knowledge) ? data.knowledge : [])];
      this.messageExamples = [...(Array.isArray(data.messageExamples) ? data.messageExamples : [])];
      this.postExamples = [...(Array.isArray(data.postExamples) ? data.postExamples : [])];
      this.topics = [...(Array.isArray(data.topics) ? data.topics : [])];
      this.adjectives = [...(Array.isArray(data.adjectives) ? data.adjectives : [])];
      
      // Nested objects
      this.style = {
        all: [...(Array.isArray(data.style?.all) ? data.style.all : [])],
        chat: [...(Array.isArray(data.style?.chat) ? data.style.chat : [])],
        post: [...(Array.isArray(data.style?.post) ? data.style.post : [])]
      };
      
      this.settings = {
        model: data.settings?.model || 'claude-3-opus-20240229',
        voice: {
          model: data.settings?.voice?.model || 'en-US-neural'
        }
      };
      
      // Publishing and interaction properties
      this.createdAt = data.createdAt || Date.now();
      this.status = data.status || 'local';
      this.publishedAt = data.publishedAt || null;
      this.worldInteractions = [...(Array.isArray(data.worldInteractions) ? data.worldInteractions : [])];
      this.availableActions = [...(Array.isArray(data.availableActions) ? data.availableActions : [
        'INTERACT_WITH_WORLD',
        'EXPLORE_COMPONENTS',
        'TRIGGER_EVENT'
      ])];
    }
  
    toConfig() {
      return {
        name: this.name,
        modelProvider: this.modelProvider,
        clients: this.clients,
        bio: this.bio,
        lore: this.lore,
        knowledge: this.knowledge,
        messageExamples: this.messageExamples,
        postExamples: this.postExamples,
        topics: this.topics,
        adjectives: this.adjectives,
        style: this.style,
        settings: this.settings,
        vrmUrl: this.vrmUrl
      };
    }
  
    static fromJSON(json) {
      return new Character(JSON.parse(json));
    }
  
    toJSON() {
      return JSON.stringify({
        id: this.id,
        name: this.name,
        description: this.description,
        vrmUrl: this.vrmUrl,
        modelProvider: this.modelProvider,
        clients: this.clients,
        bio: this.bio,
        lore: this.lore,
        knowledge: this.knowledge,
        messageExamples: this.messageExamples,
        postExamples: this.postExamples,
        topics: this.topics,
        adjectives: this.adjectives,
        style: this.style,
        settings: this.settings,
        createdAt: this.createdAt,
        status: this.status,
        publishedAt: this.publishedAt,
        worldInteractions: this.worldInteractions,
        availableActions: this.availableActions
      });
    }
  }
  