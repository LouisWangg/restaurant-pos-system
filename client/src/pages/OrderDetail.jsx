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
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import foodService from '../services/foodService';
import tableService from '../services/tableService';

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

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appetizer');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState([]); // { food, quantity }
  const [tableInfo, setTableInfo] = useState(null);

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
        setFoods(foodsData);
        setTableInfo(tableData.data || tableData);
      } catch (err) {
        console.error('Failed to load order data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tableId]);

  const filteredFoods = foods.filter((food) => {
    const matchesTab = food.type === activeTab;
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddItem = (food) => {
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const handleUpdateQty = (foodId, delta) => {
    setOrderItems((prev) =>
      prev
        .map((item) =>
          item.food.id === foodId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (foodId) => {
    setOrderItems((prev) => prev.filter((item) => item.food.id !== foodId));
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8fafc', overflow: 'hidden' }}>
      {/* ── LEFT PANEL: Menu List ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3, overflow: 'hidden', borderRight: '1px solid #e2e8f0' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
              Table {tableInfo?.table_number || tableId}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
              New Order
            </Typography>
          </Box>
        </Box>

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
      <Box sx={{ width: 420, display: 'flex', flexDirection: 'column', p: 3, bgcolor: 'white' }}>
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
            orderItems.map(({ food, quantity }) => (
              <Box key={food.id} sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {food.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {formatCurrency(food.price * quantity)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleUpdateQty(food.id, -1)}
                    sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}>
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography sx={{ px: 1, minWidth: 24, textAlign: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                    {quantity}
                  </Typography>
                  <IconButton size="small" onClick={() => handleUpdateQty(food.id, 1)}
                    sx={{ border: '1px solid #e2e8f0', borderRadius: 1, p: 0.3 }}>
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Box sx={{ flex: 1 }} />
                  <IconButton size="small" onClick={() => handleRemoveItem(food.id)}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}>
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
        <Button
          fullWidth
          variant="contained"
          startIcon={<Send sx={{ fontSize: 16 }} />}
          disabled={orderItems.length === 0}
          sx={{
            mb: 1.5,
            py: 1.5,
            borderRadius: 2,
            bgcolor: '#1e293b',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#0f172a' },
          }}
        >
          Send to Kitchen
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SaveAlt sx={{ fontSize: 16 }} />}
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
            Save Draft
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Print sx={{ fontSize: 16 }} />}
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
      </Box>
    </Box>
  );
};

export default OrderDetail;
