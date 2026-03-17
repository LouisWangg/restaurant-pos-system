import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Add,
  Edit,
  Delete,
  KeyboardArrowRight,
  RestaurantMenu,
  GridView as GridViewIcon,
  Fastfood as FastFoodIcon,
  ListAlt as ListAltIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import foodService from '../services/foodService';

const FOOD_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'appetizer', label: 'Appetizers' },
  { value: 'main_course', label: 'Main Course' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'beverage', label: 'Beverages' },
  { value: 'salad', label: 'Salads' }
];

const FoodManagement = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [currentFood, setCurrentFood] = useState(null); // null if adding
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'main_course'
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => {
    // Wait until auth is resolved before checking role
    if (authLoading) return;

    // Not logged in or wrong role
    if (!user || user.role !== 'Pelayan') {
      setSnackbar({
        open: true,
        message: 'Halaman tersebut hanya dapat diakses oleh Pelayan',
        severity: 'error',
      });
      setTimeout(() => navigate('/dashboard'), 4000);
      return;
    }

    fetchFoods();
  }, [user, authLoading]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const data = await foodService.getFoods();
      setFoods(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
      setError('Failed to load food menu. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewChange = (event, next) => {
    if (!next) return;
    if (next === 'floor') {
      navigate('/dashboard');
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesTab = activeTab === 'all' || food.type === activeTab;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.price?.toString().includes(searchQuery.toLowerCase()) ||
      food.type?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenModal = (food = null) => {
    if (food) {
      setCurrentFood(food);
      setFormData({
        name: food.name,
        description: food.description || '',
        price: food.price,
        type: food.type
      });
    } else {
      setCurrentFood(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        type: 'main_course'
      });
    }
    setFormErrors({});
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Only allow numbers
      const cleaned = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'name') {
      // Only letters and spaces
      const cleaned = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else if (name === 'description') {
      // No numbers, allow letters, spaces, and . , & ( ) /
      const cleaned = value.replace(/[^a-zA-Z\s.,&()/]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      if (currentFood) {
        await foodService.updateFood(currentFood.id, formData);
        showSnackbar('Menu berhasil diperbarui!');
      } else {
        await foodService.createFood(formData);
        showSnackbar('Menu baru berhasil ditambahkan!');
      }
      handleCloseModal();
      fetchFoods();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors);
      } else {
        console.error('Failed to save food:', err);
        showSnackbar('Gagal menyimpan menu.', 'error');
      }
    }
  };

  const handleDelete = (food) => {
    setFoodToDelete(food);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!foodToDelete) return;

    try {
      await foodService.deleteFood(foodToDelete.id);
      setOpenDeleteModal(false);
      setFoodToDelete(null);
      fetchFoods();
      showSnackbar('Menu berhasil dihapus!', 'success');
    } catch (err) {
      console.error('Failed to delete food:', err);
      showSnackbar('Gagal menghapus menu.', 'error');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Master Food
            </Typography>
            {/* <Typography variant="body1" color="text.secondary">
              Manage your restaurant menu items and categories
            </Typography> */}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value="food"
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

        {/* Tabs / Categories */}
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
            {FOOD_TYPES.map(type => (
              <Tab key={type.value} value={type.value} label={type.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Search and Add Button row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
          <TextField
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
            sx={{
              height: 48,
              minWidth: 200,
              ml: 'auto', // Pushes the button to the absolute right
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              bgcolor: '#1e293b',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#0f172a' }
            }}
          >
            Add New Menu
          </Button>
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
                  <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2.5 }}>NAME</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DESCRIPTION</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PRICE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>CATEGORY</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFoods.length > 0 ? filteredFoods.map((food) => (
                  <TableRow key={food.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                      {food.name}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', maxWidth: 300 }}>
                      <Typography variant="body2" noWrap title={food.description}>
                        {food.description || 'No description'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {formatCurrency(food.price)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {food.type.replace('_', ' ')}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenModal(food)} sx={{ color: '#64748b', mr: 1 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(food)} sx={{ color: '#ef4444' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Box sx={{ opacity: 0.5 }}>
                        <RestaurantMenu sx={{ fontSize: 48, mb: 2 }} />
                        <Typography>No food items found matching your criteria</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Add/Edit Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, px: 1, py: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b' }}>
          {currentFood ? 'Edit Food Item' : 'Add New Food Item'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                fullWidth
                label="Food Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name?.[0]}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                error={!!formErrors.description}
                helperText={formErrors.description?.[0]}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Price (IDR)"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  error={!!formErrors.price}
                  helperText={formErrors.price?.[0]}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                  <InputLabel id="type-label">Category</InputLabel>
                  <Select
                    labelId="type-label"
                    label="Category"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    {FOOD_TYPES.filter(t => t.value !== 'all').map(type => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseModal} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                bgcolor: '#1e293b',
                '&:hover': { bgcolor: '#0f172a' }
              }}
            >
              {currentFood ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        PaperProps={{ sx: { borderRadius: 4, px: 2, py: 1, maxWidth: 400 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b', pb: 1 }}>
          Hapus Menu?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b' }}>
            Apakah Anda yakin ingin menghapus <strong>{foodToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 2 }}>
          <Button
            onClick={() => setOpenDeleteModal(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 'bold',
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Hapus Sekarang
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default FoodManagement;
