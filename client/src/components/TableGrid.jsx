import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

const tables = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  status: i % 7 === 0 ? 'Occupied' : i % 5 === 0 ? 'Reserved' : i % 11 === 0 ? 'Inactive' : 'Available',
}));

const getStatusColor = (status) => {
  switch (status) {
    case 'Available': return '#22c55e';
    case 'Occupied': return '#ef4444';
    case 'Reserved': return '#f59e0b';
    case 'Inactive': return '#64748b';
    default: return '#22c55e';
  }
};

const TableGrid = () => {
  return (
    <Box 
      sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)', 
        gap: 2,
        width: '100%'
      }}
    >
      {tables.map((table) => (
        <Paper
          key={table.id}
          elevation={0}
          sx={{
            aspectRatio: '1.6 / 1',
            width: '100%',
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
      ))}
    </Box>
  );
};

export default TableGrid;
