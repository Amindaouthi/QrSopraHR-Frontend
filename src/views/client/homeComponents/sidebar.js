import React, { useState, useEffect } from 'react';
import './sidebar.css';
import { BsQuestionCircle, BsTag, BsPerson, BsStar } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';

const SidebarOption = ({ title, children }) => {
  return (
    <div className="sidebar-option">
      <p>{title}</p>
      <div className="link" style={{ marginRight: '20px' }}>
        {children}
      </div>
    </div>
  );
};

const Sidebar = () => {
  const { t } = useTranslation();
  const [sidebarHeight, setSidebarHeight] = useState('auto');
  const location = useLocation();

  useEffect(() => {
    const checkPageHeight = () => {
      const pageHeight = document.documentElement.scrollHeight; // Total height of the page
      if (pageHeight < 800) {
        setSidebarHeight('800px');
      } else {
        setSidebarHeight('110%');
      }
    };

    checkPageHeight();
    window.addEventListener('resize', checkPageHeight); // Recalculate on window resize

    return () => {
      window.removeEventListener('resize', checkPageHeight);
    };
  }, []);

  const getLinkStyle = (path) => {
    return location.pathname === path
      ? { backgroundColor: '#bc1434', color: '#fff', borderRadius: '10px' }
      : { color: '#000' };
  };

  return (
    <div className="">
      <div
        style={{
          height: sidebarHeight,
          minHeight: '110%',
          backgroundColor: '#f0f0f0',
          width: '250px',
        }}
      >
        <div
          className="d-flex flex-column flex-shrink-0 p-3 bg-light"
          style={{ width: '250px', height: '100%', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)' }}
        >
          <Link
            to="/"
            className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none"
          >
            <svg className="bi me-2" width={40} height={32}>
              <use xlinkHref="#bootstrap" />
            </svg>
          </Link>
          <hr />
          <ul className="nav nav-pills flex-column mb-auto pt-3">
            <li>
              <Link
                to="/client/questionpage"
                className={`nav-link link-dark ${location.pathname === '/client/questionpage' ? 'active' : ''}`}
                style={getLinkStyle('/client/questionpage')}
              >
                <BsQuestionCircle className="me-2" style={{ fontSize: '1.5rem' }} />
                {t('Question')}
              </Link>
            </li>
            <li>
              <Link
                to="/client/tags"
                className={`nav-link link-dark ${location.pathname === '/client/tags' ? 'active' : ''}`}
                style={getLinkStyle('/client/tags')}
              >
                <BsTag className="me-2" style={{ fontSize: '1.5rem' }} />
                {t('Tags')}
              </Link>
            </li>
            <li>
              <Link
                to="/client/Customers"
                className={`nav-link link-dark ${location.pathname === '/client/Customers' ? 'active' : ''}`}
                style={getLinkStyle('/client/Customers')}
              >
                <BsPerson className="me-2" style={{ fontSize: '1.5rem' }} />
                {t('Customers')}
              </Link>
            </li>
            <li>
              <Link
                to="/client/MesQuestionsFavorits"
                className={`nav-link link-dark ${location.pathname === '/client/MesQuestionsFavorits' ? 'active' : ''}`}
                style={getLinkStyle('/client/MesQuestionsFavorits')}
              >
                <BsStar className="me-2" style={{ fontSize: '1.5rem' }} />
                <span style={{ paddingTop: '6px' }}>{t('Favoris')}</span>
              </Link>
            </li>
          </ul>
          <hr />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
