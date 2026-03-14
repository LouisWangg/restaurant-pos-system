import { TextField, Button, Box, Link, Typography, Alert, Checkbox, FormControlLabel } from '@mui/material';
import { useState } from "react";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus(null);

    try {
      // Get CSRF cookie first
      await api.get('/sanctum/csrf-cookie');

      // Attempt login
      await api.post('/login', { email, password, remember });

      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setStatus('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <AuthLayout
      title="Welcome"
      subtitle="Enter your credentials to access your account"
    >
      {status && <Alert severity="error" sx={{ mb: 3 }}>{status}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
          helperText={errors.email?.[0]}
        />
        <TextField
          margin="normal"
          required
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
          helperText={errors.password?.[0]}
        />

        <FormControlLabel
          control={
            <Checkbox
              value="remember"
              color="primary"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
          }
          label="Remember me"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, height: 50, fontSize: '1rem' }}
        >
          Sign In
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default Login;
