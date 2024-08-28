import React, { useEffect, useState } from 'react';
import NewNavbar from './homeComponents/NewNavbar';
import Sidebar from './homeComponents/sidebar';
import '../client/Customers.css';
import UserCard from './homeComponents/UserCard';
import axios from 'axios';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

// Styled components for the chat UI
const Chatbox = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  width: 360px;
  height: 400px;
  background: #ffffff;
  border: 1px solid #ddd;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const SendButton = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #45a049;
  }

  &:active {
    background-color: #3e8e41;
  }
`;

const ChatHeader = styled.div`
  background: grey;
  color: white;
  padding: 12px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  background: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChatFooter = styled.div`
  padding: 10px;
  border-top: 1px solid #ddd;
  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MessageInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  box-sizing: border-box;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  width: 30px;
  border-radius: 2px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  background-color: ${({ $isSender }) => ($isSender ? '#dc3545' : '#f1f1f1')};
  color: ${({ $isSender }) => ($isSender ? '#ffffff' : '#000000')};
  align-self: ${({ $isSender }) => ($isSender ? 'flex-end' : 'flex-start')};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${({ $isSender }) =>
      $isSender
        ? `
        right: -10px;
        border-left: 10px solid #4CAF50;
      `
        : `
        left: -10px;
        border-right: 10px solid #f1f1f1;
      `}
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }
`;

const Timestamp = styled.span`
  display: block;
  margin-top: 5px;
  font-size: 0.8rem;
  color: #777;
  text-align: ${({ $isSender }) => ($isSender ? 'right' : 'left')};
`;

const H1 = styled.h1`
  margin-top: 3%; /* Slight margin to give space at the top */
  font-size: 2em; /* A moderate font size */
  font-weight: 600; /* Semi-bold for a balanced emphasis */
  color: #666666; /* Subtle black color with slight transparency */
  text-align: center; /* Center the heading */
  font-family: 'Arial', sans-serif; /* Clean, sans-serif font */
  letter-spacing: 0.5px; /* Subtle letter spacing */
  padding-bottom: 8px; /* Gentle padding below the text */
  border-bottom: 1px solid #ccc; /* A fine, light border for definition */
  line-height: 1.4; /* Improved line spacing for readability */
`;

const Customers = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const senderId = user?.id;
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [currentChatUserId, setCurrentChatUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch users from the backend
    axios
      .get('http://localhost:8080/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          try {
            const userData = JSON.parse(userDataString);
            const filteredUsers = response.data.filter(
              (user) => user.matricul !== parseInt(userData.id)
            );
            setUsers(filteredUsers);
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        } else {
          setUsers(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching users:', error);
      });

    // Set up WebSocket connection
    const socket = new SockJS('http://localhost:8080/chat-websocket');
    const client = new Client();

    client.configure({
      webSocketFactory: () => socket,
      onConnect: (frame) => {
        console.log('Connected to WebSocket server');
      },
      onStompError: (frame) => {
        console.error('Error connecting to WebSocket:', frame);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    if (stompClient && currentChatUserId) {
      if (stompClient.connected) {
        const subscription = stompClient.subscribe(
          `/user/${senderId}/queue/messages`,
          (message) => {
            if (message.body) {
              try {
                const incomingMessage = JSON.parse(message.body);
                const formattedTimestamp = moment(incomingMessage.timestamp).format('HH:mm');
                
                setMessages((prevMessages) => [
                  ...prevMessages,
                  {
                    ...incomingMessage,
                    timestamp: formattedTimestamp, // Format the timestamp for display
                  },
                ]);
              } catch (error) {
                console.error('Error parsing message:', error);
              }
            }
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      }
    }
  }, [stompClient, currentChatUserId, senderId]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChatClick = (id, username) => {
    setCurrentChatUser(username);
    setCurrentChatUserId(id);
    setIsChatboxOpen(true);
    setMessages([]); // Clear messages when starting a new chat

    // Retrieve historical messages between the current user and the selected user
    axios
      .get(`http://localhost:8080/messages/${senderId}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((response) => {
        console.log(response);
        setMessages(response.data);
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  };

  const handleCloseChatbox = () => {
    setIsChatboxOpen(false);
    setCurrentChatUser(null);
    setCurrentChatUserId(null);
    setMessages([]); // Clear messages when chat is closed
  };

  const handleSendMessage = () => {
    if (messageInput.trim() === '') {
      return; // Do nothing if the input is empty
    }

    if (stompClient && currentChatUserId) {
      if (stompClient.connected) {
        const message = {
          content: messageInput,
          senderId: senderId,
          receiverId: currentChatUserId,
          timestamp: new Date(), // Use the current timestamp in ISO 8601 format
        };

        console.log('Sending message: ', message);

        stompClient.publish({
          destination: '/app/chat',
          body: JSON.stringify(message),
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            ...message,
            sender: 'You',
            timestamp: moment().format('HH:mm'), // Display the time in HH:mm format
          },
        ]);
        setMessageInput('');
      } else {
        console.error('STOMP client is not connected.');
      }
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
          <div style={{ marginTop: '13vh', zIndex: 1, backgroundColor: 'white' }}>
            <div className="main" style={{ marginTop: '10px' }}>
              <H1>{t('Users')}</H1>

              <div
                className="search-bar"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  margin: '20px auto',
                  marginTop: '60px',
                  width: '100%',
                  maxWidth: '400px',
                }}
              >
                <TextField
                  type="text"
                  placeholder={t('Find a user')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  style={{
                    marginTop: '10px',
                    width: '350px',
                    height: '40px',
                    border: '1px',
                    borderRadius: '10%',
                    boxShadow: '1px rgba(0, 0, 0, 0.1)',
                    background: '#fff',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>
              <div className="mt-12 mb-4 user-cards-container">
                {filteredUsers.map((user) => (
                  <UserCard
                    imageBase64={user.imageBase64}
                    key={user.matricul}
                    id={user.matricul}
                    username={user.username}
                    email={user.email}
                    reputation={user.reputation}
                    onChatClick={(id, username) => handleChatClick(id, username)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isChatboxOpen && (
        <Chatbox>
          <ChatHeader>
            <span>Chat with {currentChatUser}</span>
            <CloseButton onClick={handleCloseChatbox}>×</CloseButton>
          </ChatHeader>
          <ChatBody>
            {messages.map((msg, index) => (
              <MessageBubble key={index} $isSender={msg.senderId === senderId}>
                <strong>{msg.senderId === senderId ? 'You' : currentChatUser}: </strong>
                {msg.content}
                <Timestamp $isSender={msg.senderId === senderId}>
                  {msg.timestamp}
                </Timestamp>
              </MessageBubble>
            ))}
          </ChatBody>

          <ChatFooter>
            <MessageInput
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <SendButton onClick={handleSendMessage}>Send</SendButton>
          </ChatFooter>
        </Chatbox>
      )}
    </>
  );
};

export default Customers;
