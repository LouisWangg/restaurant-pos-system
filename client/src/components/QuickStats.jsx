import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';

const stats = [
  { label: 'Available Tables', count: 12, color: '#64748b' },
  { label: 'Occupied Tables', count: 8, color: '#1e293b' },
  { label: 'Reserved Tables', count: 3, color: '#94a3b8' },
  { label: 'Inactive Tables', count: 2, color: '#cbd5e1' },
];

const QuickStats = () => {
  return (
    <Box sx={{ width: 280 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
        Quick Stats
      </Typography>
      <Stack spacing={2}>
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: stat.color }}>
              {stat.count}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default QuickStats;
