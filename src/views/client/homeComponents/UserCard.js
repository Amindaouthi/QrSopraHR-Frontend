import React, { useState } from 'react';
import '../homeComponents/UserCard.css';
import { useNavigate } from 'react-router-dom';
import { IoIosChatbubbles } from 'react-icons/io';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';


const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 170px;
  height: 300px;
  margin: 20px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const UserImage = styled.img`
  width: 100%;
  height: 100%;  // Reduced height to make room for more text
  object-fit: cover;
  cursor: pointer;
`;

const UserInfo = styled.div`
  padding: 10px;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Username = styled.h2`
  font-size: 0.9em;
  margin: 5px 30px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Email = styled.p`
  font-size: 0.75em;
  margin: 2px 0;
  color: #777;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Score = styled.p`
  font-size: 0.8em;
  margin: 5px 0;
  color: rgb(207, 2, 43);
`;

const ChatIconContainer = styled.div`
  margin-top: 5px;
  cursor: pointer;
  font-size: 1.2em;
  color: #grey;

  &:hover {
    color: #grey;
  }
`;

const UserCard = ({ id, username, email, reputation, imageBase64, onChatClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(`/client/user?id=${id}`);
  };

  const userImage = imageBase64
    ? `data:image/jpeg;base64,${imageBase64}`
    : 'https://bootdey.com/img/Content/avatar/avatar7.png';

  return (
    <Card>
      <UserImage
        src={userImage}
        alt="User Image"
        onClick={handleClick}
      />
      <UserInfo>
        <Username>{username}</Username>
        <Email>{email}</Email>
        {t('Score')}: {reputation?.score !== undefined ? reputation.score : t('No Score')}
        <ChatIconContainer onClick={() => onChatClick(id, username)}>
          <IoIosChatbubbles />
        </ChatIconContainer>
      </UserInfo>
    </Card>
  );
};
export default UserCard;

