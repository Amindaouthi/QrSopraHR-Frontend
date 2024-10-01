import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';  // Import SweetAlert
import Sidebar from './sidebar';
import NewNavbar from './NewNavbar';
import Header2 from './Header2';
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

const UserLink = styled.a`
  color: #bc1434;
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
  margin-right:10px;
  box-shadow: 1px 1px #888888;
  position: relative;
`;

const EditDeleteIcons = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
  color: #bc1434;
  cursor: pointer;
`;

const DateInputsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const H2 = styled.h2`
  margin-top: 10%;
  font-size: 2em; /* Adjust the size as needed */
  font-weight: bold;
  color: #333; /* Darker color for better readability */
  text-align: center; /* Center the heading */
  font-family: 'Arial', sans-serif; /* Change the font family as needed */
  text-transform: uppercase; /* Optional: Transform text to uppercase */
  letter-spacing: 1px; /* Optional: Add space between letters */
  padding-bottom: 10px; /* Optional: Add some padding below */
  border-bottom: 2px solid #ddd; /* Optional: Add a bottom border for a more defined look */
`;

const MesQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('user'));
  const accessToken = userData?.accessToken;
  const userId = userData?.id;
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const navigate = useNavigate();
  const {t} =useTranslation();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/api/questions/by-user-and-date?userId=${userId}&startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setQuestions(response.data);
        console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [userId, startDate, endDate, accessToken]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleEditClick = (question) => {
    navigate('/client/askquestion', {
      state: { question, isEditMode: true },
    });
  };

  const handleDeleteClick = async (questionId) => {
    Swal.fire({
      title: t('Are you sure?'),
      text: t("You won't be able to revert this!"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('Yes, delete it!')
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://localhost:8082/api/questions/${questionId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setQuestions(questions.filter(question => question.id !== questionId));
          Swal.fire({
            title: t('Deleted!'),
            text: t('Your question has been deleted.'),
            icon: 'success'
          });
          console.log('Question deleted successfully:', response.data);
        } catch (error) {
          console.error('Error deleting question:', error);
          Swal.fire({
            title: t('Error'),
            text: t('An error occurred while deleting the question. Please try again later.'),
            icon: 'error'
          });
        }
      }
    });
  };

  const handleQuestionClick = (questionId) => {
    navigate(`/client/question/${questionId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const sortedQuestions = questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar className='h-100' />
        <div style={{ flex: 1 }}>
        <H2>{t('My questions')}</H2>
          <div style={{ padding: '20px' ,marginTop:"10px"}}>
            <DateInputsContainer style={{ marginLeft: "25%" }}> 
              <div>
              <label htmlFor="startDate">{t('Start Date:')}</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
              <label htmlFor="endDate">{t('End Date:')}</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </DateInputsContainer >
            <p>{t('Total questions')}: {questions.length}</p>
            {sortedQuestions.map((question, index) => (
              <StyledQuestionRow key={index} onClick={() => handleQuestionClick(question.id)}>
                <EditDeleteIcons>
                  <FontAwesomeIcon icon={faEdit} onClick={(e) => { e.stopPropagation(); handleEditClick(question); }} />
                  <FontAwesomeIcon icon={faTrash} onClick={(e) => { e.stopPropagation(); handleDeleteClick(question.id); }} />
                </EditDeleteIcons>
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
                  <QuestionLink to={`/questions/${question.id}`}>
                    {question.title || 'No title'}
                  </QuestionLink>
                  <div>{question.content}</div>
                  <div>
                    {question.tags && question.tags.map((tag, tagIndex) => (
                      <Tag key={tagIndex}>{typeof tag === 'object' ? tag.name : tag}</Tag>
                    ))}
                  </div>
                  <WhoAndWhen>
                    {t('asked')} {formatDate(question.createdAt)}
                  </WhoAndWhen>
                </QuestionTitleArea>
              </StyledQuestionRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesQuestions;