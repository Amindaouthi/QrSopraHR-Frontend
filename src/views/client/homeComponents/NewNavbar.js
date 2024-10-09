import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NewNavbar.css';
import sopra from 'src/assets/images/logos/sopra (2).svg';
import Profile from 'src/layouts/full/header/Profile';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { FaLanguage } from 'react-icons/fa6';
import LanguageSwitcher from 'src/languageSwitcher';
import { IoIosNotificationsOutline } from "react-icons/io";

import { useTranslation } from 'react-i18next';

const NewNavbar = () => {
  const navigate = useNavigate(); // Utilisation de useNavigate pour la navigation
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8083/api/notifications/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const fetchedNotifications = response.data;
        setNotifications(fetchedNotifications);
        setUnreadNotifications(fetchedNotifications.filter(notification => !notification.read));
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const logout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('since');
    localStorage.removeItem('Usertype');
    window.location.reload(true);
    navigate('/');
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Marquer toutes les notifications comme lues lorsque le dropdown est ouvert
      const token = localStorage.getItem('token');
      axios.put('http://localhost:8083/api/notifications/mark-all-as-read', null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        setUnreadNotifications([]);
      }).catch(error => {
        console.error('Error marking notifications as read:', error);
      });
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8083/api/notifications/${notificationId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Mettre à jour l'état pour marquer la notification comme lue
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      setUnreadNotifications(updatedNotifications.filter(notification => !notification.read));
      
      // Rediriger vers la question correspondante
      const notification = notifications.find(notification => notification.id === notificationId);
      if (notification) {
        navigate(`/client/question/${notification.questionId}`);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-light"
         style={{ boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px', position: 'fixed', top: 0, zIndex: 9999, width: '100%' }}>
      <div className="container-fluid" style={{ height: '50px' }}>
        <div className="navbar-brand d-flex" style={{ fontWeight: 500, color: 'black', paddingTop: '10px' }}>
          <a href="/client/home" style={{ marginLeft: '10px', textDecoration: 'none' }}>
            <img src={sopra} alt="logo" style={{ width: '80px', height: '80px', marginRight: '20px' }} />
          </a>
        </div>

        <div className="collapse navbar-collapse" id="navbarScroll">
          <ul className="navbar-nav me-auto my-2 my-lg-0 navbar-nav-scroll" style={{ bsScrollHeight: '100px' }}></ul>

          <form className="d-flex me-auto" style={{ width: '600px', marginRight: '10px', marginLeft: '70px' }}>
            <input
              className="form-control me-2"
              id="searchQue"
              type="search"
              placeholder={t('Search')}
              aria-label="Search"
            />
            <button className="btn btn-outline-danger" type="submit">
              {t('Search')}
            </button>
          </form>

          <div className="notification-icon" style={{ marginRight: '30px', cursor: 'pointer' }} onClick={toggleNotifications}>
            <IoMdNotificationsOutline style={{ width: '25px', height: '25px' }} />
            <span className="badge rounded-pill badge-notification bg-danger">{unreadNotifications.length}</span>
          </div>

          {/* Dropdown pour les notifications */}
          {showNotifications && (
            <div className="notifications-dropdown">
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <IoIosNotificationsOutline style={{ marginRight: '8px',fontSize: '40px' }} />
                      <p style={{ color: 'black', margin: 0 }}>{notification.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No unread notifications</p>
              )}
            </div>
          )}

          <ul className="navbar-nav">
            <LanguageSwitcher style={{ marginBottom: '20px' }} />

            {!localStorage.getItem('Usertype') && (
              <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                <Profile />
              </div>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NewNavbar;
