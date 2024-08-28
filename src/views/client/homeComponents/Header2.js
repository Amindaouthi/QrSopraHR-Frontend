import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './Header2.css';
import { useTranslation } from 'react-i18next';

function Header2({ onDataUpdate  }) {
  const [activeFilter, setActiveFilter] = useState('');
const {t}=useTranslation();
  useEffect(() => {
    fetchQuestions();
    console.log('response',onDataUpdate);
  }, [activeFilter]);

  const fetchQuestions = async () => {
    try {
      let response;
      if (activeFilter === 'answered') {
        response = await axios.get('http://localhost:8080/api/questions/questionsWithAnswers');
      } else if (activeFilter === 'unanswered') {
        response = await axios.get('http://localhost:8080/api/questions/questionsWithoutAnswers');
      } else if (activeFilter === 'votes') {
        response = await axios.get('http://localhost:8080/api/questions/sorted-by-votes');
      }

      const questions = response.data;
      console.log('response',response.data);
      onDataUpdate(questions); // Envoyer les données mises à jour au parent
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleFilterChange = (filter) => {
    if (filter === activeFilter) {
     // onAllQuestionsClick();
      setActiveFilter('');
      return;
    }
    setActiveFilter(filter);
  };

  const activeTabStyle = {
    backgroundColor: '#cf022b',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    textDecoration: 'none'
  };

  const tabStyle = {
    padding: '10px',
    borderRadius: '5px',
    textDecoration: 'none',
    color: '#000'
  };

  return (
    <div className="main" style={{ marginTop: '70px', width: 'auto' }}>
    <div className="main-container">
      <div className="main-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: '0', marginRight: 'auto', marginLeft: '5px' }}>{t('allQ')}</h2>
        <NavLink to="/client/askquestion">
          <button className="btn" style={{ marginRight: '20px', backgroundColor: '#cf022b', color: '#fff' }}>
            {t('Ask Question')}
          </button>
        </NavLink>
      </div>
      <div className="main-desc">
        <p style={{ marginLeft: '5px' }}>Questions</p>
        <div className="main-filter">
          <div className="main-tabs">
            <NavLink
              className={`main-tab ${activeFilter === 'answered' ? 'active-tab' : ''}`}
              style={activeFilter === 'answered' ? activeTabStyle : tabStyle}
              onClick={() => handleFilterChange('answered')}
            >
              {t('Answered')}
            </NavLink>
            <NavLink
              className={`main-tab ${activeFilter === 'votes' ? 'active-tab' : ''}`}
              style={activeFilter === 'votes' ? activeTabStyle : tabStyle}
              onClick={() => handleFilterChange('votes')}
            >
              votes
            </NavLink>
            <NavLink
              className={`main-tab ${activeFilter === 'unanswered' ? 'active-tab' : ''}`}
              style={activeFilter === 'unanswered' ? activeTabStyle : tabStyle}
              onClick={() => handleFilterChange('unanswered')}
            >
              {t('Unanswered')}
            </NavLink>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  </div>
  
  );
}

export default Header2;
