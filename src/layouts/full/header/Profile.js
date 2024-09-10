import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { IconListCheck, IconMail, IconUser } from '@tabler/icons';
import ProfileImg from 'src/assets/images/profile/user-1.jpg'; // Default profile image
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState(ProfileImg);
  const navigate = useNavigate(); // Initialize navigate
const {t} = useTranslation();
  // Custom SVG icon as a React component
  const ReportAnalyticsIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="icon icon-tabler icon-tabler-report-analytics"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="#2c3e50"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" />
      <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" />
      <path d="M9 17v-5" />
      <path d="M12 17v-1" />
      <path d="M15 17v-3" />
    </svg>
  );

  // Retrieve user data from local storage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const id = user.id || ''; // Default to empty string if ID is not found

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.roles !== null) {
          const userRoles = user.roles;
          if (userRoles.includes('ROLE_ADMIN')) {
            setIsAdmin(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error.message);
      }
    };

    fetchUserRoles();
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setUsername(userData.username);
        const matricul = userData.id;
        if (matricul) {
          axios
            .get(`http://localhost:8080/api/user/${matricul}`)
            .then((response) => {
              const base64Image = response.data?.imageBase64;
              if (base64Image) {
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;
                setUserImage(imageUrl);
              } else {
                console.warn('No image found in API response');
              }
            })
            .catch((error) => {
              console.error('Error fetching user image:', error);
            });
        } else {
          console.warn('No matricul found in localStorage');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      console.warn('No user data found in localStorage');
    }
  }, []);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const cleanLocalStorage = () => {
    localStorage.clear();
  };

  // Function to handle navigation
  const handleNavigateToStats = () => {
    navigate(`/client/user?id=${id}`);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={userImage}
          alt="Profile"
          sx={{
            width: 35,
            height: 35,
            objectFit: 'cover',
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ProfileImg;
          }}
        />
      </IconButton>
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        {isAdmin ? (
          <MenuItem key="admin-profile" component={Link} to="/modifierprofile">
            <ListItemIcon>
              <IconUser width={20} />
            </ListItemIcon>
            <ListItemText>{username}</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem key="client-profile" component={Link} to="/client/profile">
            <ListItemIcon>
              <IconUser width={20} />
            </ListItemIcon>
            <ListItemText>{username}</ListItemText>
          </MenuItem>
        )}

        {!isAdmin && [
          <MenuItem key="my-questions" component={Link} to="/client/Mesquestions">
            <ListItemIcon>
              <IconMail width={20} />
            </ListItemIcon>
            <ListItemText>{t('My Questions')}</ListItemText>
          </MenuItem>,
          <MenuItem key="my-answers" component={Link} to="/client/Mesanswers">
            <ListItemIcon>
              <IconListCheck width={20} />
            </ListItemIcon>
            <ListItemText>{t('My Answers')}</ListItemText>
          </MenuItem>,
          <MenuItem key="my-answers-response" component={Link} to="/client/Mesanswersreponse">
            <ListItemIcon>
              <IconListCheck width={20} />
            </ListItemIcon>
            <ListItemText>{t('My Answers Response')}</ListItemText>
          </MenuItem>,
          // Ajout d'un nouveau lien avec la navigation
          <MenuItem key="new-link" onClick={handleNavigateToStats}>
            <ListItemIcon>
              <ReportAnalyticsIcon /> {/* Utilisez l'icône appropriée */}
            </ListItemIcon>
            <ListItemText>{t('My Statis')}</ListItemText>
          </MenuItem>,
        ]}

        <Box mt={1} py={1} px={2}>
          <Button
            to="/auth/login"
            variant="outlined"
            color="primary"
            component={Link}
            fullWidth
            onClick={cleanLocalStorage}
          >
            {t('Logout')}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
