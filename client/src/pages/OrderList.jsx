import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';
import {
  Search,
  Edit,
  Visibility,
  Print,
  GridView as GridViewIcon,
  Fastfood as FastFoodIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import orderService from '../services/orderService';
import { jsPDF } from 'jspdf';

const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' }
];

const OrderList = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab,
        search: searchQuery
      };
      const response = await orderService.getOrders(params);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || (user.role !== 'Pelayan' && user.role !== 'Kasir')) {
      showSnackbar('Halaman tersebut hanya dapat diakses oleh Pelayan dan Kasir', 'error');
      const timer = setTimeout(() => navigate('/dashboard'), 4000);
      return () => clearTimeout(timer);
    }

    fetchOrders();
  }, [user, authLoading, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewChange = (event, next) => {
    if (!next) return;
    if (next === 'floor') navigate('/dashboard');
    if (next === 'food') navigate('/foods');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchOrders();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePrintBill = (order) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [104, 200],
    });

    const now = new Date(order.closed_at || order.updated_at);
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(/\//g, '-') + ' ' + now.toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit', hour12: false });

    const serverName = order.user?.name || 'Server';
    const tableNumber = order.table?.table_number || 'N/A';

    doc.setFont('courier', 'normal');
    doc.setFontSize(10);

    let y = 10;
    const line = (text) => {
      doc.text(text, 5, y);
      y += 5;
    };

    const centerText = (text) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (104 - textWidth) / 2, y);
      y += 5;
    };

    line('============================================');
    centerText('RESTAURANT POS');
    line('============================================');
    line(`Date  : ${formattedDate}`);
    line(`Table : ${tableNumber}`);
    line(`Server: ${serverName}`);
    line('============================================');
    line('ITEM                QTY     PRICE      TOTAL');
    line('--------------------------------------------');

    let subtotal = 0;
    (order.items || []).forEach(({ food, qty, status, price }) => {
      if (status === 'cancelled') return;
      const rowTotal = price * qty;
      subtotal += rowTotal;

      const foodName = food.name.substring(0, 19).padEnd(19, ' ');
      const q = qty.toString().padStart(3, ' ');
      const p = parseFloat(price).toLocaleString('id-ID').padStart(9, ' ');
      const dispTotal = rowTotal.toLocaleString('id-ID').padStart(10, ' ');

      line(`${foodName} ${q} ${p} ${dispTotal}`);
    });

    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;

    line('--------------------------------------------');
    line(`${"SUBTOTAL".padEnd(34, ' ')}${subtotal.toLocaleString('id-ID').padStart(10, ' ')}`);
    line(`${"TAX (10%)".padEnd(34, ' ')}${tax.toLocaleString('id-ID').padStart(10, ' ')}`);
    line(`${"GRAND TOTAL".padEnd(34, ' ')}${grandTotal.toLocaleString('id-ID').padStart(10, ' ')}`);
    line('============================================');
    y += 2;
    centerText('TERIMA KASIH ATAS KUNJUNGANNYA');
    line('============================================');

    doc.save(`Bill-${order.order_number}.pdf`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Order List
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value="order"
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{
                bgcolor: 'white',
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#f1f5f9',
                    color: '#1e293b',
                    fontWeight: 'bold'
                  }
                }
              }}
            >
              <ToggleButton value="floor" sx={{ gap: 1 }}>
                <GridViewIcon fontSize="small" /> Floor Plan
              </ToggleButton>
              <ToggleButton value="food" sx={{ gap: 1 }}>
                <FastFoodIcon fontSize="small" /> Master Food
              </ToggleButton>
              <ToggleButton value="order" sx={{ gap: 1 }}>
                <ListAltIcon fontSize="small" /> Order List
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Tabs / Filters */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTabs-indicator': { bgcolor: '#1e293b', height: 3 },
              '& .MuiTab-root': {
                py: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                '&.Mui-selected': { color: '#1e293b' }
              }
            }}
          >
            {ORDER_STATUS_FILTERS.map(filter => (
              <Tab key={filter.value} value={filter.value} label={filter.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Search row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <TextField
            placeholder="Search by Order Number or Table Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{
              width: '600px',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 3,
                height: 48,
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#1e293b' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2.5 }}>ORDER NUMBER</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TABLE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL PRICE</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? orders.map((order) => (
                  <TableRow key={order.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {order.order_number}
                    </TableCell>
                    <TableCell sx={{ color: '#1e293b', fontWeight: 600 }}>
                      Table {order.table?.table_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: order.status === 'open' ? '#fef3c7' : '#f1f5f9',
                          color: order.status === 'open' ? '#92400e' : '#475569',
                          fontWeight: 'bold',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatCurrency(order.total_price)}
                    </TableCell>
                    <TableCell align="right">
                      {order.status === 'open' ? (
                        <IconButton
                          onClick={() => {
                            if (user.role === 'Kasir') {
                              const hasConfirmed = order.items?.some(item => item.status === 'confirmed');
                              if (!hasConfirmed) {
                                showSnackbar('Pesanan belum ada yang dikonfirmasi. Kasir hanya dapat mengakses pesanan yang siap bayar.', 'error');
                                return;
                              }
                            }
                            navigate(`/orders/${order.table_id}`, { state: { from: '/orders' } });
                          }}
                          sx={{ color: '#64748b' }}
                          title="Edit Order"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      ) : (
                        <>
                          <IconButton
                            onClick={() => navigate(`/orders/view/${order.id}`, { state: { from: '/orders' } })}
                            sx={{ color: '#64748b', mr: 1 }}
                            title="View Details"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handlePrintBill(order)}
                            sx={{ color: '#64748b' }}
                            title="Print Bill"
                          >
                            <Print fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <ListAltIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography>No orders found matching your criteria</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default OrderList;
