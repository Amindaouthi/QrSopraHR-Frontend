
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './UserAvatar.css';

const UserAvatar = ({ userId }) => {
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    const fetchUserById = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8083/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserImage(response.data.image);
      } catch (error) {
        console.error(`Error fetching user data for userId ${userId}: ${error.message}`);
      }
    };

    fetchUserById();
  }, [userId]);

  return (
    <div className="user-avatar">
      {userImage ? (
        <img
          src={`data:image/jpeg;base64,${userImage}`}
          alt={`User ${userId}`}
        />
      ) : (
        <FontAwesomeIcon
          icon="user"
          className="user-icon"
        />
      )}
    </div>
  );
};

export default UserAvatar;
