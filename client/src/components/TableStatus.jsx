import React from 'react';
import { Box, Typography } from '@mui/material';

import { TABLE_STATUS_LIST } from '../constants/tableStatus';

const TableStatus = () => {
  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
        Table Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {TABLE_STATUS_LIST.map((status) => (
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
