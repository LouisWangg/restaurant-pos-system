import React from 'react';
import { Box, Container, Typography, Button, Stack, ToggleButton, ToggleButtonGroup, Paper } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import FastFoodIcon from '@mui/icons-material/FastFood';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Navbar from '../components/Navbar';
import TableStatus from '../components/TableStatus';
import TableGrid from '../components/TableGrid';
import QuickStats from '../components/QuickStats';

const Dashboard = () => {
  const [view, setView] = React.useState('floor');

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
          >
            <ToggleButton value="floor" sx={{ px: 2, gap: 1 }}>
              <GridViewIcon fontSize="small" /> Floor Plan
            </ToggleButton>
            <ToggleButton value="food" sx={{ px: 2, gap: 1 }}>
              <FastFoodIcon fontSize="small" /> Master Food
            </ToggleButton>
            <ToggleButton value="order" sx={{ px: 2, gap: 1 }}>
              <ListAltIcon fontSize="small" /> Order List
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Stack spacing={3}>
          <TableStatus />

          <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1, p: 4, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <TableGrid />
            </Box>
            <QuickStats />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
