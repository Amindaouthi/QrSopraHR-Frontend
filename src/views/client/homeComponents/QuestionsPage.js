import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './sidebar';
import NewNavbar from './NewNavbar';
import Header2 from './Header2';
import { Link } from 'react-router-dom';
import Pagination from './pagination';
import axios from 'axios';
import { FaSun, FaMoon } from 'react-icons/fa';
import Select from 'react-select';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../homeComponents/QuestionsPage.css';
import { useTranslation } from 'react-i18next';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'



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
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`;

const Tag = styled.span`
  display: inline-block;
  margin-right: 8px;
  background-color: #e2e3e5;
  color: #343a40;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 0.85rem;
  margin-top: 5px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ced4da;
  }
`;

const QuestionLink = styled(Link)`
  text-decoration: none;
  color: #bc1434;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 8px;
  transition: color 0.3s ease;

  &:hover {
    color: #a51129;
  }
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
  background-color: #f8f9fa;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 60px) 1fr 50px; /* Ajustement des colonnes */
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-right: 10px;
  margin-left: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; /* Align items vertically in the center */
  padding: 20px; /* Add padding for better spacing */
  background-color: #f8f9fa; /* Light background color for contrast */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Subtle shadow for depth */
  margin-bottom: 20px; /* Space between other components */
  color: #333; /* Slightly darker text color for readability */
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 15px; /* Increased spacing between filter items */
  flex: 1;
`;

const FilterTitle = styled.span`
  display: inline-block;
  font-size: 1rem; /* Smaller font size */
  font-weight: 500; /* Lighter font weight */
  color: #555; /* Softer text color for a refined look */
  
  padding: 6px 12px; /* Slightly smaller padding */
  
  margin-bottom: 8px; /* Space below the title */
  
  letter-spacing: 0.5px; /* Slight letter spacing for style */
`;

const FilterItemLabel = styled.span`
  margin-bottom: 8px; /* Increased margin for better spacing */
  font-weight: 600; /* Slightly bolder font */
  color: #555; /* Subtle color change for labels */
`;

const FilterInput = styled.input`
  padding: 10px; /* Increased padding for a more substantial feel */
  border: 1px solid #ccc; /* Keep the border light and neutral */
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem; /* Increased font size for readability */
  transition: border-color 0.3s ease; /* Smooth transition on focus */

  &:focus {
    border-color: #bc1434; /* Highlight color on focus */
    outline: none; /* Remove default outline */
  }
`;

const FilterSelect = styled.select`
  padding: 10px; /* Increased padding for consistency */
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #bc1434;
    outline: none;
  }
`;


const FavoriteIcon = styled.div`
  &:hover {
    color: gold;
  }
  &.gold {
    color: gold;
  }
`;


const QuestionsPage = () => {
  const { t } = useTranslation();
  const [postPerPage] = useState(4);
  const [currentPage, setcurrentPage] = useState(1);
  const [questionDatas, setQuestionData] = useState([]);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModerator, setIsModerator] = useState(false); 
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  

  const votreToken = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.roles !== null) {
          const userRoles = user.roles;
          if (userRoles.includes("ROLE_MODERATOR")) {
            setIsModerator(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user roles:', error.message);
      }
    };

    fetchUserRoles(); 
  }, []); 

  const handleTrashClick = async (questionId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/questions/${questionId}`);
        fetchAllQuestions();
        Swal.fire('Deleted!', 'the question has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'There was an error deleting the question.', 'error');
      }
    }
  };

  

/*const handleFavoriteQuestion = async (questionId) => {
  try {
    
    const question = questionDatas.find((question) => question.id === questionId);
    
    if (!question) {
      console.error('Question not found');
      return;
    }
    
    
    const isQuestionFavorite = question.favorites && question.favorites.length > 0;

    if (isQuestionFavorite) {
      
      const favoriteId = question.favorites[0].id; 
      const response = await axios.delete(
        `http://localhost:8080/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        },
      );
      if (response.status === 200) {
        Swal.fire('Question supprimée des favoris', '', 'success');
        
        fetchQuestionData(questionId);
      } else {
        Swal.fire("Erreur dans la suppression", '', 'error');
      }
    } else {
      
      const response = await axios.post(
        `http://localhost:8080/api/favorites/markQuestionAsFavorite/${questionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        },
      );
      if (response.status === 200) {
        Swal.fire('Question ajoutée comme favoris', '', 'success');
        
        fetchQuestionData(questionId);
      } else {
        Swal.fire("Erreur dans l'ajout", '', 'error');
      }
    }
  } catch (error) {
    console.error('Erreur lors de la requête pour marquer/supprimer la question comme favori :', error);
  }
};*/



  

    
  const fetchQuestionData = async (questionId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/questions/${questionId}`);
      const data = await response.json();
      // Update question data in the state
      setQuestionData((prevData) =>
        prevData.map((question) => (question.id === questionId ? { ...question, ...data } : question))
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des données de la question:', error);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/questions/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          content: '',
          userId: null,
          tags: [],
          pageIndex: 0,
          pageSize: 10,
          userAnonymous: null,
        }),
      });
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data)) {
        setQuestionData(data);
      } else {
        console.error('Data is not an array:', data);
      }
    } catch (error) {
      console.error('There was an error fetching questions:', error);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, [votreToken]);

  const indexOfLastPost = currentPage * postPerPage;
  const indexOfFirstPost = indexOfLastPost - postPerPage;
  const currentPosts = questionDatas.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNum) => setcurrentPage(pageNum);

  const handleDataFromChild = (data) => {
    setQuestionData(data);
  };

  const handleAllQuestionsClick = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/questions/all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: searchTitle,
          userId: selectedUser,
          tags: selectedTags,
          pageIndex: 0,
          pageSize: 15,
          userAnonymous: null,
        }),
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setQuestionData(data);
      } else {
        console.error('Data is not an array:');
      }
    } catch (error) {
      console.error('There was an error fetching questions:', error);
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/tags/getAll', {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        setTags(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des tags :', error.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users', {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        setUsers(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error.message);
      }
    };

    fetchTags();
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    if (!searchTitle && !selectedUser && !selectedTags.length) {
      fetchAllQuestions();
      return;
    }

    console.log('alll', selectedTags);
    const requestData = {
      content: '',
      pageIndex: 0,
      pageSize: 15,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      title: searchTitle ? searchTitle : undefined,
      userAnonymous: selectedUser === 'Anonyme',
      userId: selectedUser ? parseInt(selectedUser, 10) : '',
    };

    try {
      const response = await axios.post('http://localhost:8080/api/questions/all', requestData, {
        headers: {
          Authorization: `Bearer ${votreToken}`,
        },
      });

      setQuestionData(response.data);
      console.log('Résultats de la recherche :', response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche :', error.message);
    }
  };

  const handleTagChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedTags(values);
  };

  const options = tags.map(tag => ({ value: tag.name, label: tag.name }));

 const handleFavoriteQuestion = async (questionId) => {
    try {
      const question = questionDatas.find((question) => question.id === questionId);
 
      if (!question) {
        console.error('Question not found');
        return;
      }
 
      const isQuestionFavorite = question.favorites && question.favorites.length > 0;
 
      if (isQuestionFavorite) {
        const favoriteId = question.favorites[0].id;
        const response = await axios.delete(`http://localhost:8080/api/favorites/${favoriteId}`, {
          headers: {
            Authorization: `Bearer ${votreToken}`,
          },
        });
        if (response.status === 200) {
          Swal.fire('Question retiré des favoris', '', 'alert');
 
          fetchQuestionData(questionId);
        } else {
          Swal.fire('Erreur dans la suppression', '', 'error');
        }
      } else {
        const response = await axios.post(
          `http://localhost:8080/api/favorites/markQuestionAsFavorite/${questionId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${votreToken}`,
            },
          },
        );
        if (response.status === 200) {
          Swal.fire('Question ajoutée comme favoris', '', 'success');
 
          fetchQuestionData(questionId);
        } else {
          Swal.fire("Erreur dans l'ajout", '', 'error');
        }
      }
    } catch (error) {
      console.error(
        'Erreur lors de la requête pour marquer/supprimer la question comme favori :',
        error,
      );
    }
  };
 
  
  
  return (
    <>
      <NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar className='h-100'/>
        <div style={{ flex: 1 }}>
          <Header2
            onDataUpdate={handleDataFromChild}
            onAllQuestionsClick={handleAllQuestionsClick}
          />
          <>

            <div
              className="filter-container"
              style={{
                
                marginBottom: "20px",
                marginRight: "10px",
                marginLeft:"10px",
                paddingBottom: '20px',
                paddingTop: 10,
              }}
            >
            <FilterTitle> {t('make your search easy :')}</FilterTitle>
              <FilterContainer className="mb-4">
                <FilterItem style={{ paddingLeft: "10px" }}>
                  <FilterItemLabel>{t('Title')}:</FilterItemLabel>
                  <FilterInput
                    type="text"
                    id="searchInput"
                    placeholder={t("Search by title")}
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    style={{ height: '38px' }}
                  />
                </FilterItem>
                <FilterItem >
                  <FilterItemLabel>{t('Users')}:</FilterItemLabel>
                  <FilterSelect
                    id="userSelect"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    style={{height:"38px"}}
                  >
                    <option value="">{t('Select user')}</option>
                    {users.map((user) => (
                      <option key={user.matricul} value={user.matricul}>
                        {user.username}
                      </option>
                    ))}
                    <option value="Anonyme">{t('Anonymous')}</option>
                  </FilterSelect>
                </FilterItem>
                <FilterItem>
                  <FilterItemLabel>{t('Tags')}:</FilterItemLabel>
                  <Select
                    id="tagsSelect"
                    value={options.filter((option) => selectedTags.includes(option.value))}
                    onChange={handleTagChange}
                    options={options}
                    isMulti
                    placeholder={t('Select tags...')}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </FilterItem>
                <FilterItem>
                  <button
                    onClick={handleSearch}
                    className="btn btn-outline-danger"
                    style={{ marginTop: '27px',marginLeft:"50px" }}
                  >
                    {t('Search')}
                  </button>
                </FilterItem>
              </FilterContainer>
            </div>
            {error && <p>{error}</p>}
            {currentPosts &&
              currentPosts.map((question, index) => (
                <StyledQuestionRow key={index}>
                  <QuestionStat>
                    {(!question.answers && typeof question.voteCount === 'number') ? question.voteCount : !question.votes ? 0 : ''}
                    {question.votes && question.votes.length}
                    <span>{t('votes')}</span>
                  </QuestionStat>
                  <QuestionStat>
                    {(!question.answers && typeof question.answerCount === 'number') ? question.answerCount : !question.answers ? 0 : ''}
                    {question.answers && question.answers.length}
                    <span>{t('answers')}</span>
                  </QuestionStat>
                  <QuestionStat >
                    {typeof question.views === 'number' ? question.views : 0}
                    <span>{t('views')}</span>
                  </QuestionStat>
  
                  <QuestionTitleArea style={{ paddingTop: '10px' }}>
                    <QuestionLink to={`/client/question/${question.id}`}>
                      {question.title || t('No title')}
                    </QuestionLink>
                    <div>{question.content}</div>
                    <div>
                      {question.tags &&
                        question.tags.map((tag, tagIndex) => (
                          <Tag key={tagIndex}>
                            {typeof tag === 'object' ? tag.name : tag}
                          </Tag>
                        ))}
                    </div>
  
                    <WhoAndWhen>
                      {t('asked')} {formatDate(question.createdAt)} {t('By')}{' '}
                      {question.username && question.username != null && (
                        <UserLink>
                          <span>{question.username}</span>
                        </UserLink>
                      )}
                      {question.username === null && (
                        <UserLink>
                          <span>{t('Anonyme')}</span>
                        </UserLink>
                      )}
                    </WhoAndWhen>
                  </QuestionTitleArea>
                  <div 
                    className={`favorite-icon ${
                      question.favorites && question.favorites.length > 0 ? 'gold' : ''
                    }`}
                    onClick={() => handleFavoriteQuestion(question.id)}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  {isModerator && (
                    <div>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTrashClick(question.id)}
                    />
                  </div>
                  )}
                </StyledQuestionRow>
              ))}
  
            <Pagination
              postsPerPage={postPerPage}
              totalPosts={questionDatas.length}
              paginate={paginate}
              currentPage={currentPage}
              style={{Margin:10 }}
            />
          </>
        </div>
      </div>
    </>
  );
  };
  

export default QuestionsPage;
