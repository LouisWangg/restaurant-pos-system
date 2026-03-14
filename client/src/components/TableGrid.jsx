import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

const tables = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  status: i % 7 === 0 ? 'Occupied' : i % 5 === 0 ? 'Reserved' : i % 11 === 0 ? 'Inactive' : 'Available',
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'Available': return '#64748b';
    case 'Occupied': return '#1e293b';
    case 'Reserved': return '#94a3b8';
    case 'Inactive': return '#cbd5e1';
    default: return '#64748b';
  }
};

const TableGrid = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        {tables.map((table) => (
          <Grid item xs={3} sm={2} key={table.id}>
            <Paper
              elevation={0}
              sx={{
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: getStatusColor(table.status),
                color: 'white',
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  opacity: 0.9,
                },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {table.id}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TableGrid;
