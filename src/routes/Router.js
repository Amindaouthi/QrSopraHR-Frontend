import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ResetPassword from 'src/views/authentication/ResetPassword';
import AskPage from 'src/views/client/AskPage';
import ProfilePage from 'src/views/client/ProfilePage';
import QuestionsPageById from 'src/views/client/QuestionPageById';

import QuestionsPage from 'src/views/client/homeComponents/QuestionsPage';
import Tags from 'src/views/client/homeComponents/Tags';
import AjouterModerateur from 'src/views/sample-page/AjouterModerateur';
import UserProfile from 'src/views/client/UserProfile';
import Customers from 'src/views/client/Customers';
import QuestionOnTags from 'src/views/client/homeComponents/QuestionOnTags';
import ChartComponent from 'src/views/client/homeComponents/ChartComponent';
import AnswersPage from 'src/views/client/homeComponents/Mesanswers';
import MesQuestions from 'src/views/client/homeComponents/Mesquestions';
import MesQuestionsFavorites from 'src/views/client/MesQuestionsFavorits';
import ChatBox from 'src/views/client/ChatBox';
import ListQuestions from 'src/views/sample-page/ListQuestions';

import YearlyBreakup from 'src/views/dashboard/components/YearlyBreakup';
import Stat from 'src/views/dashboard/components/Stat';
import ListAnswers from 'src/views/sample-page/ListAnswers';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboard/Dashboard')));
const ListTags = Loadable(lazy(() => import('../views/sample-page/ListTags')));
const Icons = Loadable(lazy(() => import('../views/icons/Icons')));
const TypographyPage = Loadable(lazy(() => import('../views/utilities/TypographyPage')));
const Shadow = Loadable(lazy(() => import('../views/utilities/Shadow')));
const Error = Loadable(lazy(() => import('../views/authentication/Error')));
const Register = Loadable(lazy(() => import('../views/authentication/Register')));
const Login = Loadable(lazy(() => import('../views/authentication/Login')));
//const ResetPassword = Loadable(lazy(() => import('../views/authentication/ResetPassword')));
const ModifierProfile = Loadable(lazy(() => import('../views/sample-page/ModifierProfil')));
const Home = Loadable(lazy(() => import('../views/client/Home')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/auth/login" /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
      { path: '/listoftags', exact: true, element: <ListTags /> },
      { path: '/icons', exact: true, element: <Icons /> },
      { path: '/ui/typography', exact: true, element: <TypographyPage /> },
      { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '/modifierprofile', element: <ModifierProfile /> },
      { path: '/ajoutermoderateur', element: <AjouterModerateur /> },
      { path: '/listQuestions', exact: true, element: <ListQuestions /> },
      { path: '/listAnswers', exact: true, element: <ListAnswers /> },

      { path: '/stat', exact: true, element: <Stat /> },

      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '/auth/ResetPassword', element: <ResetPassword /> },

      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/client',
    children: [
      { path: '404', element: <Error /> },
      { path: '/client/home', element: <Home /> },
      { path: '/client/askquestion', element: <AskPage /> },
      { path: '/client/questionpage', element: <QuestionsPage /> },
      { path: '/client/profile', element: <ProfilePage /> },
      { path: '/client/question/:questionId', element: <QuestionsPageById /> },
      { path: '/client/Customers', element: <Customers /> },
      { path: '/client/tags', element: <Tags /> },
      { path: '/client/profile', element: <UserProfile /> },
      { path: '/client/questionOntags/:tag', element: <QuestionOnTags /> },
      { path: '/client/user/:userId', element: <ChartComponent /> },
      { path: '/client/Mesquestions', element: <MesQuestions /> },
      { path: '/client/Mesanswers', element: <AnswersPage /> },
      { path: '/client/MesQuestionsFavorits', element: <MesQuestionsFavorites /> },
      { path: '/client/user', element: <ChartComponent /> },
      { path: '/client/chatbox', element: <ChatBox /> },
      { path: '/client/YearlyBreakup', element: <YearlyBreakup /> },
    ],
  },
];

export default Router;
