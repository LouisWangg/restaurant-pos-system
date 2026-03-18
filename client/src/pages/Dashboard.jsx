import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup, Stack, CircularProgress } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FastFoodIcon from '@mui/icons-material/FastFood';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Navbar from '../components/Navbar';
import TableStatus from '../components/TableStatus';
import TableGrid from '../components/TableGrid';
import QuickStats from '../components/QuickStats';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import tableService from '../services/tableService';
import { TABLE_STATUS_DATA } from '../constants/tableStatus';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [view, setView] = useState('floor');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await tableService.getTables();
      if (response.status === 'success') {
        setTables(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setError("Gagal memuat data meja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();

    // Menampilkan notifikasi dari halaman lain
    if (location.state?.snackbar) {
      showSnackbar(location.state.snackbar.message, location.state.snackbar.severity);
      window.history.replaceState({}, document.title);
    }
  }, [location, showSnackbar]);

  const handleViewChange = (event, next) => {
    if (!next) return;

    if (next === 'food') {
      if (user?.role !== 'Pelayan') {
        showSnackbar('Halaman tersebut hanya dapat diakses oleh Pelayan', 'error');
        return;
      }
      navigate('/foods');
    } else if (next === 'order') {
      if (user?.role !== 'Pelayan' && user?.role !== 'Kasir') {
        showSnackbar('Halaman tersebut hanya dapat diakses oleh Pelayan dan Kasir', 'error');
        return;
      }
      navigate('/orders');
    } else {
      setView(next);
    }
  };

  // Menghitung statistik berdasarkan data meja
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

    return Object.entries(TABLE_STATUS_DATA).map(([key, value]) => ({
      label: value.statsLabel,
      count: counts[key],
      color: value.color,
      key: key
    }));
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
            onChange={handleViewChange}
            size="small"
            sx={{
              bgcolor: 'white',
              '& .MuiToggleButton-root': {
                px: 3,
                py: 1,
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  bgcolor: 'neutral.light',
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
                <TableGrid tables={tables} onTableUpdate={fetchTables} />
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
