import { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import NewNavbar from './homeComponents/NewNavbar';
import './UserProfile.css';
import { createGlobalStyle } from 'styled-components';
import { MdOutlineInsertPhoto } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const GlobalStyle = createGlobalStyle`
@import url('https://fonts.googleapis.com/css2?family=PlusJakartaSans:wght@300,400;700&display=swap');
body{
    background: #FFF;
    color: #000000;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
b, strong{}
a{color: #fff;}
p{margin: 10px 0; line-height: 1.5rem;}
h1, h2{margin-top: 20px; margin-bottom: 10px;}
h1{font-size: 1.8rem;}
h2{font-size: 1.6rem;}
blockquote{background-color: rgba(0,0,0,0.1); padding: 15px; border-radius: 4px;}
`;

const Container = styled.div`
  padding: 70px 20px;
`;

function ProfilePage() {
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
  const [successMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const {t} =useTranslation();


  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('user'))?.id;
    if (userId) {
      axios
        .get(`http://localhost:8080/api/user/${userId}`)
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
      const role = JSON.parse(localStorage.getItem('user')).roles.includes('ROLE_MODERATOR')
        ? 'moderator'
        : 'user';
      const roles = role === 'moderator' ? [{ name: 'ROLE_MODERATOR' }] : [{ name: 'ROLE_USER' }];

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

      await axios.put(`http://localhost:8080/api/user/${userId}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Logout the user
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');

      // Show success message and redirect to login page
      await Swal.fire({
        icon: 'success',
        title: t('Profile Updated'),
        text: t(
          'Your profile has been updated successfully. You will be redirected to the login page to log in again.',
        ),
        confirmButtonText: t('OK'),
      });

      navigate('/auth/login'); // Redirect to login page
    } catch (error) {
      setErrorMessage('Error updating profile');
      await Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: t('An error occurred while updating the profile. Please try again later.'),
      });
    }
  };

  return (
    <>
      <GlobalStyle />
      <NewNavbar />
      <Container style={{ paddingTop: '110px' }}>
        <div className="container">
          <div className="row gutters">
            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
              <div className="card h-100">
                <div className="card-body">
                  <div className="account-settings">
                    <div className="user-profile">
                      <div className="user-avatar">
                        <div className="avatar-container">
                          <img
                            src={
                              imagePreview || 'https://bootdey.com/img/Content/avatar/avatar7.png'
                            }
                            alt="User Avatar"
                            className="avatar-image"
                            style={{ marginLeft: '75%' }}
                          />
                          <input
                            type="file"
                            className="file-input"
                            id="image"
                            name="image"
                            onChange={handleImageChange}
                          />
                          <label htmlFor="image" className="file-label">
                            <span className="file-label-text">{t('Change')}</span>
                            <MdOutlineInsertPhoto />
                          </label>
                        </div>
                      </div>
                      <h5 className="user-name">{formData.username}</h5>
                      <h6 className="user-email">{formData.email}</h6>
                    </div>
                    <div className="about">
                      <h5 style={{ color: '#cf022b' }}>About</h5>
                      <p>
                        {t(
                          "I'm {{username}}. Full Stack Designer I enjoy creating user-centric, delightful and human experiences.",
                          {
                            username: formData.username,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
              <div className="card h-100">
                <div className="card-body">
                  <div className="row gutters">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                      <h6 className="mb-2 text" style={{ color: '#cf022b' }}>
                        {t('Personal Details')}
                      </h6>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label htmlFor="username">{t('Username')}</label>
                        <input
                          type="text"
                          className="form-control"
                          id="username"
                          name="username"
                          placeholder={t('Enter your new username')}
                          value={formData.username}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label htmlFor="email">{t('Email')}</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          placeholder={t('Enter email ID')}
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label htmlFor="nom">{t('Nom')}</label>
                        <input
                          type="text"
                          className="form-control"
                          id="nom"
                          name="nom"
                          placeholder={t('Enter your new nom')}
                          value={formData.nom}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label htmlFor="prenom">{t('Prenom')}</label>
                        <input
                          type="text"
                          className="form-control"
                          id="prenom"
                          name="prenom"
                          placeholder={t('Enter your new prenom')}
                          value={formData.prenom}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row gutters">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                      <h6 className="mt-3 mb-2 text" style={{ color: '#cf022b' }}>
                        {t('Password')}
                      </h6>
                    </div>
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-12">
                      <div className="form-group">
                        <label htmlFor="password">{t('New Password')}</label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          name="password"
                          placeholder={t('Enter your new password')}
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row gutters" style={{ marginTop: '20px' }}>
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12">
                      <div className="text-right" style={{ spaceBetween: '1px' }}>
                        <Link
                          to="/client/questionpage"
                          className="btn btn-secondary"
                          style={{ marginRight: '10px' }}
                        >
                          {t('Cancel')}
                        </Link>
                        <button
                          type="button"
                          className="btn"
                          style={{ marginRight: '20px', backgroundColor: '#cf022b', color: '#fff' }}
                          onClick={handleSubmit}
                        >
                          {t('Update')}
                        </button>
                      </div>
                      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default ProfilePage;
