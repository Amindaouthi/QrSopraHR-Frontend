// src/services/voteService.js
import axios from 'axios';

const API_URL = 'http://localhost:8082/api/votes';



export const like = async (entityType, entityId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/like/${entityType}/${entityId}`, null, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error('Error liking entity:', error);
      throw error;
    }
  };
  
  // Fonction pour disliker une entité
  export const dislike = async (entityType, entityId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/dislike/${entityType}/${entityId}`, null, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error('Error disliking entity:', error);
      throw error;
    }
  };
  
  // Fonction pour obtenir le statut des votes (optionnel)
  export const getVoteStatus = async (entityType, entityId, userId) => {
    try {
      const response = await axios.get(`${API_URL}/status`, {
        params: { entityType, entityId, userId },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching vote status:', error);
      throw error;
    }
  };