import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Add,
  Remove,
  Delete,
  Send,
  SaveAlt,
  Print,
  Logout,
  EditNote
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import foodService from '../services/foodService';
import tableService from '../services/tableService';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';

const FOOD_TYPES = [
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Beverages' },
  { value: 'salad', label: 'Salads' },
];

const OrderDetail = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/dashboard', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appetizer');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState([]); // { food, quantity }
  const [tableInfo, setTableInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [noteModal, setNoteModal] = useState({ open: false, foodId: null, note: '' });

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));


  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsData, tableData] = await Promise.all([
          foodService.getFoods(),
          tableService.getTableById(tableId),
        ]);

        const tbl = tableData.data || tableData;

        // Role-based Access Control for Kasir
        if (user?.role === 'Kasir' && tbl.status !== 'occupied') {
          setSnackbar({
            open: true,
            message: 'Halaman tersebut hanya dapat diakses oleh Pelayan',
            severity: 'error'
          });
          setTimeout(() => {
            navigate('/dashboard');
          }, 4000); // 4 seconds delay to read the snackbar
          return;
        }

        setFoods(foodsData);
        setTableInfo(tbl);

        // If table is occupied and has an active order, populate orderItems
        if (tbl.status === 'occupied' && tbl.active_order) {
          const existingItems = tbl.active_order.items.map(item => ({
            food: item.food,
            quantity: item.qty,
            note: item.note || '',
            status: item.status // Track item status (draft/confirmed)
          }));
          setOrderItems(existingItems);
        }
      } catch (err) {
        console.error('Failed to load order data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId, user, navigate]);

  const filteredFoods = foods.filter((food) => {
    const matchesTab = food.type === activeTab;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddItem = (food) => {
    setOrderItems((prev) => {
      const existingDraft = prev.find((item) => item.food.id === food.id && item.status === 'draft');
      if (existingDraft) {
        return prev.map((item) =>
          (item.food.id === food.id && item.status === 'draft')
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { food, quantity: 1, note: '', status: 'draft' }];
    });
  };

  const handleUpdateQty = (foodId, delta) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          (item.food.id === foodId && item.status === 'draft')
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0 || item.status !== 'draft')
    );
  };

  const handleRemoveItem = (foodId) => {
    setOrderItems((prev) => prev.filter((item) => !(item.food.id === foodId && item.status === 'draft')));
  };

  const handleOrderAction = async (itemStatus) => {
    if (orderItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        table_id: tableId,
        item_status: itemStatus,
        items: orderItems.map(item => ({
          food_id: item.food.id,
          qty: item.quantity,
          price: item.food.price,
          note: item.note || null
        }))
      };

      await orderService.createOrder(payload);

      const successMessage = `Pesanan berhasil ${itemStatus === 'confirmed' ? 'dikonfirmasi' : 'disimpan sebagai draft'}!`;

      // Navigate to dashboard immediately and pass snackbar info via state
      navigate('/dashboard', {
        state: {
          snackbar: {
            open: true,
            message: successMessage,
            severity: 'success'
          }
        }
      });

    } catch (err) {
      console.error('Failed to process order:', err);
      setSnackbar({
        open: true,
        message: 'Gagal memproses pesanan. Silakan coba lagi.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const total = orderItems.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0
  );

  const handleOpenNoteModal = (foodId, currentNote) => {
    setNoteModal({ open: true, foodId, note: currentNote || '' });
  };

  const handleSaveNote = () => {
    setOrderItems(prev => prev.map(item =>
      item.food.id === noteModal.foodId ? { ...item, note: noteModal.note } : item
    ));
    setNoteModal({ open: false, foodId: null, note: '' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      {/* ── TOP NAVBAR ── */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        py: 2,
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: '#e2e8f0',
      }}>
        {/* Left: Back button, Table Info, New Order Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBack fontSize="small" sx={{ color: '#1e293b' }} />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              Table {tableInfo?.table_number || tableId}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              {tableInfo?.status === 'available' && "New Order"}
              {tableInfo?.status === 'occupied' && (tableInfo.active_order?.order_number || "Active Order")}
              {tableInfo?.status === 'reserved' && "Reserved"}
            </Typography>
          </Box>
        </Box>

        {/* Right: User Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'capitalize' }}>
                    {user.role}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: '#1e293b',
                    color: 'white',
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
                    '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
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
          )}
        </Box>
      </Box>

      {/* ── MAIN CONTENT ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── LEFT PANEL: Menu List ── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden', borderRight: '1px solid #e2e8f0' }}>
          {/* Category Tabs */}
          <Box sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTabs-indicator': { bgcolor: '#1e293b', height: 2 },
                '& .MuiTab-root': {
                  minHeight: 40,
                  py: 0,
                  px: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#64748b',
                  '&.Mui-selected': { color: '#1e293b' },
                },
              }}
            >
              {FOOD_TYPES.map((t) => (
                <Tab key={t.value} value={t.value} label={t.label} />
              ))}
            </Tabs>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: 2,
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#e2e8f0' },
                '&:hover fieldset': { borderColor: '#cbd5e1' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Food List */}
          <Box sx={{ flex: 1, overflowY: 'auto', pr: 0.5 }}>
            {filteredFoods.map((food) => (
              <Paper
                key={food.id}
                elevation={0}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                  transition: 'all 0.15s',
                }}
              >
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.3 }}>
                    {food.name}
                  </Typography>
                  {food.description && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }} noWrap>
                      {food.description}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {formatCurrency(food.price)}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleAddItem(food)}
                  size="small"
                  sx={{
                    bgcolor: '#1e293b',
                    color: 'white',
                    borderRadius: 1.5,
                    width: 36,
                    height: 36,
                    '&:hover': { bgcolor: '#0f172a' },
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Box>
        </Box>

        {/* ── RIGHT PANEL: Current Order ── */}
        <Box sx={{ width: 700, display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'white' }}>
          {/* Order Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
              Current Order
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Table {tableInfo?.table_number || tableId} &bull; {today}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Order Items */}
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
            {orderItems.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Belum ada item yang dipesan
                </Typography>
              </Box>
            ) : (
              orderItems.map(({ food, quantity, note, status }, index) => (
                <Box key={`${food.id}-${status}-${index}`} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {food.name}
                        {status === 'confirmed' && 
                          <Box component="span" sx={{ fontSize: '0.75rem', ml: 1, color: '#64748b', fontWeight: 400 }}>
                            (Confirmed)
                          </Box>
                        }
                      </Typography>
                      {note && (
                        <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block' }}>
                          Note: {note}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatCurrency(food.price * quantity)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQty(food.id, -1)}
                      disabled={status !== 'draft'}
                      sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}
                    >
                      <Remove sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography sx={{ px: 1, minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                      {quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQty(food.id, 1)}
                      disabled={status !== 'draft'}
                      sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}
                    >
                      <Add sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Box sx={{ flex: 1 }} />
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenNoteModal(food.id, note)}
                      disabled={status !== 'draft'}
                      sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' }, mr: 0.5 }}
                    >
                      <EditNote sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveItem(food.id)}
                      disabled={status !== 'draft'}
                      sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>Total:</Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#1e293b' }}>
              {formatCurrency(total)}
            </Typography>
          </Box>

          {/* Action Buttons */}
          {tableInfo?.status === 'available' || tableInfo?.status === 'reserved' ? (
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Send sx={{ fontSize: 16 }} />}
                disabled={orderItems.length === 0 || isSubmitting}
                onClick={() => handleOrderAction('confirmed')}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#1e293b',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: '#0f172a' },
                }}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Order'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SaveAlt sx={{ fontSize: 16 }} />}
                disabled={orderItems.length === 0 || isSubmitting}
                onClick={() => handleOrderAction('draft')}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                Save Draft
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* If occupied, maybe show "Add Order" and "Print Bill" */}
              <Button
                fullWidth
                variant="contained"
                startIcon={<Send sx={{ fontSize: 16 }} />}
                disabled={orderItems.length === 0 || isSubmitting}
                onClick={() => handleOrderAction('confirmed')}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: '#1e293b',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: '#0f172a' },
                }}
              >
                Post Additional Order
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Print sx={{ fontSize: 16 }} />}
                disabled={isSubmitting}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                }}
              >
                Print Bill
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ top: { xs: 80, sm: 105 } }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ minWidth: 250, borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Note Modal */}
      <Dialog
        open={noteModal.open}
        onClose={() => setNoteModal({ open: false, foodId: null, note: '' })}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b' }}>Tambah Catatan</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5, color: '#64748b' }}>
            Tambahkan instruksi khusus untuk koki (misalnya: tidak pedas, tanpa bawang, dll.)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Ketik catatan di sini..."
            value={noteModal.note}
            onChange={(e) => {
              const val = e.target.value;
              // Allow alphanumeric, space, and . , / ( )
              const filtered = val.replace(/[^a-zA-Z0-9\s.,\/()]/g, '');
              setNoteModal({ ...noteModal, note: filtered });
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setNoteModal({ open: false, foodId: null, note: '' })}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleSaveNote}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#1e293b',
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: '#0f172a' }
            }}
          >
            Simpan Catatan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetail;
