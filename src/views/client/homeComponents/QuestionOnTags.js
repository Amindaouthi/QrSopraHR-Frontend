import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from './sidebar';
import NewNavbar from './NewNavbar';
import Header2 from './Header2';
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
`;
const QuestionOnTags = () => {
  const [questionDatas, setQuestionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tag } = useParams(); // Utilisation de useParams pour obtenir les paramètres d'URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8083/api/questions/byTag/${tag}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setQuestionData(response.data);

        console.log(response.data)
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchData();

    // Clean up function
   
  }, [tag]);

  if (loading) {
    return <div>Loading...</div>;
  }


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const sortedQuestions = questionDatas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
<NewNavbar />
      <div style={{ display: 'flex' }}>
        <Sidebar className='h-100' />
        <div style={{ flex: 1 }}>
          <Header2
          />{' '}
 <p className='ms-2'>
        Total des questions {tag.name}: {questionDatas.length} - {tag.description}
      </p>
           { sortedQuestions.map((question, index) => (
                <StyledQuestionRow key={index}>
                  
                  <QuestionStat>
                    {question.votes  ? question.votes.length : 0}
                    <span>votes</span>
                  </QuestionStat>
                  <QuestionStat>
                    {question.answers ? question.answers.length : 0}
                    <span>answers</span>
                  </QuestionStat>
                  <QuestionStat>
                    {typeof question.views === 'number' ? question.views : 0}
                    <span>views</span>
                  </QuestionStat>
                  <QuestionTitleArea>
                    <QuestionLink to={`/client/question/${question.id}`}>
                      {question.title || 'No title'}
                    </QuestionLink>
                    <div>
                      {question.tags &&
                        question.tags.map((tag, tagIndex) => (
                          <Tag key={tagIndex}>{typeof tag === 'object' ? tag.name : tag}</Tag>
                        ))}
                    </div>
                    <WhoAndWhen>
                      asked {formatDate(question.createdAt)} 
                    </WhoAndWhen>
                  </QuestionTitleArea>
                </StyledQuestionRow>
              ))}
</div>
              </div>
    </div>
  );
};

export default QuestionOnTags;
