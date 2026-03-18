import React from 'react';
import { Box, Paper, Typography, Stack } from '@mui/material';

const QuickStats = ({ stats }) => {
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
