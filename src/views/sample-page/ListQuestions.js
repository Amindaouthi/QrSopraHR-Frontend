import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import DashboardCard from '../../components/shared/DashboardCard';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import DeleteIcon from '@mui/icons-material/Delete';

const ListQuestions = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc

  useEffect(() => {
    axios
      .get('http://localhost:8083/api/questions')
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des questions :', error);
      });
  }, []);

  const handleDeleteQuestion = async (questionId) => {
    try {
      const result = await Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Cette action est irréversible !",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      });

      if (result.isConfirmed) {
        await axios.delete(`http://localhost:8083/api/questions/${questionId}`);

        await Swal.fire({
          icon: 'success',
          title: 'Question supprimée',
          text: 'La question a été supprimée avec succès.',
          confirmButtonText: 'OK'
        });

        setQuestions((prevQuestions) => prevQuestions.filter((question) => question.id !== questionId));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la question :", error);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la suppression de la question. Veuillez réessayer.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSort = () => {
    const sortedQuestions = [...questions].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setQuestions(sortedQuestions);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredQuestions = questions.filter((question) =>
    question.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <DashboardCard title="Liste des questions">
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2,mt:"10px" }}>
          <TextField
            label="Filter by title"
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button variant="contained" onClick={handleSort}>
            Sort by Title ({sortOrder === 'asc' ? 'Desc' : 'Asc'})
          </Button>
        </Box>
        <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Question ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Title
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Content
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Username
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Answers
                </Typography>
              </TableCell>
              <TableCell >
              <Typography variant="subtitle2" fontWeight={600} style={{marginLeft :"87px"}}>
                Supprimer
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {question.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                  {question.title.length > 10 ? `${question.title.substring(0, 10)}...` : question.title}

                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {question.content.length > 16 ? `${question.content.substring(0, 16)}...` : question.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {question.username}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" style={{marginLeft:"20px"}}>
                    {question.answers.length}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleDeleteQuestion(question.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </DashboardCard>
  );
};

export default ListQuestions;
