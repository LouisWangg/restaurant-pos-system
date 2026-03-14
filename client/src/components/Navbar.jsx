import React from 'react';
import { Box, TextField, Typography, Avatar, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Navbar = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Box
          sx={{
            bgcolor: '#1e293b',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 'bold',
          }}
        >
          RestaurantPOS
        </Box>
        <TextField
          size="small"
          placeholder="Search table..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 250 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Sarah Johnson
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Server
          </Typography>
        </Box>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'neutral.light',
            color: 'primary.main',
          }}
        >
          SJ
        </Avatar>
      </Box>
    </Box>
  );
};

export default Navbar;
