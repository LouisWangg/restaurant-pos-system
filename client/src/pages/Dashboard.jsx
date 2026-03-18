import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, ToggleButton, ToggleButtonGroup, Stack, CircularProgress, Snackbar, Alert } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FastFoodIcon from '@mui/icons-material/FastFood';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Navbar from '../components/Navbar';
import TableStatus from '../components/TableStatus';
import TableGrid from '../components/TableGrid';
import QuickStats from '../components/QuickStats';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import tableService from '../services/tableService';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [view, setView] = React.useState('floor');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

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

    // Handle snackbar from navigation state
    if (location.state?.snackbar) {
      setSnackbar(location.state.snackbar);
      // Clear navigation state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleViewChange = (event, next) => {
    if (!next) return;

    if (next === 'food') {
      if (user?.role !== 'Pelayan') {
        setSnackbar({
          open: true,
          message: 'Halaman tersebut hanya dapat diakses oleh Pelayan',
          severity: 'error',
        });
        return;
      }
      navigate('/foods');
    } else if (next === 'order') {
      if (user?.role !== 'Pelayan') {
        setSnackbar({
          open: true,
          message: 'Halaman tersebut hanya dapat diakses oleh Pelayan',
          severity: 'error',
        });
        return;
      }
      navigate('/orders');
    } else {
      setView(next);
    }
  };

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
                <TableGrid tables={tables} onTableUpdate={fetchTables} setSnackbar={setSnackbar} />
              )}
            </Box>
            <QuickStats stats={getStats()} />
          </Box>
        </Stack>
      </Container>

      {/* Access Denied Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ top: { xs: 80, sm: 105 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 250, borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
