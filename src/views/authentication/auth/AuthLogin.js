import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';

const AuthLogin = ({ title, subtitle, subtext }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Get the navigate function from react-router-dom;

  useEffect(() => {
    const userDataString = localStorage.getItem('user');

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        const userRole = userData.roles && userData.roles.length > 0 ? userData.roles[0] : null;

        if (userRole === 'ROLE_ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/client/home');
        }}catch {
console.log('erreur');

        }}
    }, []);
    
    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:8083/api/auth/signin', {
                username,
                password
            });
            
            if (response.data && response.data.accessToken) {
                const token = response.data.accessToken;
                const user = response.data;
                
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                const userRole = user.roles && user.roles.length > 0 ? user.roles[0] : null;
    
                if (userRole === 'ROLE_ADMIN') {
                    navigate('/dashboard');
                } else {
                    navigate('/client/home');
                }
            } else {
                setError('Nom d\'utilisateur ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      } ;

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            style={{ color: 'black' }}
            htmlFor="username"
            mb="5px"
          >
            Username
          </Typography>
          <CustomTextField
            id="username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Box>
        <Box mt="25px">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            style={{ color: 'black' }}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password 
          </Typography>
          <CustomTextField
            id="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
        <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
          <FormGroup>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Remember this Device" />
          </FormGroup>
          <Typography
            component={Link}
            to="/auth/ResetPassword"
            fontWeight="500"
            sx={{
              textDecoration: 'none',
              color: 'primary.main',
            }}
          >
            Reset Password ?
          </Typography>
        </Stack>
      </Stack>
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          onClick={handleLogin}
        >
          Sign In
        </Button>
      </Box>
      {error && (
        <Typography variant="subtitle1" color="error">
          {error}
        </Typography>
      )}
      {subtitle}
    </>
  );
};

export default AuthLogin;
