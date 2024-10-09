import React, { useEffect, useState } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, TextField, Button } from '@mui/material';
import axios from 'axios';
import PageContainer from 'src/components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';

const ListTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // asc or desc

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/tags/getAll'); // Replace with your API endpoint
      setTags(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setLoading(false);
    }
  };

  const handleSort = () => {
    const sortedTags = [...tags].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    setTags(sortedTags);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <PageContainer title="List of Tags" description="List of Tags">
      <DashboardCard title="Liste des étiquettes">
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
                    Tag_ID
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Tag_TITLE
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Tag_DESC
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {tag.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>{tag.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {tag.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DashboardCard>
    </PageContainer>
  );
};

export default ListTags;
