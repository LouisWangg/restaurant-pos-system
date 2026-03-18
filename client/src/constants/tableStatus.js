export const TABLE_STATUS_DATA = {
  available: {
    label: 'Available',
    color: '#22c55e',
    statsLabel: 'Available Tables'
  },
  occupied: {
    label: 'Occupied',
    color: '#ef4444',
    statsLabel: 'Occupied Tables'
  },
  reserved: {
    label: 'Reserved',
    color: '#f59e0b',
    statsLabel: 'Reserved Tables'
  },
  inactive: {
    label: 'Inactive',
    color: '#64748b',
    statsLabel: 'Inactive Tables'
  }
};

export const STATUS_COLORS = Object.fromEntries(
  Object.entries(TABLE_STATUS_DATA).map(([key, value]) => [key, value.color])
);

export const TABLE_STATUS_LIST = Object.entries(TABLE_STATUS_DATA).map(([key, value]) => ({
  key,
  ...value
}));
