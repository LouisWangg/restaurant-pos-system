import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status) => {
  switch (status) {
    case 'available': return '#22c55e';
    case 'occupied': return '#ef4444';
    case 'reserved': return '#f59e0b';
    case 'inactive': return '#64748b';
    default: return '#22c55e';
  }
};

const TableGrid = ({ tables }) => {
  const navigate = useNavigate();

  const handleTableClick = (table) => {
    if (table.status === 'available') {
      navigate(`/orders/${table.id}`);
    }
  };

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
          onClick={() => handleTableClick(table)}
          sx={{
            aspectRatio: '1.6 / 1',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: getStatusColor(table.status),
            color: 'white',
            borderRadius: 2,
            cursor: table.status === 'available' ? 'pointer' : 'default',
            transition: 'transform 0.2s, opacity 0.2s',
            '&:hover': table.status === 'available' ? {
              transform: 'scale(1.05)',
              opacity: 0.9,
            } : {},
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {table.table_number}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default TableGrid;
