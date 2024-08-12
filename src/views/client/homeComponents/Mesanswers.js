import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import Sidebar from './sidebar';
import NewNavbar from './NewNavbar';

const MySwal = withReactContent(Swal);

const AnswerStat = styled.div`
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

const AnswerTitleArea = styled.div`
  padding: 0px 30px;
`;

const AnswerLink = styled.div`
  text-decoration: none;
  color: #bc1434;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 5px;
  cursor: pointer;
`;

const WhoAndWhen = styled.div`
  display: inline-block;
  color: #aaa;
  font-size: 0.8rem;
  float: right;
  padding: 10px 0;
`;

const StyledAnswerRow = styled.div`
  background-color: rgba(0, 0, 0, 0.01);
  padding: 15px 15px 10px;
  display: grid;
  grid-template-columns: 1fr;
  border: 1px solid grey;
  border-radius: 5px;
  margin-bottom: 20px;
  padding: 10px;
  margin-right: 10px;
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

const AnswersPage = () => {
  const userData = JSON.parse(localStorage.getItem('user'));
  const accessToken = userData?.accessToken;
  const userId = userData?.id;
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState({ id: null, content: '' });
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const navigate = useNavigate();

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/questions/byuseranddate?userId=${userId}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      setAnswers(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, [userId, startDate, endDate, accessToken]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleEditClick = async (questionId, answerId) => {
    const selected = answers.find((answer) => answer.id === answerId);
    if (!selected) {
      console.error(`Answer with id ${answerId} not found.`);
      return;
    }

    const { value: formData } = await MySwal.fire({
      title: 'Edit Answer',
      html: `
            <textarea id="swal-textarea" style="width: 100%; min-height: 100px;">${
              selected.content || ''
            }</textarea>
            <input type="file" id="swal-file" style="margin-top: 10px;" />
        `,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Save Changes',
      preConfirm: () => {
        const content = document.querySelector('#swal-textarea').value;
        const fileInput = document.querySelector('#swal-file');
        const file = fileInput.files[0];

        if (!content && !file) {
          MySwal.showValidationMessage('Content or file must be provided');
        }
        return { content, file };
      },
    });

    if (formData) {
      const { content, file } = formData;

      // Prepare form data for submission
      const updateFormData = new FormData();
      updateFormData.append('content', content);

      if (file) {
        updateFormData.append('file', file);
      }

      try {
        await axios.put(
          `http://localhost:8080/api/questions/${questionId}/answers/${answerId}`,
          updateFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        MySwal.fire({
          title: 'Updated!',
          text: 'Your answer has been updated.',
          icon: 'success',
        });
        fetchAnswers(); // Refresh answers
      } catch (error) {
        console.error('Error updating answer:', error);
        MySwal.fire({
          title: 'Error!',
          text: 'Failed to update answer.',
          icon: 'error',
        });
      }
    }
  };

  const handleDeleteClick = async (answerId, questionId) => {
    if (!answerId || !questionId) {
      console.error('Invalid questionId or answerId for delete');
      return;
    }

    MySwal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this answer!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:8080/api/questions/${questionId}/answers/${answerId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );
          setAnswers(answers.filter((answer) => answer.id !== answerId));
          MySwal.fire({
            title: 'Deleted!',
            text: 'Your answer has been deleted.',
            icon: 'success',
          });
        } catch (error) {
          console.error('Error deleting answer:', error);
          MySwal.fire({
            title: 'Error!',
            text: 'Failed to delete answer.',
            icon: 'error',
          });
        }
      }
    });
  };

  const handleAnswerClick = (questionId) => {
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

  const sortedAnswers = answers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar className="h-100" />

        <div style={{ flex: 1 }}>
          <H2>My Response</H2>
          <div style={{ padding: '20px', marginTop: '10px' }}>
            <DateInputsContainer style={{ marginLeft: '25%' }}>
              <div>
                <label htmlFor="startDate">Date de début :</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                <label htmlFor="endDate">Date de fin :</label>
                <input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} />
              </div>
            </DateInputsContainer>
            <p>Total des réponses : {answers.length}</p>
            {sortedAnswers.map((answer, index) => (
              <StyledAnswerRow key={index} onClick={() => handleAnswerClick(answer.questionId)}>
                <EditDeleteIcons>
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(answer.questionId, answer.id);
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(answer.id, answer.questionId);
                    }}
                  />
                </EditDeleteIcons>
                <AnswerStat>
                  <span>{answer.responses ? answer.responses.length : 0} réponses</span>
                </AnswerStat>
                <AnswerTitleArea>
                  <AnswerLink>{answer.content || 'No content'}</AnswerLink>
                  <WhoAndWhen>répondue le {formatDate(answer.createdAt)}</WhoAndWhen>
                </AnswerTitleArea>
              </StyledAnswerRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswersPage;
