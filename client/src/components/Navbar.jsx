import React, { useState } from 'react';
import { Box, Typography, Avatar, Button, Menu, MenuItem, ListItemIcon } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Logout } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/dashboard', { replace: true });
  };

  // Fungsi untuk mendapatkan inisial dari nama
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

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
          component={RouterLink}
          to="/dashboard"
          sx={{
            bgcolor: '#1e293b',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          RestaurantPOS
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!loading && (
          user ? (
            <>
              <Box
                onClick={handleClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
              >
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {user.role}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'neutral.light',
                    color: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
              </Box>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Login
            </Button>
          )
        )}
      </Box>
    </Box>
  );
};

export default Navbar;
