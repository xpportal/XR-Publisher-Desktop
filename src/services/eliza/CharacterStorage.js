// src/services/eliza/CharacterStorage.js
import { Character } from './Character';

export class CharacterStorage {
    static async initializeStorage() {
      try {
        await window.electron.invoke('db:execute', `
          CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            vrmUrl TEXT,
            modelProvider TEXT,
            clients TEXT,
            bio TEXT,
            lore TEXT,
            knowledge TEXT,
            messageExamples TEXT,
            postExamples TEXT,
            topics TEXT,
            adjectives TEXT,
            style TEXT,
            settings TEXT,
            createdAt INTEGER,
            status TEXT,
            publishedAt INTEGER,
            worldInteractions TEXT,
            availableActions TEXT
          )
        `);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
        throw error;
      }
    }
  
    static async saveCharacter(character) {
      try {
        const serializedCharacter = {
          id: character.id,
          name: character.name,
          description: character.description,
          vrmUrl: character.vrmUrl,
          modelProvider: character.modelProvider,
          clients: JSON.stringify(character.clients || []),
          bio: JSON.stringify(character.bio || []),
          lore: JSON.stringify(character.lore || []),
          knowledge: JSON.stringify(character.knowledge || []),
          messageExamples: JSON.stringify(character.messageExamples || []),
          postExamples: JSON.stringify(character.postExamples || []),
          topics: JSON.stringify(character.topics || []),
          adjectives: JSON.stringify(character.adjectives || []),
          style: JSON.stringify(character.style || {}),
          settings: JSON.stringify(character.settings || {}),
          createdAt: character.createdAt || Date.now(),
          status: character.status || 'local',
          publishedAt: character.publishedAt || null,
          worldInteractions: JSON.stringify(character.worldInteractions || []),
          availableActions: JSON.stringify(character.availableActions || [])
        };
  
        const result = await window.electron.invoke('db:execute', `
          INSERT OR REPLACE INTO characters (
            id, name, description, vrmUrl, modelProvider, clients,
            bio, lore, knowledge, messageExamples, postExamples,
            topics, adjectives, style, settings, createdAt,
            status, publishedAt, worldInteractions, availableActions
          ) VALUES (
            $id, $name, $description, $vrmUrl, $modelProvider, $clients,
            $bio, $lore, $knowledge, $messageExamples, $postExamples,
            $topics, $adjectives, $style, $settings, $createdAt,
            $status, $publishedAt, $worldInteractions, $availableActions
          )
        `, serializedCharacter);
  
        return result;
      } catch (error) {
        console.error('Failed to save character:', error);
        throw error;
      }
    }
  
    static async getCharacters() {
      try {
        const rows = await window.electron.invoke('db:query', 'SELECT * FROM characters');
        if (!rows || !Array.isArray(rows)) {
          console.warn('No characters found or invalid data returned');
          return [];
        }
        
        return rows.map(row => {
          try {
            return new Character({
              ...row,
              clients: JSON.parse(row.clients || '[]'),
              bio: JSON.parse(row.bio || '[]'),
              lore: JSON.parse(row.lore || '[]'),
              knowledge: JSON.parse(row.knowledge || '[]'),
              messageExamples: JSON.parse(row.messageExamples || '[]'),
              postExamples: JSON.parse(row.postExamples || '[]'),
              topics: JSON.parse(row.topics || '[]'),
              adjectives: JSON.parse(row.adjectives || '[]'),
              style: JSON.parse(row.style || '{}'),
              settings: JSON.parse(row.settings || '{}'),
              worldInteractions: JSON.parse(row.worldInteractions || '[]'),
              availableActions: JSON.parse(row.availableActions || '[]')
            });
          } catch (e) {
            console.error('Failed to parse character data:', e, row);
            return null;
          }
        }).filter(Boolean); // Remove any null entries from failed parsing
      } catch (error) {
        console.error('Failed to get characters:', error);
        return [];
      }
    }
  
    static async deleteCharacter(id) {
      try {
        await window.electron.invoke('db:execute', 'DELETE FROM characters WHERE id = $id', { id });
      } catch (error) {
        console.error('Failed to delete character:', error);
        throw error;
      }
    }
  }