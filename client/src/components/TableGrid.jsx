import React, { useState } from 'react';
import { Box, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import tableService from '../services/tableService';
import { useAuth } from '../context/AuthContext';

const getStatusColor = (status) => {
  switch (status) {
    case 'available': return '#22c55e';
    case 'occupied': return '#ef4444';
    case 'reserved': return '#f59e0b';
    case 'inactive': return '#64748b';
    default: return '#22c55e';
  }
};

const TableGrid = ({ tables, onTableUpdate, setSnackbar }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState(null);

  const handleTableClick = (table) => {
    if (!user || (user.role !== 'Pelayan' && user.role !== 'Kasir')) {
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: 'Fitur tersebut hanya dapat diakses oleh Pelayan dan Kasir',
          severity: 'error'
        });
      }
      return;
    }

    if (table.status === 'available') {
      setSelectedTable(table);
    }
  };

  const handleOpenOrder = () => {
    navigate(`/orders/${selectedTable.id}`);
    setSelectedTable(null);
  };

  const handleReserve = async () => {
    if (!selectedTable) return;
    try {
      await tableService.updateTableStatus(selectedTable.id, 'reserved');
      if (onTableUpdate) {
        onTableUpdate();
      }
    } catch (err) {
      console.error("Failed to reserve table:", err);
    } finally {
      setSelectedTable(null);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 2,
          width: '100%'
        }}
      >
        {tables.map((table) => (
          <Paper
            key={table.id}
            elevation={0}
            onClick={() => handleTableClick(table)}
            sx={{
              aspectRatio: '1.6 / 1',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: getStatusColor(table.status),
              color: 'white',
              borderRadius: 2,
              cursor: table.status === 'available' ? 'pointer' : 'default',
              transition: 'transform 0.2s, opacity 0.2s',
              '&:hover': table.status === 'available' ? {
                transform: 'scale(1.05)',
                opacity: 0.9,
              } : {},
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {table.table_number}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Table Action Modal */}
      <Dialog
        open={Boolean(selectedTable)}
        onClose={() => setSelectedTable(null)}
        PaperProps={{ 
          sx: { 
            borderRadius: 4, 
            px: 1, 
            py: 1, 
            minWidth: 360,
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1e293b', pb: 0, pt: 2 }}>
          Table {selectedTable?.table_number}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
            Pilih tindakan yang ingin Anda lakukan untuk meja ini.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleReserve}
            variant="outlined"
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderColor: '#e2e8f0',
              color: '#475569',
              transition: 'all 0.2s',
              '&:hover': { 
                borderColor: '#cbd5e1', 
                bgcolor: '#f8fafc',
                transform: 'translateY(-2px)'
              },
            }}
          >
            Reserve Table
          </Button>
          <Button
            onClick={handleOpenOrder}
            variant="contained"
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              bgcolor: '#1e293b',
              boxShadow: 'none',
              transition: 'all 0.2s',
              '&:hover': { 
                bgcolor: '#0f172a',
                boxShadow: '0 10px 15px -3px rgba(30, 41, 59, 0.3)',
                transform: 'translateY(-2px)'
              },
            }}
          >
            Open Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TableGrid;
