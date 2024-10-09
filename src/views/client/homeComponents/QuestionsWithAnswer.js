import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useState, useEffect } from 'react';
import axios from 'axios';


const QuestionStat = styled.div`
    text-align:center;
    display:inline-block;
    font-size: 1.2rem;
    color:#aaa;
    margin-top:6px;
    span{
        font-size:.7rem;
        display:block;
        font-weight: 300;
        margin-top: 4px;
    }
`;
const QuestionTitleArea = styled.div`
padding : 0px 30px
`;
const Tag = styled.span`
display : inline-block;
margin-right:5px;
background-color: rgb(0 0 0 / 10%);
color: #000000;
padding: 7px;
border-radius: 4px;
font-size: .9rem;
`;
const QuestionLink = styled(Link)`
text-decoration:none;
color:#bc1434;
font-size:1.1rem;
display:block;
margin-bottom:5px;

`;
const StyledQuestionRow = styled.div`
background-color: rgba(0, 0, 0, 0.01);
padding :15px 15px 10px;
display: grid;
grid-template-columns: repeat(3, 50px) 1fr;
border: 1px solid #dc3545;
margin-bottom :20px;
`;

const WhoAndWhen = styled.div`
display:inline-block;
color:#aaa;
font-size: .8rem;
float:right;
padding: 10px 0
`;
const UserLink = styled.a`
color: #bc1434;
`;
function QuestionWithAnswer(){

    const [questionData, setQuestionData] = useState(null);
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
    
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get('http://localhost:8083/api/questions/questionsWithoutAnswers');
                setQuestionData(response.data);
                console.log(response.data.user_id)
            } catch (error) {
                console.error('Error fetching question data:', error.message);
            }
        };

        fetchQuestions();
    }, []);
    
    return(
        <>
        <StyledQuestionRow>
            <QuestionStat>0<span>votes</span></QuestionStat>
                <QuestionStat>0<span>answers</span></QuestionStat>
                <QuestionStat>0<span>views</span></QuestionStat>
                <QuestionTitleArea>
                    <QuestionLink to={'/client/question'}>Title of question</QuestionLink>
                    <Tag>Tag</Tag>
                    <Tag>Tag</Tag>
                    <Tag>Tag</Tag>
                    <Tag>Tag</Tag>
                    <WhoAndWhen>
                        asked 2mins ago<UserLink>Ghassen</UserLink>
                    </WhoAndWhen>
                </QuestionTitleArea>
        </StyledQuestionRow>
    </>
    )
}

export default QuestionWithAnswer;