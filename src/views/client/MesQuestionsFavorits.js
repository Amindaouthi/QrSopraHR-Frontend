import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import NewNavbar from './homeComponents/NewNavbar';
import Sidebar from './homeComponents/sidebar';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

import { useTranslation } from 'react-i18next';

const QuestionStat = styled.div`
  text-align: center;
  display: inline-block;
  font-size: 1.2rem;
  color: #aaa;
  margin-top: 6px;
  span {
    font-size: 0.7rem;
    display: block;
    font-weight: 300;
    margin-top: 4px;
  }
`;

const QuestionTitleArea = styled.div`
  padding: 0px 30px;
`;

const Tag = styled.span`
  display: inline-block;
  margin-right: 5px;
  background-color: rgb(0 0 0 / 10%);
  color: #000000;
  padding: 7px;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const QuestionLink = styled(Link)`
  text-decoration: none;
  color: #bc1434;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 5px;
`;

const WhoAndWhen = styled.div`
  display: inline-block;
  color: #aaa;
  font-size: 0.8rem;
  float: right;
  padding: 10px 0;
`;



const StyledQuestionRow = styled.div`
  background-color: rgba(0, 0, 0, 0.01);
  padding: 15px 15px 10px;
  display: grid;
  grid-template-columns: repeat(3, 50px) 1fr;
  border: 1px solid grey;
  border-radius: 5px;
  margin-bottom: 20px;
  padding: 10px;
  margin-right: 10px;
  box-shadow: 1px 1px #888888;
`;

const FavoriteIcon = styled.div`
  &:hover {
    color: gold;
  }
  &.gold {
    color: gold;
  }
`;
const H2 = styled.h2`
  margin-top: 10%;
  font-size: 2em; /* Adjust the size as needed */
  font-weight: bold;
  color: #666666; /* Darker color for better readability */
  text-align: center; /* Center the heading */
  font-family: 'Arial', sans-serif; /* Change the font family as needed */
  text-transform: uppercase; /* Optional: Transform text to uppercase */
  letter-spacing: 1px; /* Optional: Add space between letters */
  padding-bottom: 10px; /* Optional: Add some padding below */
  border-bottom: 2px solid #ddd; /* Optional: Add a bottom border for a more defined look */
`;
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const MesQuestionsFavorites = () => {
  const [questions, setQuestions] = useState([]);
  const userData = JSON.parse(localStorage.getItem('user'));
  const userId = userData?.id;
  const token = localStorage.getItem('token');
  const {t} = useTranslation();


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/favorites/favorit/${userId}`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching favorite questions:', error);
      }
    };

    fetchQuestions();
  }, [userId]);

  const handleFavoriteQuestion = async (questionId) => {
    try {
      const question = questions.find((question) => question.id === questionId);

      if (!question) {
        console.error('Question not found');
        return;
      }

      const isQuestionFavorite = question.favorites && question.favorites.length > 0;

      if (isQuestionFavorite) {
        const favoriteId = question.favorites[0].id;
        const response = await axios.delete(`http://localhost:8080/api/favorites/${favoriteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          Swal.fire(t('Question removed from favorites'), '', 'success');
          setQuestions(questions.filter((q) => q.id !== questionId));
        } else {
          Swal.fire(t('Error in deletion'), '', 'error');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la requête pour supprimer la question comme favori :', error);
    }
  };

  const sortedQuestions = questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar className='h-100' />
        <div style={{ flex: 1 }}>
          <H2>{t('My Favorite Question')} </H2>
        <div style={{ padding: '20px' ,marginTop:"60px"}}>
          <p className='ms-2'>{t('Total favorite questions')} : {questions.length}</p>
          {sortedQuestions.map((question, index) => (
            <StyledQuestionRow key={index}>
              <QuestionStat>
                {question.votes ? question.votes.length : 0}
                <span>{t('votes')}</span>
              </QuestionStat>
              <QuestionStat>
                {question.answers ? question.answers.length : 0}
                <span>{t('answers')}</span>
              </QuestionStat>
              <QuestionStat>
                {typeof question.views === 'number' ? question.views : 0}
                <span>{t('views')}</span>
              </QuestionStat>
              <QuestionTitleArea>
                <QuestionLink to={`/client/question/${question.id}`}>
                  {question.title || 'No title'}
                </QuestionLink>
                <div>
                  {question.tags && question.tags.map((tag, tagIndex) => (
                    <Tag key={tagIndex}>
                      {typeof tag === 'object' ? tag.name : tag}
                    </Tag>
                  ))}
                </div>
                <WhoAndWhen>
                  {t('added')} {formatDate(question.createdAt)}
                </WhoAndWhen>
              </QuestionTitleArea>
              <FavoriteIcon
                className={`favorite-icon ${question.favorites && question.favorites.length > 0 ? 'gold' : ''}`}
                onClick={() => handleFavoriteQuestion(question.id)}
              >
                <FontAwesomeIcon icon={faStar} />
              </FavoriteIcon>
            </StyledQuestionRow>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
};

export default MesQuestionsFavorites;
