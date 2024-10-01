import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ApexCharts from 'react-apexcharts';
import styled from 'styled-components';
import NewNavbar from './NewNavbar';
import Sidebar from './sidebar';
import { useLocation } from 'react-router-dom';
import { SlBadge } from 'react-icons/sl'; // Import SlBadge icon
import { useTranslation } from 'react-i18next';


const CustomLine = styled.div`
  width: 100%; /* Full width */
  height: 2px; /* Line thickness */
  background-color: #ccc; /* Line color */
  margin: 20px 0; /* Spacing around the line */
`;
// Styled components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: flex;
  width: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: 60px;
  gap: 20px; // Space between profile info and badges
`;

const ProfileIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 30px;
  font-family: 'Arial', sans-serif;
  color: #333;
`;

const UserInfoTitle = styled.p`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const UserInfoDetail = styled.p`
  font-size: 16px;
  margin: 0;
  color: #555;
`;

const BadgeSection = styled.div`
  display: flex;
  align-items: flex-start;
  flex-direction: column; // Stack badges vertically
  gap: 10px; // Space between badges
`;

const Badge = styled(SlBadge)`
  font-size: 50px;
  color: ${(props) => (props.active ? props.color : 'transparent')}; // Badge color based on status
  transition: color 0.3s ease;
  margin-top: 5px;
  padding-bottom: 15px;
`;

const ChartsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 40px;
`;

const TopChartsRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 40px;
`;

const ChartWrapper = styled.div`
  flex: 1;
  margin: 20px;
  max-width: 500px;
  width: 100%;
`;

const ChartTitle = styled.h2`
  text-align: center;
  font-size: 20px;
  margin-bottom: 10px;
`;

const ChartSubtitle = styled.h3`
  text-align: center;
  font-size: 16px;
  margin-top: 0;
  color: #666;
`;

const HorizontalLine = styled.hr`
  width: 100%;
  margin-top: 20px;
  border: 1px solid #1f1c1f;
`;

const H2 = styled.h2`
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

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px' }}>
        <p>{payload[0].name}</p>
        <p>{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ChartComponent = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('id');
  const [questionsData, setQuestionsData] = useState([]);
  const [answersData, setAnswersData] = useState([]);
  const [responsesData, setResponsesData] = useState([]);
  const [userName, setUserName] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [userImage, setUserImage] = useState('');
  const { t } = useTranslation();
  const [userSince, setUserSince] = useState('No questions created yet'); // Default value for "User since"
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          // Fetch user info
          const userResponse = await axios.get(`http://localhost:8082/api/user/${id}`);
          setUserName(userResponse.data.username);
          setUserPoints(userResponse.data.reputation.score);
          setUserImage(userResponse.data.imageBase64 || '');
  
          // Fetch questions data from the new endpoint
          const questionsResponse = await axios.get('http://localhost:8082/api/questions/by-user-and-date', {
            params: {
              userId: id,
              startDate: '2024-01-01',
              endDate: '2024-12-31',
            },
          });
  
          const data = questionsResponse.data;
  
          const questionsCounts = Array(12).fill(0);
          const answersCounts = Array(12).fill(0);
          const responsesCounts = Array(12).fill(0);
  
          data.forEach((question) => {
            const questionMonth = new Date(question.createdAt).getMonth();
            questionsCounts[questionMonth] += 1;
  
            question.answers.forEach((answer) => {
              const answerMonth = new Date(answer.createdAt).getMonth();
              answersCounts[answerMonth] += 1;
  
              answer.responses.forEach((response) => {
                const responseMonth = new Date(response.createdAt).getMonth();
                responsesCounts[responseMonth] += 1;
              });
            });
          });
  
          setQuestionsData(questionsCounts);
          setResponsesData(responsesCounts);
        } catch (error) {
          console.error('Error fetching user data or questions:', error);
        }
  
        // Fetch answers data from the new endpoint
        try {
          const answersResponse = await axios.get('http://localhost:8082/api/questions/byuseranddate', {
            params: {
              userId: id,
              startDate: '2024-01-01',
              endDate: '2024-12-31',
            },
          });
  
          const answersDataByMonth = Array(12).fill(0);
          answersResponse.data.forEach((answer) => {
            const answerMonth = new Date(answer.createdAt).getMonth();
            answersDataByMonth[answerMonth] += 1;
          });
  
          setAnswersData(answersDataByMonth);
        } catch (error) {
          console.error('Error fetching answers data:', error);
        }
      };
  
      fetchData();
    }
  }, [id]);
  
  // Define different colors for each chart
  const CHART_COLORS = {
    questions: '#007bff', // Blue
    answers: '#28a745', // Green
    responses: '#dc3545', // Red
  };

  const formatDate = (dateString) => {
    if (dateString === 'No questions created yet') {
      return dateString;
    }
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('en-US', options);
  };

  // Determine badge state based on points
  const getBadgeState = (points) => {
    return {
      bronze: points >= 50,
      silver: points >= 100,
      gold: points >= 150,
    };
  };

  const badges = getBadgeState(userPoints);

  return (
    <PageContainer>
      <NewNavbar />
      <ContentContainer>
  <Sidebar style={{ height: '100%' }} />
  <MainContent>
    <ProfileSection>
      <ProfileIcon>
        <img
          src={
            userImage
              ? `data:image/jpeg;base64,${userImage}`
              : 'https://bootdey.com/img/Content/avatar/avatar7.png'
          }
          alt="User Profile"
        />
      </ProfileIcon>
      <div>
        <UserInfo>
          <UserInfoTitle>{userName}</UserInfoTitle>
          <UserInfoDetail>
            {t('User since:')} {formatDate('2024-01-01')}
          </UserInfoDetail>
          <UserInfoDetail>Points: {userPoints}</UserInfoDetail>
        </UserInfo>
        <BadgeSection>
  {badges.gold && <Badge as={SlBadge} color="#ffd700" active />}
  {!badges.gold && badges.silver && <Badge as={SlBadge} color="#c0c0c0" active />}
  {!badges.gold && !badges.silver && badges.bronze && <Badge as={SlBadge} color="#cd7f32" active />}
</BadgeSection>

      </div>
    </ProfileSection>

    <ChartsContainer>
      <H2>
        {userName} {t('Stats')}
        </H2>
        <CustomLine />
             <TopChartsRow>
        <ChartWrapper>
          <ChartTitle>{t('Total Questions by Month')}</ChartTitle>
          <ChartSubtitle>{t('Monthly distribution of questions')}</ChartSubtitle>
          <ApexCharts
            options={{
              chart: {
                type: 'line',
                toolbar: { show: false },
              },
              xaxis: {
                categories: Array.from({ length: 12 }, (_, i) =>
                  new Date(0, i).toLocaleString('en', { month: 'short' })
                ),
              },
              yaxis: {
                title: {
                  style: {
                    fontSize: '14px',
                    color: '#333',
                  },
                },
              },
              colors: [CHART_COLORS.questions],
              dataLabels: {
                enabled: true,
                formatter: (val) => (val === 0 ? '' : val), // Hide labels when value is 0
                style: {
                  fontSize: '15px',
                  colors: ['#fff'],
                },
                dropShadow: {
                  enabled: true,
                  top: 1,
                  left: 1,
                  color: '#000',
                  opacity: 0.5,
                  blur: 1,
                },
              },
              tooltip: {
                theme: 'dark',
                style: {
                  fontSize: '12px',
                },
                marker: {
                  show: true,
                },
              },
              stroke: {
                curve: 'smooth', // Smooth line curve
                width: 3, // Increased line width for better visibility
              },
              markers: {
                size: 5, // Marker size
                colors: ['#fff'], // Marker fill color
                strokeColors: [CHART_COLORS.questions], // Marker stroke color
                strokeWidth: 2, // Marker stroke width
                hover: {
                  size: 6, // Marker size on hover
                },
              },
              responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
            }}
            series={[{ name: 'Questions', data: questionsData }]}
            type="line"
            height={300}
          />
        </ChartWrapper>

        <ChartWrapper>
          <ChartTitle>{t('Total Answers by Month')}</ChartTitle>
          <ChartSubtitle>{t('Monthly distribution of answers')}</ChartSubtitle>
          <ApexCharts
            options={{
              chart: {
                type: 'line',
                toolbar: { show: false },
              },
              xaxis: {
                categories: Array.from({ length: 12 }, (_, i) =>
                  new Date(0, i).toLocaleString('en', { month: 'short' })
                ),
              },
              yaxis: {
                title: {
                  style: {
                    fontSize: '14px',
                    color: '#333',
                  },
                },
              },
              colors: [CHART_COLORS.answers],
              dataLabels: {
                enabled: true,
                formatter: (val) => (val === 0 ? '' : val), // Hide labels when value is 0
                style: {
                  fontSize: '15px',
                  colors: ['#fff'],
                },
                dropShadow: {
                  enabled: true,
                  top: 1,
                  left: 1,
                  color: '#000',
                  opacity: 0.5,
                  blur: 1,
                },
              },
              tooltip: {
                theme: 'dark',
                style: {
                  fontSize: '12px',
                },
                marker: {
                  show: true,
                },
              },
              stroke: {
                curve: 'smooth',
                width: 4,
              },
              markers: {
                size: 5,
                colors: ['#fff'],
                strokeColors: [CHART_COLORS.answers],
                strokeWidth: 2,
                hover: {
                  size: 6,
                },
              },
              responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
            }}
            series={[{ name: 'Answers', data: answersData }]}
            type="line"
            height={300}
          />
        </ChartWrapper>
      </TopChartsRow>

      <ChartWrapper>
        <ChartTitle>{t('Total Responses by Month')}</ChartTitle>
        <ChartSubtitle>{t('Monthly distribution of responses')}</ChartSubtitle>
        <ApexCharts
          options={{
            chart: {
              type: 'line',
              toolbar: { show: false },
            },
            xaxis: {
              categories: Array.from({ length: 12 }, (_, i) =>
                new Date(0, i).toLocaleString('en', { month: 'short' })
              ),
            },
            yaxis: {
        
              title: {
                style: {
                  fontSize: '14px',
                  color: '#333',
                },
              },
            },
            colors: [CHART_COLORS.responses],
            dataLabels: {
              enabled: true,
              formatter: (val) => (val === 0 ? '' : val), // Hide labels when value is 0
              style: {
                fontSize: '15px',
                colors: ['#fff'],
              },
              dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                color: '#000',
                opacity: 0.5,
                blur: 1,
              },
            },
            tooltip: {
              theme: 'dark',
              style: {
                fontSize: '12px',
              },
              marker: {
                show: true,
              },
            },
            stroke: {
              curve: 'smooth',
              width: 3,
            },
            markers: {
              size: 5,
              colors: ['#fff'],
              strokeColors: [CHART_COLORS.responses],
              strokeWidth: 2,
              hover: {
                size: 6,
              },
            },
            responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom' } } }],
          }}
          series={[{ name: 'Responses', data: responsesData }]}
          type="line"
          height={300}
        />
      </ChartWrapper>
    </ChartsContainer>
  </MainContent>
</ContentContainer>

    </PageContainer>
  );
  
};

export default ChartComponent;