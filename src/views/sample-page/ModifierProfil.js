import React, { useState } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import 'src/views/sample-page/ModifierProfil.css';
import axios from 'axios';
import { useNavigate } from 'react-router';

const ModifierProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    username: '',
    password: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const userData = JSON.parse(localStorage.getItem('user'));
  const accessToken = userData.accessToken;
  const userId = userData.id;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!accessToken || !userId) {
      console.error('User ID or access token is missing from localStorage');
      return;
    }

    if (
      !formData.prenom.trim() ||
      !formData.nom.trim() ||
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.password.trim()
    ) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/user/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      alert('User modification succeeded');
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage('Error updating profile');
      setSuccessMessage('');
    }
  };

  return (
    <PageContainer title="Modifier Profil" description="Modifier Profil">
      <DashboardCard title="Modifier Profil">
        <div className="testbox">
          <form id="formMP" onSubmit={handleSubmit}>
            <div className="form-group item">
              <label>Nom complet *</label>
              <div className="name-fields">
                <input
                  type="text"
                  name="prenom"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="nom"
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            

            <div className="form-group item">
              <label>Nom d'utilisateur *</label>
              <input
                type="text"
                name="username"
                
                value={formData.username}
                onChange={handleChange}
                placeholder={userData.username}
                required
              />
            </div>
            <div className="form-group item">
              <label>Adresse e-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={userData.email}
                required
              />
            </div>

            <div className="form-group item">
              <label>Mot de passe *</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="btn-block">
              <button type="submit">Modifier</button>
            </div>
          </form>
        </div>
      </DashboardCard>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
    </PageContainer>
  );
};

export default ModifierProfile;
