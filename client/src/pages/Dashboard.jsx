import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup, Stack, CircularProgress } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FastFoodIcon from '@mui/icons-material/FastFood';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Navbar from '../components/Navbar';
import TableStatus from '../components/TableStatus';
import TableGrid from '../components/TableGrid';
import QuickStats from '../components/QuickStats';
import api from '../api';

const Dashboard = () => {
  const [view, setView] = React.useState('floor');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await api.get('/api/tables');
        if (response.data.status === 'success') {
          setTables(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch tables:", err);
        setError("Gagal memuat data meja");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  // Hitung statistik berdasarkan data meja
  const getStats = () => {
    const counts = {
      available: 0,
      occupied: 0,
      reserved: 0,
      inactive: 0
    };
    
    tables.forEach(table => {
      if (counts.hasOwnProperty(table.status)) {
        counts[table.status]++;
      }
    });

    return [
      { label: 'Available Tables', count: counts.available, color: '#22c55e', key: 'available' },
      { label: 'Occupied Tables', count: counts.occupied, color: '#ef4444', key: 'occupied' },
      { label: 'Reserved Tables', count: counts.reserved, color: '#f59e0b', key: 'reserved' },
      { label: 'Inactive Tables', count: counts.inactive, color: '#64748b', key: 'inactive' },
    ];
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Table Management
          </Typography>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, next) => next && setView(next)}
            size="small"
            sx={{ 
              bgcolor: 'white', 
              '& .MuiToggleButton-root': { 
                px: 3, 
                py: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'slate.100',
                  color: 'primary.main',
                  fontWeight: 'bold'
                }
              } 
            }}
          >
            <ToggleButton value="floor" sx={{ gap: 1 }}>
              <GridViewIcon fontSize="small" /> Floor Plan
            </ToggleButton>
            <ToggleButton value="food" sx={{ gap: 1 }}>
              <FastFoodIcon fontSize="small" /> Master Food
            </ToggleButton>
            <ToggleButton value="order" sx={{ gap: 1 }}>
              <ListAltIcon fontSize="small" /> Order List
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Stack spacing={3}>
          <TableStatus />

          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="error">{error}</Typography>
                </Box>
              ) : (
                <TableGrid tables={tables} />
              )}
            </Box>
            <QuickStats stats={getStats()} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
