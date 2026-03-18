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
  Cancel,
  Delete,
  Send,
  Print,
  CheckCircle,
  Logout,
  EditNote,
  SaveAlt
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import foodService from '../services/foodService';
import tableService from '../services/tableService';
import orderService from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/SnackbarContext';

const FOOD_TYPES = [
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Beverages' },
  { value: 'salad', label: 'Salads' },
];

const OrderDetail = () => {
  const { tableId, orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { showSnackbar } = useSnackbar();
  const isReadOnly = !!orderId;
  const isKasir = user?.role === 'Kasir';
  const isRestricted = isKasir && !isReadOnly;

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/dashboard');
    }
  };

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
  const [orderItems, setOrderItems] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteModal, setNoteModal] = useState({ open: false, itemIndex: null, note: '' });
  const [activeOrderId, setActiveOrderId] = useState(null);


  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isReadOnly) {
          const response = await orderService.getOrderById(orderId);
          const order = response.data;
          setTableInfo({ ...order.table, active_order: order });
          setActiveOrderId(order.id);
          const existingItems = order.items.map(item => ({
            id: item.id,
            food: item.food,
            price: item.price,
            quantity: item.qty,
            note: item.note || '',
            status: item.status
          }));
          setOrderItems(existingItems);
        } else {
          const [foodsData, tableData] = await Promise.all([
            foodService.getFoods(),
            tableService.getTableById(tableId),
          ]);

          const tbl = tableData.data || tableData;

          if (user?.role === 'Kasir' && tbl.status !== 'occupied') {
            showSnackbar('Halaman tersebut hanya dapat diakses oleh Pelayan', 'error');
            setTimeout(() => {
              navigate('/dashboard');
            }, 4000);
            return;
          }

          setFoods(foodsData.data || foodsData);
          setTableInfo(tbl);

          if ((tbl.status === 'occupied' || tbl.status === 'reserved') && tbl.active_order) {
            setActiveOrderId(tbl.active_order.id);
            const existingItems = tbl.active_order.items.map(item => ({
              id: item.id,
              food: item.food,
              price: item.price,
              quantity: item.qty,
              note: item.note || '',
              status: item.status
            }));
            setOrderItems(existingItems);
          }
        }
      } catch (err) {
        console.error('Failed to load order data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId, orderId, isReadOnly, user]);

  const filteredFoods = foods.filter((food) => {
    const matchesTab = food.type === activeTab;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddItem = (food) => {
    setOrderItems((prev) => {
      const existingNew = prev.find((item) => item.food.id === food.id && item.status === 'new');
      if (existingNew) {
        return prev.map((item) =>
          (item.food.id === food.id && item.status === 'new')
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { food, price: food.price, quantity: 1, note: '', status: 'new' }];
    });
  };

  const handleUpdateQty = (index, delta) => {
    setOrderItems((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(item.status === 'new' ? 0 : 1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0 || item.status !== 'new')
    );
  };

  const handleItemAction = async (index) => {
    const item = orderItems[index];

    switch (item.status) {
      case 'new':
        setOrderItems(prev => prev.filter((_, i) => i !== index));
        break;

      case 'draft':
        try {
          await orderService.updateOrderItemStatus(item.id, 'cancelled');
          setOrderItems(prev =>
            prev.map((it, i) =>
              i === index ? { ...it, status: 'cancelled' } : it
            )
          );
        } catch (err) {
          showSnackbar('Gagal membatalkan item', 'error');
        }
        break;

      default:
        break;
    }
  };

  const handleOrderAction = async (itemStatus) => {
    if (orderItems.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        order_id: activeOrderId,
        table_id: tableId,
        items: orderItems
          .filter((item) => item.status !== 'cancelled')
          .map((item) => ({
            id: item.id || null,
            food_id: item.food.id,
            qty: item.quantity,
            price: item.price,
            note: item.note,
          })),
        item_status: itemStatus,
        total_price: total
      };

      await orderService.createOrder(payload);

      const successMessage = `Pesanan berhasil ${itemStatus === 'confirmed' ? 'dikonfirmasi' : 'disimpan sebagai draft'}!`;

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
      showSnackbar('Gagal memproses pesanan. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!activeOrderId) return;

    setIsSubmitting(true);
    try {
      await orderService.closeOrder(activeOrderId);
      navigate('/dashboard', {
        state: {
          snackbar: {
            open: true,
            message: 'Meja sekarang tersedia kembali!',
            severity: 'success'
          }
        }
      });
    } catch (err) {
      console.error('Failed to close order:', err);
      showSnackbar('Gagal menutup pesanan. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintBill = () => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [104, 200],
    });

    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).replace(/\//g, '-') + ' ' + now.toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit', hour12: false });

    const serverName = user?.name || 'Server';
    const tableNumber = tableInfo?.table_number || tableId;

    doc.setFont('courier', 'normal');
    doc.setFontSize(10);

    let y = 10;
    const line = (text) => {
      doc.text(text, 5, y);
      y += 5;
    };

    const center = (text) => {
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (104 - textWidth) / 2, y);
      y += 5;
    };

    line('============================================');
    center('RESTAURANT POS');
    line('============================================');
    line(`Date  : ${formattedDate}`);
    line(`Table : ${tableNumber}`);
    line(`Server: ${serverName}`);
    line('============================================');
    line('ITEM                QTY     PRICE      TOTAL');
    line('--------------------------------------------');

    let subtotal = 0;
    orderItems.forEach(({ food, price, quantity, status }) => {
      if (status === 'cancelled') return;

      const rowTotal = price * quantity;
      subtotal += rowTotal;

      const foodName = food.name.substring(0, 19).padEnd(19, ' ');
      const qty = quantity.toString().padStart(3, ' ');
      const priceVal = price.toLocaleString('id-ID').padStart(9, ' ');
      const dispTotal = rowTotal.toLocaleString('id-ID').padStart(10, ' ');

      line(`${foodName} ${qty} ${priceVal} ${dispTotal}`);
    });

    const tax = subtotal * 0.1;
    const grandTotal = subtotal + tax;

    line('--------------------------------------------');
    line(`${"SUBTOTAL".padEnd(34, ' ')}${subtotal.toLocaleString('id-ID').padStart(10, ' ')}`);
    line(`${"TAX (10%)".padEnd(34, ' ')}${tax.toLocaleString('id-ID').padStart(10, ' ')}`);
    line(`${"GRAND TOTAL".padEnd(34, ' ')}${grandTotal.toLocaleString('id-ID').padStart(10, ' ')}`);
    line('============================================');
    y += 2;
    center('TERIMA KASIH ATAS KUNJUNGANNYA');
    line('============================================');

    const orderNumberForFile = isReadOnly
      ? (orderItems.length > 0 ? tableInfo?.active_order?.order_number : orderId)
      : (tableInfo?.active_order?.order_number || tableNumber);

    doc.save(`Bill-${tableInfo?.active_order?.order_number || orderNumberForFile}.pdf`);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  const total = orderItems.reduce(
    (sum, item) => (item.status === 'cancelled' ? sum : sum + item.price * item.quantity),
    0
  );

  const hasItems = orderItems.length > 0;
  const hasInteractiveItems = orderItems.some((item) => item.status === 'new' || item.status === 'draft');
  const hasConfirmedItems = orderItems.some((item) => item.status === 'confirmed');
  const allCancelled = hasItems && orderItems.every((item) => item.status === 'cancelled');

  const isInitialOrder = tableInfo?.status === 'available' || tableInfo?.status === 'reserved';
  const showFooterButtons = isInitialOrder || hasInteractiveItems || allCancelled;
  const showOccupiedActions = tableInfo?.status === 'occupied' && hasConfirmedItems;
  const showPrintBill = showOccupiedActions && !hasInteractiveItems;

  const handleOpenNoteModal = (index, currentNote) => {
    setNoteModal({ open: true, itemIndex: index, note: currentNote || '' });
  };

  const handleSaveNote = () => {
    setOrderItems((prev) =>
      prev.map((item, i) =>
        i === noteModal.itemIndex ? { ...item, note: noteModal.note } : item
      )
    );
    setNoteModal({ open: false, itemIndex: null, note: '' });
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
        {/* Button Back, Info Meja, dan Badge Order */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} size="small" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBack fontSize="small" sx={{ color: '#1e293b' }} />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              Table {tableInfo?.table_number || tableId}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.75rem' }}>
              {isReadOnly ? (tableInfo?.active_order?.order_number) : (tableInfo?.status === 'available' && "New Order")}
              {!isReadOnly && tableInfo?.status === 'occupied' && (tableInfo.active_order?.order_number || "Active Order")}
              {!isReadOnly && tableInfo?.status === 'reserved' && "Reserved"}
            </Typography>
          </Box>
        </Box>

        {/* Info User */}
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

      {/* Left Panel */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', justifyContent: (isReadOnly || isRestricted) ? 'center' : 'flex-start' }}>
        {/*List Menu */}
        {!isReadOnly && !isRestricted && (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden', borderRight: '1px solid #e2e8f0' }}>
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

            <Box sx={{ flex: 1, overflowY: 'auto', pr: 2 }}>
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
        )}

        {/* Right Panel */}
        <Box sx={{ width: (isReadOnly || isRestricted) ? 800 : 700, display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'white' }}>
          {/* Order Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
              {isReadOnly || isRestricted ? "Order" : "Current Order"}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              Table {tableInfo?.table_number || tableId} &bull; {today}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Order Items */}
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, pr: 2 }}>
            {orderItems.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                  Belum ada item yang dipesan
                </Typography>
              </Box>
            ) : (
              orderItems
                .filter(item => (isReadOnly || isRestricted) ? item.status === 'confirmed' : true)
                .map(({ food, price, quantity, note, status }, index) => (
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
                          {status === 'cancelled' &&
                            <Box component="span" sx={{ fontSize: '0.75rem', ml: 1, color: '#ef4444', fontWeight: 400 }}>
                              (Cancelled)
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
                        {formatCurrency(price * quantity)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 32 }}>
                      {(status === 'new' || status === 'draft') && !isReadOnly && !isRestricted ? (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQty(index, -1)}
                            disabled={status === 'draft' && quantity <= 1}
                            sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}
                          >
                            <Remove sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography sx={{ px: 1, minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                            {quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQty(index, 1)}
                            sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}
                          >
                            <Add sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Box sx={{ flex: 1 }} />
                          <IconButton
                            size="small"
                            onClick={() => handleOpenNoteModal(index, note)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#6366f1' }, mr: 0.5 }}
                          >
                            <EditNote sx={{ fontSize: 20 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleItemAction(index)}
                            sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                          >
                            {status === 'new' ? (
                              <Delete sx={{ fontSize: 16 }} />
                            ) : (
                              <Cancel sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </>
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>
                          Qty: {quantity}
                        </Typography>
                      )}
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

          {/* Tombol Action */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {showOccupiedActions ? (
              <>
                {isRestricted ? (
                  /* Tombol untuk Kasir */
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                      disabled={isSubmitting}
                      onClick={handleCloseOrder}
                      sx={{ py: 1.5, borderRadius: 2, bgcolor: '#ef4444', fontWeight: 700, textTransform: 'none', fontSize: '0.95rem', '&:hover': { bgcolor: '#dc2626' } }}
                    >
                      Close Order
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Print sx={{ fontSize: 16 }} />}
                      disabled={!showPrintBill || isSubmitting}
                      onClick={handlePrintBill}
                      sx={{ py: 1.5, borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }, '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' } }}
                    >
                      Print Bill
                    </Button>
                  </Box>
                ) : (
                  /* Tombol untuk Pelayan */
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
                      disabled={isSubmitting}
                      onClick={handleCloseOrder}
                      sx={{ py: 1.5, borderRadius: 2, bgcolor: '#ef4444', fontWeight: 700, textTransform: 'none', fontSize: '0.95rem', '&:hover': { bgcolor: '#dc2626' } }}
                    >
                      Close Order
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Send sx={{ fontSize: 16 }} />}
                        disabled={!hasInteractiveItems || isSubmitting}
                        onClick={() => handleOrderAction('confirmed')}
                        sx={{ py: 1.5, borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }, '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' } }}
                      >
                        Send to Kitchen
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Print sx={{ fontSize: 16 }} />}
                        disabled={!showPrintBill || isSubmitting}
                        onClick={handlePrintBill}
                        sx={{ py: 1.5, borderRadius: 2, borderColor: '#e2e8f0', color: '#475569', fontWeight: 600, textTransform: 'none', '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }, '&.Mui-disabled': { borderColor: '#f1f5f9', color: '#cbd5e1' } }}
                      >
                        Print Bill
                      </Button>
                    </Box>
                  </>
                )}
              </>
            ) : (
              /* Tombol untuk Draft / data awal */
              !isReadOnly && !isRestricted && showFooterButtons && (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Send sx={{ fontSize: 16 }} />}
                    disabled={!hasItems || allCancelled || isSubmitting}
                    onClick={() => handleOrderAction('confirmed')}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: '#1e293b',
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': { bgcolor: '#0f172a' },
                      '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }
                    }}
                  >
                    {isSubmitting ? 'Confirming...' : 'Send to Kitchen'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SaveAlt sx={{ fontSize: 16 }} />}
                    disabled={!hasItems || allCancelled || isSubmitting}
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
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Modal Catatan */}
      <Dialog
        open={noteModal.open}
        onClose={() => setNoteModal({ open: false, itemIndex: null, note: '' })}
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
            onClick={() => setNoteModal({ open: false, itemIndex: null, note: '' })}
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
