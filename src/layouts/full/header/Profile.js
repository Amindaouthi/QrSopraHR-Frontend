import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';

import { IconListCheck, IconMail, IconUser } from '@tabler/icons';
import ProfileImg from 'src/assets/images/profile/user-1.jpg'; // Default profile image

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [isAdmin , setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState(ProfileImg);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.roles !== null) {
          const userRoles = user.roles;
          if (userRoles.includes("ROLE_ADMIN")) {
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
          axios.get(`http://localhost:8080/api/user/${matricul}`)
            .then(response => {
              
              const base64Image = response.data?.imageBase64;
              if (base64Image) {
                const imageUrl = `data:image/jpeg;base64,${base64Image}`;
                setUserImage(imageUrl);
              } else {
                console.warn('No image found in API response');
              }
            })
            .catch(error => {
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
    <MenuItem component={Link} to="/modifierprofile">
      <ListItemIcon>
        <IconUser width={20} />
      </ListItemIcon>
      <ListItemText>{username}</ListItemText>
    </MenuItem>
  ) : (
    <MenuItem component={Link} to="/client/profile">
      <ListItemIcon>
        <IconUser width={20} />
      </ListItemIcon>
      <ListItemText>{username}</ListItemText>
    </MenuItem>
  )}

  {!isAdmin && (
    [
      <MenuItem key="my-questions" component={Link} to="/client/Mesquestions">
        <ListItemIcon>
          <IconMail width={20} />
        </ListItemIcon>
        <ListItemText>My Questions</ListItemText>
      </MenuItem>,
      <MenuItem key="my-answers" component={Link} to="/client/Mesanswers">
        <ListItemIcon>
          <IconListCheck width={20} />
        </ListItemIcon>
        <ListItemText>My Answers</ListItemText>
      </MenuItem>
    ]
  )}

  <Box mt={1} py={1} px={2}>
    <Button
      to="/auth/login"
      variant="outlined"
      color="primary"
      component={Link}
      fullWidth
      onClick={cleanLocalStorage}
    >
      Logout
    </Button>
  </Box>
</Menu>


    </Box>
  );
};

export default Profile;
