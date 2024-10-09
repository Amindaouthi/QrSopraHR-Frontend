import React, { useState, useEffect } from 'react';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import 'src/views/sample-page/ModifierProfil.css';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { MdOutlineInsertPhoto } from 'react-icons/md';
import Swal from 'sweetalert2';

const ModifierProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    username: '',
    password: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
      axios
        .get(`http://localhost:8083/api/user/${userId}`)
        .then((response) => {
          const { prenom, nom, email, username, imageBase64 } = response.data;
          setFormData((prev) => ({
            ...prev,
            prenom,
            nom,
            email,
            username,
            image: null, // Reset image on fetch
          }));
          if (imageBase64) {
            setImagePreview(`data:image/jpeg;base64,${imageBase64}`);
          }
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData((prevData) => ({
        ...prevData,
        image: file, // Store the File object for submission
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userData = JSON.parse(localStorage.getItem('user'));
    const accessToken = userData?.accessToken;
    const userId = userData?.id;

    if (!accessToken || !userId) {
      console.error('Access token or User ID is missing from localStorage');
      return;
    }

    if (
      !formData.prenom.trim() ||
      !formData.nom.trim() ||
      !formData.email.trim() ||
      !formData.username.trim()
    ) {
      setErrorMessage('All fields are required');
      return;
    }

    try {
      const role = userData.roles.includes('ROLE_ADMIN')
        ? 'admin'
        : userData.roles.includes('ROLE_MODERATOR')
        ? 'moderator'
        : 'user';
      const roles =
        role === 'admin'
          ? [{ name: 'ROLE_ADMIN' }]
          : role === 'moderator'
          ? [{ name: 'ROLE_MODERATOR' }]
          : [{ name: 'ROLE_USER' }];

      const userToSend = {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        username: formData.username,
        roles,
        ...(formData.password && { password: formData.password }),
      };

      const formDataToSend = new FormData();
      formDataToSend.append('user', JSON.stringify(userToSend));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.put(`http://localhost:8083/api/user/${userId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage('Profile updated successfully');
      setErrorMessage('');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');

      // Show success message and redirect to login page
      await Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been updated successfully. You will be redirected to the login page to log in again.',
        confirmButtonText: 'OK',
      });

      navigate('/auth/login');
    } catch (error) {
      setErrorMessage('Error updating profile');
      setSuccessMessage('');
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the profile. Please try again later.',
      });
    }
  };

  return (
    <PageContainer title="Modifier Profil" description="Modifier Profil">
      <DashboardCard title="Modifier Profil">
        <div className="testbox" style={{marginTop:"10px",marginBottom:"10px"}}>
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
                placeholder="Nom d'utilisateur"
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
                placeholder="Adresse e-mail"
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
                placeholder="Mot de passe"
              />
            </div>

            <div className="form-group item">
              <label>Image de profil</label>
              <div className="avatar-container">
                <img
                  src={imagePreview || 'https://bootdey.com/img/Content/avatar/avatar7.png'}
                  alt="User Avatar"
                  className="avatar-image"
                  style={{marginLeft:"50px"}}
                  
                />
                <input
                  type="file"
                  className="file-input"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                />
                <label htmlFor="image" className="file-label" style={{marginRight:"100px"}}>
                  <span className="file-label-text">Change</span>
                  <MdOutlineInsertPhoto />
                </label>
              </div>
            </div>

            <div className="btn-block">
              <button type="submit">Modifier</button>
            </div>
          </form>
        </div>
      </DashboardCard>

      {successMessage && <div className="success-message">{successMessage}</div>}

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </PageContainer>
  );
};

export default ModifierProfile;
