import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser, faCalendar, faThumbsUp, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import './QuestionPageById.css';
import NewNavbar from './homeComponents/NewNavbar';
import { Alert } from 'bootstrap';
import UserAvatar from './UserAvatar';
import { FaLink } from 'react-icons/fa';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import Swal from 'sweetalert2';
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=PlusJakartaSans:wght@300,400;700&display=swap');
  body {
      Background: #FFF;
      color: #000000;
      font-family: Plus Jakarta Sans, sans-serif;
  }
  b,strong {
     
  }
  a {
      color: #fff;
  }
  p {
      margin: 10px 0;
      line-height: 1.5rem;
  }
  h1,h2 {
      margin-top: 20px;
      margin-bottom: 10px;
  }
  h1 {
      font-size: 1.8rem;
  }
  h2 {
      font-size: 1.6rem;
  }
  blockquote {
      background-color: rgba(0,0,0,0.1);
      padding: 15px;
      border-radius: 4px;
  }
`;

const Container = styled.div`
  padding: 30px 20px;
`;

const Cader = styled.div`
  background: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`;
const Comment = styled.div`
  background: #f2f2f1;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 5px;
`;

const Separator = styled.hr`
  border: none;
  border-top: 1px solid #000000;
  margin: 30px 0;
`;

const EditDeleteIcons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: -20px;
`;

const Icon = styled.div`
  margin-left: 10px;
  cursor: pointer;
`;
const Tag = styled.div`
  display: inline-block;
  margin-right: 5px;
  background-color: rgb(0 0 0 / 10%);
  color: #000000;
  padding: 7px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
`;
const CorrectAnswerLabel = styled.div`
  display: flex;
  align-items: center;
  color: green;
  font-size: 16px;
  margin-top: 10px;

  svg {
    margin-right: 5px;
    color: green;
  }
`;
const CheckmarkIcon = styled(IoIosCheckmarkCircleOutline)`
  cursor: pointer;
  color: ${(props) => (props.isAccepted ? 'green' : '#ccc')};
  font-size: 24px;
  margin-top: 10px;
`;
function QuestionsPageById() {
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState();
  const { questionId } = useParams();
  const [file, setFile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [voteValue, setVoteValue] = useState(null);
  const [totalVote, setTotalVote] = useState(null);
  const [voteValue1, setVoteValue1] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const token = localStorage.getItem('token');

  const userObject = JSON.parse(localStorage.getItem('user'));
  const userId = userObject ? userObject.id : null;

  library.add(faUser, faCalendar);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Create a URL for preview
    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('answerRequest.content', answer);
      console.log(answer);

      if (file) {
        formData.append('file', file);
      }
      formData.forEach((value, key) => {
        console.log(key, value);
      });

      await axios.post(
        `http://localhost:8080/api/questions/${questionId}/answers`,
        formData,

        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnswer('');
      setFile(null);
      setFilePreview(null);
      window.location.reload();
    } catch (error) {
      console.error('Error posting answer:', error.message);
    }
  };

  const handleAddLink = () => {
    const link = prompt('Enter the link URL:');
    if (link) {
      setAnswer((prevAnswer) => `${prevAnswer} [${link}](${link})`);
    }
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAnswer((prevAnswer) => `${prevAnswer} \n[File: ${file.name}]`);
    }
  };

  const fetchQuestionById = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuestion(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching question data:', error.message);
    }
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenSrc, setFullScreenSrc] = useState('');

  const handleImageClick = (src) => {
    setFullScreenSrc(src);
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setFullScreenSrc('');
  };

  const fetchVote = async () => {
    const entityType = 'Question';
    const entityId = questionId;
    try {
      const response = await axios.get('http://localhost:8080/api/votes/status', {
        params: { entityType, entityId, userId },
      });
      setVoteValue(response.data.value);
      setTotalVote(response.data.totalVotes);
      console.log(response.data);
    } catch (error) {
      console.error('There was an error fetching the vote status!', error);
    }
  };

  useEffect(() => {
    const incrementView = async () => {
      try {
        await axios.put(`http://localhost:8080/api/questions/${questionId}/increment-view`);
        console.log('View count incremented successfully.');
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    };

    incrementView();
    fetchVote();
    fetchQuestionById();
  }, [questionId]);

  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const replyFormRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleReplyClick2 = (answerId) => {
    setReplyToId(answerId);
  };

  const handleReplySubmit2 = async (parentAnswerId, event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Gérer le cas où le token n'est pas disponible
        console.error("Token d'authentification non disponible");
        return;
      }

      const response = await axios.post(
        `http://localhost:8080/api/questions/${questionId}/answers/${parentAnswerId}/responses`,
        { content: replyContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Réponse postée avec succès:', response.data);
      setReplyContent('');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la publication de la réponse:', error.message);
    }
  };

  const handleVote = async (value) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/votes/Question/${questionId}`,
        null,
        {
          params: { userId, value },
        },
      );
      console.log(response.data);
      setVoteValue(value);
      fetchVote(); // Récupère les votes mis à jour
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  const handleVote1 = async (value, id) => {
    try {
      const response = await axios.post(`http://localhost:8080/api/votes/Answer/${id}`, null, {
        params: { userId, value },
      });
      console.log(response.data);
      setVoteValue1(value);
      fetchVote(); // Récupère les votes mis à jour
    } catch (error) {
      console.error('There was an error!', error);
    }
  };

  const handleClickOutside = (event) => {
    if (replyFormRef.current && !replyFormRef.current.contains(event.target)) {
      setReplyToId(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/questions/${questionId}/answers`,
        );
        setAnswers(response.data);
      } catch (error) {
        console.error('Error fetching answers:', error);
      }
    };

    fetchAnswers();
  }, [questionId]);

  const handleAcceptAnswer = async (answerId) => {
    const user = localStorage.getItem('user');

    
    if (user) {
      
      const parsedUser = JSON.parse(user);

      
      const userId = parsedUser.id;

      
      console.log('User ID:', userId);
    } else {
      console.log('No user found in localStorage.');
    }
    const questionCreatorId = question.userId;
    console.log(questionCreatorId); // Assurez-vous d'avoir l'ID du créateur de la question

    if (userId !== questionCreatorId) {
      Swal.fire(
        'Sorry',
        'Only the user who created the question can mark an answer as accepted',
        'error',
      );
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/questions/${answerId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 200) {
        Swal.fire('Answer marked as correct', '', 'success').then(() => {
          window.location.reload();
        });
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) =>
            answer.id === answerId ? { ...answer, accepted: true } : { ...answer, accepted: false },
          ),
        );
      }
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };
  
  return (
    <>
      <NewNavbar />
      <Container>
        <GlobalStyle />
        {question && (
          <div className="mt-150 mb-150">
            <div className="container">
              <div className="row">
                <div className="col-lg-8">
                  <div className="single-article-section">
                    <div className="single-article-text">
                      <div className="single-artcile-bg" />
                      <p className="blog-meta">
                        <span className="author" style={{ marginLeft: '20px' }}>
                          <i className="fas fa-user" />{' '}
                        </span>
                        {question && question.file && (
                          <div
                            className="file"
                            style={{
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '5px',
                              marginTop: '50px',
                            }}
                          >
                            {question.contentType === 'application/pdf' && (
                              <embed
                                src={`data:application/pdf;base64,${question.file}`}
                                type="application/pdf"
                                width="800px"
                                height="400px"
                              />
                            )}

                            {question.contentType === 'image/png' && (
                              <embed
                                src={`data:image/png;base64,${question.file}`}
                                type="image/png"
                                width="800px"
                                height="400px"
                                onClick={() =>
                                  handleImageClick(`data:image/png;base64,${question.file}`)
                                }
                              />
                            )}
                            {question.contentType === 'image/jpeg' && (
                              <embed
                                src={`data:image/jpeg;base64,${question.file}`}
                                type="image/jpeg"
                                width="800px"
                                height="400px"
                                onClick={() =>
                                  handleImageClick(`data:image/jpeg;base64,${question.file}`)
                                }
                              />
                            )}
                            {question.contentType === 'text/csv' && (
                              <embed
                                src={`data:text/csv;base64,${question.file}`}
                                type="text/csv"
                                width="800px"
                                height="400px"
                              />
                            )}
                          </div>
                        )}
                        {isFullScreen && (
                          <div className="overlay" onClick={closeFullScreen}>
                            <img src={fullScreenSrc} alt="Full screen" />
                          </div>
                        )}

                        <p className="blog-meta">
                          <span>
                            <FontAwesomeIcon
                              icon={faThumbsUp}
                              onClick={() => handleVote(1)}
                              style={{
                                cursor: voteValue === 1 ? 'default' : 'pointer',
                                color: voteValue === 1 ? 'green' : 'black',
                              }}
                              disabled={voteValue === 1}
                            />
                            {totalVote >= 1 ? (
                              <span className="mx-4"> {totalVote} </span>
                            ) : (
                              <span className="mx-4">0</span>
                            )}
                            <FontAwesomeIcon
                              icon={faThumbsDown}
                              onClick={() => handleVote(0)}
                              style={{
                                cursor: voteValue === 0 ? 'default' : 'pointer',
                                color: voteValue === 0 ? 'red' : 'black',
                              }}
                              disabled={voteValue === 0}
                            />
                          </span>
                          <span className="author">
                            <FontAwesomeIcon
                              icon="user"
                              style={{ marginRight: '25px', marginLeft: '45px' }}
                            />{' '}
                            {question.userAnonymous ? 'Anonyme' : question.username}
                          </span>
                          <span className="date">
                            <FontAwesomeIcon icon="calendar" style={{ marginRight: '5px' }} />
                            {new Date(question.createdAt).toLocaleDateString()}
                          </span>
                          <span>
                            Mis à jour le :{' '}
                            {question.updatedAt
                              ? new Date(question.updatedAt).toLocaleString()
                              : 'Pas encore mis à jour'}
                          </span>
                        </p>
                      </p>

                      <h2 className="title">{question.title}</h2>
                      <p className="content">{question.content}</p>
                      <div className="tags">
                        <p className="tag">Tags :</p>
                        <div className="tag-container">
                          {question.tags &&
                            question.tags.map((tag) => (
                              <div key={tag.id} className="tag-item">
                                {tag}
                                <a className="tagli"></a>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="comments-list-wrap">
                        <h3 className="comment-count-title">
                          {question.answers && question.answers.length} response :
                        </h3>

                        <div className="comment-list">
                          {question.answers &&
                            question.answers.map((answer) => (
                              <React.Fragment key={answer.id}>
                                <div
                                  className="single-comment-body"
                                  style={{ marginTop: '10px', marginBottom: '10px' }}
                                >
                                  <div className="comment-user-avatar"></div>
                                  <div className="comment-text-body">
                                    <h4>
                                      <div key={answer.id} className="answer">
                                        <UserAvatar userId={answer.userId} />
                                      </div>
                                      <span style={{ marginLeft: '45px' }}>{answer.username}</span>
                                      <span className="comment-date" style={{ marginLeft: '5px' }}>
                                        A répondu le{' '}
                                        {new Date(answer.createdAt).toLocaleDateString()}
                                      </span>{' '}
                                      <button
                                        style={{ marginTop: '5px', marginLeft: '10px' }}
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleReplyClick2(answer.id);
                                        }}
                                      >
                                        reply
                                      </button>
                                    </h4>
                                    <Cader
                                      style={{
                                        padding: '20px',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '10px',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                      }}
                                    >
                                      <p
                                        style={{
                                          color: '#333',
                                          paddingTop: '10px',
                                          fontSize: '16px',
                                          lineHeight: '1.5',
                                        }}
                                      >
                                        {answer.content}
                                      </p>
                                      {answer.file && (
                                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                          {answer.contentType ? (
                                            // Check if file type is an image
                                            answer.contentType.startsWith('image/') ? (
                                              <img
                                                src={`data:${answer.contentType};base64,${answer.file}`}
                                                alt="Answer File"
                                                style={{
                                                  maxWidth: '100%',
                                                  maxHeight: '500px',
                                                  objectFit: 'contain',
                                                  borderRadius: '10px',
                                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                                  border: '1px solid #ddd',
                                                }}
                                              />
                                            ) : // Check if file type is PDF
                                            answer.contentType === 'application/pdf' ? (
                                              <embed
                                                src={`data:${answer.contentType};base64,${answer.file}`}
                                                type="application/pdf"
                                                width="100%"
                                                height="600px"
                                                style={{
                                                  borderRadius: '10px',
                                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                                  border: '1px solid #ddd',
                                                }}
                                              />
                                            ) : // Check if file type is a document
                                            answer.contentType === 'application/msword' ||
                                              answer.contentType ===
                                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                                              answer.contentType === 'application/vnd.ms-excel' ||
                                              answer.contentType ===
                                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                                              answer.contentType === 'text/csv' ||
                                              answer.contentType === 'application/rtf' ||
                                              answer.contentType === 'text/plain' ? (
                                              <iframe
                                                src={`data:${answer.contentType};base64,${answer.file}`}
                                                style={{
                                                  width: '100%',
                                                  height: '600px',
                                                  border: 'none',
                                                  borderRadius: '10px',
                                                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                                  border: '1px solid #ddd',
                                                }}
                                                title="Document Viewer"
                                              />
                                            ) : (
                                              <p style={{ color: '#e74c3c', fontSize: '16px' }}>
                                                Unsupported file type
                                              </p>
                                            )
                                          ) : (
                                            <p style={{ color: '#e74c3c', fontSize: '16px' }}>
                                              File type information is missing
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      {!answer.accepted && (
                                        <CheckmarkIcon
                                          isAccepted={answer.accepted}
                                          onClick={() => handleAcceptAnswer(answer.id)}
                                        />
                                      )}
                                      {answer.accepted && (
                                        <CorrectAnswerLabel>
                                          <IoIosCheckmarkCircleOutline />
                                          Correct Answer
                                        </CorrectAnswerLabel>
                                      )}
                                    </Cader>

                                    <span>
                                      <FontAwesomeIcon
                                        icon={faThumbsUp}
                                        onClick={() => handleVote1(1, answer.id)}
                                        style={{
                                          cursor: voteValue1 === 1 ? 'default' : 'pointer',
                                          color: voteValue1 === 1 ? 'green' : 'black',
                                        }}
                                        disabled={voteValue1 === 1}
                                      />

                                      <span className="mx-4">{answer.votes.length}</span>

                                      <FontAwesomeIcon
                                        icon={faThumbsDown}
                                        onClick={() => handleVote1(0, answer.id)}
                                        style={{
                                          cursor: voteValue1 === 0 ? 'default' : 'pointer',
                                          color: voteValue1 === 0 ? 'red' : 'black',
                                        }}
                                        disabled={voteValue1 === 0}
                                      />
                                    </span>

                                    {answer.filePath && (
                                      <div>
                                        <h4>Fichier attaché :</h4>
                                        <img
                                          src={answer.filePath}
                                          alt="Attachment"
                                          style={{ maxWidth: '200px', cursor: 'pointer' }}
                                          onClick={() => handleImageClick(answer.filePath)}
                                        />
                                      </div>
                                    )}
                                    {replyToId === answer.id && (
                                      <form
                                        ref={replyFormRef}
                                        onSubmit={(e) => handleReplySubmit2(answer.id, e)}
                                        className="reply-form"
                                      >
                                        <textarea
                                          value={replyContent}
                                          onChange={(e) => setReplyContent(e.target.value)}
                                          placeholder="Your reply"
                                          cols="30"
                                          rows="3"
                                        />
                                        <button
                                          type="submit"
                                          className="btn btn-danger btn-sm"
                                          style={{ marginTop: '5px', marginBottom: '10px' }}
                                        >
                                          Submit
                                        </button>
                                      </form>
                                    )}
                                    <div>
                                      {answer.responses.length > 0 && (
                                        <div style={{ marginLeft: '20px', marginTop: '20px' }}>
                                          <h5
                                            style={{
                                              marginBottom: '15px',
                                              fontSize: '18px',
                                              color: '#333',
                                            }}
                                          >
                                            Replies:
                                          </h5>
                                          {answer.responses.map((response) => (
                                            <Comment
                                              key={response.id}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                marginBottom: '15px',
                                                paddingBottom: '15px',
                                                borderBottom: '1px solid #ddd',
                                              }}
                                            >
                                              <UserAvatar
                                                src={`data:image/jpeg;base64,${response.image}`}
                                                userId={response.userId}
                                                alt={response.username}
                                                style={{
                                                  width: '30px',
                                                  height: '30px',
                                                  borderRadius: '50%',
                                                  objectFit: 'cover',
                                                  marginRight: '15px',
                                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                }}
                                              />
                                              <div style={{ flex: 1 }}>
                                                <span
                                                  style={{
                                                    fontWeight: 'bold',
                                                    color: '#555',
                                                    marginLeft: '10px',
                                                  }}
                                                >
                                                  {response.username}
                                                </span>
                                                <p style={{ margin: '5px 0', color: '#666' }}>
                                                  {response.content}
                                                </p>
                                              </div>
                                            </Comment>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Separator />
                              </React.Fragment>
                            ))}
                          <form onSubmit={handleSubmit}>
                            <div style={{ position: 'relative' }}>
                              <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Your answer"
                                cols="30"
                                rows="3"
                                style={{
                                  width: '100%',
                                  marginBottom: '10px',
                                  paddingRight: '40px',
                                }}
                              />
                              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                <button
                                  type="button"
                                  onClick={handleAddLink}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                  }}
                                >
                                  <FaLink />
                                </button>
                                <input
                                  type="file"
                                  id="fileInput"
                                  onChange={handleFileChange}
                                  style={{ display: 'none' }}
                                />
                                <label
                                  htmlFor="fileInput"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '24px',
                                  }}
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    style={{ width: '24px', height: '24px' }}
                                  >
                                    <path d="M20,20H4V4H12L14,2H4C2.89,2 2,2.89 2,4V20C2,21.1 2.9,22 4,22H20C21.1,22 22,21.1 22,20V10H20V20M20,8V4H14L20,8Z" />
                                  </svg>
                                </label>
                              </div>
                            </div>
                            {filePreview && (
                              <div>
                                <h4>Preview :</h4>
                                <img
                                  src={filePreview}
                                  alt="Preview"
                                  style={{ maxWidth: '200px' }}
                                />
                              </div>
                            )}
                            <button
                              className="btn"
                              style={{
                                marginRight: '20px',
                                marginTop: '20px',
                                backgroundColor: '#cf022b',
                                color: '#fff',
                              }}
                              type="submit"
                            >
                              Post your answer
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

export default QuestionsPageById;
