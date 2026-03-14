import React from 'react';
import { Box, Typography } from '@mui/material';

const statuses = [
  { label: 'Available', color: '#64748b' }, // Slate 500
  { label: 'Occupied', color: '#1e293b' }, // Slate 800
  { label: 'Reserved', color: '#94a3b8' }, // Slate 400
  { label: 'Inactive', color: '#cbd5e1' }, // Slate 300
];

const TableStatus = () => {
  return (
    <Box sx={{ p: 2, display: 'flex', gap: 4, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
        Table Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {statuses.map((status) => (
          <Box key={status.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                bgcolor: status.color,
                borderRadius: 0.5,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {status.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default TableStatus;
