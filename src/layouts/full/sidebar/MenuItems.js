import {
   IconLayoutDashboard,
   IconAperture
   
} from '@tabler/icons';
import { IoIosPricetags } from "react-icons/io";
import { BsQuestionOctagon } from "react-icons/bs";
import { RiQuestionAnswerLine } from "react-icons/ri";

import { IoPersonAdd } from "react-icons/io5";
import { IoStatsChart } from "react-icons/io5";



import { FaUsersLine } from "react-icons/fa6";

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Accueil',
  },

  {
    id: uniqueId(),
    title: 'Liste des utilisateurs',
    icon: FaUsersLine,
    href: '/dashboard',
  },
  {
    id: uniqueId(),
    title: 'Liste des étiquettes',
    icon: IoIosPricetags,
    href: '/listoftags',
  },
  {
    id: uniqueId(),
    title: 'Liste de questions',
    icon: BsQuestionOctagon,
    href: '/listQuestions',
  },
  {
    id: uniqueId(),
    title: 'Liste des réponses',
    icon: RiQuestionAnswerLine,
    href: '/listAnswers',
  },
  {
    navlabel: true,
    subheader: 'Ajouter',
  },
  {
    id: uniqueId(),
    title: 'Ajouter Moderateur',
    icon: IoPersonAdd,
    href: '/ajoutermoderateur',
  },
  {
    navlabel: true,
    subheader: 'Analyse',
  },
  {
    id: uniqueId(),
    title: 'statistiques de l application',
    icon: IoStatsChart,
    href: '/stat',
  },

  
  
];

export default Menuitems;
