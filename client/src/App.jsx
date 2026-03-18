import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, Typography, Button } from '@mui/material';
import theme from './theme';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FoodManagement from './pages/FoodManagement';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/foods" element={<FoodManagement />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:tableId" element={<OrderDetail />} />
          <Route path="/orders/view/:orderId" element={<OrderDetail />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
