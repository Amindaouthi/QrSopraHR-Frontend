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
import DeleteIcon from '@mui/icons-material/Delete';

const ListAnswers = () => {
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
        console.error('Erreur lors du chargement des questions et réponses :', error);
      });
  }, []);

  const handleDeleteAnswer = async (answerId, questionId) => {
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
        // Delete the answer using a DELETE request (assuming you have an endpoint for this)
        await axios.delete(`http://localhost:8083/api/questions/${questionId}/answers/${answerId}`);

        await Swal.fire({
          icon: 'success',
          title: 'Réponse supprimée',
          text: 'La réponse a été supprimée avec succès.',
          confirmButtonText: 'OK'
        });

        // Update the state to remove the deleted answer
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.id === questionId
              ? {
                  ...question,
                  answers: question.answers.filter((answer) => answer.id !== answerId),
                }
              : question
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la réponse :", error);
      await Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur est survenue lors de la suppression de la réponse. Veuillez réessayer.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSort = () => {
    const sortedQuestions = [...questions].map((question) => ({
      ...question,
      answers: [...question.answers].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.content.localeCompare(b.content);
        } else {
          return b.content.localeCompare(a.content);
        }
      }),
    }));
    setQuestions(sortedQuestions);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredAnswers = questions
    .flatMap((question) => question.answers.map((answer) => ({ ...answer, questionTitle: question.title })))
    .filter((answer) =>
      answer.content.toLowerCase().includes(filter.toLowerCase())
    );

  return (
    <DashboardCard title="Liste des reponses">
      <Box sx={{ overflow: 'auto', width: { xs: '280px', sm: 'auto' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, mt: "10px" }}>
          <TextField
            label="Filter by content"
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button variant="contained" onClick={handleSort}>
            Sort by Content ({sortOrder === 'asc' ? 'Desc' : 'Asc'})
          </Button>
        </Box>
        <Table aria-label="simple table" sx={{ whiteSpace: 'nowrap', mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Answer ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Content
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Question Title
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Username
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600} style={{ marginRight: "80px" }}>
                  Supprimer
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAnswers.map((answer) => (
              <TableRow key={answer.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {answer.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {answer.content.length > 16 ? `${answer.content.substring(0, 16)}...` : answer.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                  {answer.questionTitle.length > 10 ? `${answer.questionTitle.substring(0, 10)}...` :answer.questionTitle}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">
                    {answer.username}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleDeleteAnswer(answer.id, answer.questionId)}>
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

export default ListAnswers;
