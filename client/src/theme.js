import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1e293b', // Slate 800
      light: '#334155', // Slate 700
      dark: '#0f172a', // Slate 900
      contrastText: '#fff',
    },
    secondary: {
      main: '#64748b', // Slate 500
    },
    neutral: {
      main: '#94a3b8', // Slate 400
      light: '#f1f5f9', // Slate 100
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
  },
});

export default theme;
