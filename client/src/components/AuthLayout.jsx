import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)', // Slate 100 to Slate 300
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
