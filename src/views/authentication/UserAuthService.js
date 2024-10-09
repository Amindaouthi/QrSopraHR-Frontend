import axios from 'axios';

class UserAuthService {
  async login(username, password) {
    try {
      const response = await axios.post('http://localhost:8083/api/auth/signin', {
        username,
        password
      });

      if (response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        const user = response.data.user;
        const userRoles = response.data.user_roles;
        const userId = user.userId;
        this.setToken(token);
        this.setRoles(userRoles);
        this.setUserData(user);
        localStorage.setItem('userId', userId); // Stocke l'ID de l'utilisateur localement

        return true; // Connexion réussie
      } else {
        return false; // Nom d'utilisateur ou mot de passe incorrect
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error('Une erreur est survenue lors de la connexion.');
    }
  }

  setToken(token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  setRoles(roles) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  async getUserInfo() {
    try {
      const userId = this.getUserId(); // Supposons que vous avez une méthode pour obtenir l'ID de l'utilisateur
      const response = await axios.get(`http://localhost:8083/api/user-roles/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      return response.data; // Retourne les informations sur l'utilisateur depuis le backend
    } catch (error) {
      console.error('Erreur lors de la récupération des informations sur l\'utilisateur:', error);
      throw error;
    }
  }

  getUserId() {
    return localStorage.getItem('userId');
  }

  setUserData(userData) {
    localStorage.setItem('userData', JSON.stringify(userData));
  }
}

export default new UserAuthService();
