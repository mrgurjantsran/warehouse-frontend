'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Chip, Stack, Tab, Tabs,
  Select, FormControl, InputLabel, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Download as DownloadIcon, Settings as SettingsIcon,
  CheckCircle as CheckIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { pickingAPI } from '@/lib/api';
import { useWarehouse } from '@/app/context/WarehouseContext';
import { getStoredUser } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface PickingRow {
  wsn: string;
  picking_remarks: string;
  product_title?: string;
  brand?: string;
  cms_vertical?: string;
  fsp?: string;
  mrp?: string;
  rack_no?: string;
  source?: string;
  [key: string]: any;
}

// ====== PERSISTED COLUMN STATE ======
const loadColumnsFromStorage = (key: string, defaultCols: string[]) => {
  if (typeof window === 'undefined') return defaultCols;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultCols;
  } catch {
    return defaultCols;
  }
};

const saveColumnsToStorage = (key: string, cols: string[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(cols));
  } catch {}
};

export default function PickingPage() {
  const router = useRouter();
  const { activeWarehouse } = useWarehouse();
  const [user, setUser] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const inputRefs = useRef<any>({});

  // ====== MULTI ENTRY STATE ======
  const [multiRows, setMultiRows] = useState<PickingRow[]>([]);
  const [multiLoading, setMultiLoading] = useState(false);
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [commonPicker, setCommonPicker] = useState('');
  
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [allAvailableColumns] = useState(['wsn', 'picking_remarks', 'product_title', 'brand', 'cms_vertical', 'fsp', 'mrp', 'rack_no', 'source']);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);

  // ====== PICKING LIST STATE ======
  const [listData, setListData] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [listColumns, setListColumns] = useState<string[]>([]);
  const [listColumnSettingsOpen, setListColumnSettingsOpen] = useState(false);
  
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; order: 'asc' | 'desc' }>({ key: '', order: 'asc' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // ====== INITIALIZATION ======
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
    setCommonPicker(storedUser.fullName || '');
  }, [router]);

  // ====== LOAD COLUMN PREFERENCES ======
  useEffect(() => {
    const savedMultiCols = loadColumnsFromStorage('picking_multi_columns', ['wsn', 'picking_remarks', 'product_title', 'brand', 'fsp', 'mrp']);
    const savedListCols = loadColumnsFromStorage('picking_list_columns', ['wsn', 'product_title', 'brand', 'cms_vertical', 'fsp', 'mrp', 'picker_name', 'source']);
    const savedWidths: any = loadColumnsFromStorage('picking_column_widths', []);
    
    setVisibleColumns(savedMultiCols);
    setListColumns(savedListCols);
    setColumnWidths(typeof savedWidths === 'object' && !Array.isArray(savedWidths) ? savedWidths : {});
  }, []);

  // ====== INITIALIZE MULTI ROWS ======
  useEffect(() => {
    if (user && multiRows.length === 0) {
      generateEmptyRows(10);
    }
  }, [user]);

  // ====== LOAD LIST DATA ======
  useEffect(() => {
    if (activeWarehouse && tabValue === 1) {
      loadPickingList();
      loadCategories();
    }
  }, [activeWarehouse, tabValue, page, limit, searchFilter, categoryFilter]);

  // ====== MULTI ENTRY FUNCTIONS ======
  const generateEmptyRows = (count: number) => {
    const newRows = Array.from({ length: count }, () => ({
      wsn: '',
      picking_remarks: '',
      product_title: '',
      brand: '',
      cms_vertical: '',
      fsp: '',
      mrp: '',
      rack_no: '',
      source: ''
    }));
    setMultiRows(prev => [...prev, ...newRows]);
  };

  const updateMultiRow = async (index: number, field: string, value: string) => {
    const newRows = [...multiRows];
    newRows[index][field] = value;
    setMultiRows(newRows);

    // Auto-fetch when WSN entered
    if (field === 'wsn' && value.trim()) {
      try {
        console.log('Fetching data for WSN:', value);
        const response = await pickingAPI.getSourceByWSN(value, activeWarehouse?.id);
        console.log('Received data:', response.data);
        const data = response.data;
        
        newRows[index] = {
          ...newRows[index],
          product_title: data.product_title || '',
          brand: data.brand || '',
          cms_vertical: data.cms_vertical || '',
          fsp: data.fsp || '',
          mrp: data.mrp || '',
          rack_no: data.rack_no || '',
          source: data.source || ''
        };
        setMultiRows([...newRows]);
        toast.success(`✓ Data loaded for ${value}`);
            } catch (error: any) {
        console.error('WSN fetch error:', error);
        const errorMsg = error.response?.data?.error || 'WSN not found';
        toast.error(`❌ ${errorMsg}`);
      }

    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      const nextColIdx = colIdx + 1;
      const nextRowIdx = rowIdx + 1;
      
      if (nextColIdx < visibleColumns.length) {
        const nextKey = `${rowIdx}-${nextColIdx}`;
        setTimeout(() => inputRefs.current[nextKey]?.focus(), 10);
      } else if (nextRowIdx < multiRows.length) {
        const nextKey = `${nextRowIdx}-0`;
        setTimeout(() => inputRefs.current[nextKey]?.focus(), 10);
      }
    }
  };

  const handleMultiSubmit = async () => {
    const filtered = multiRows.filter((r: any) => r.wsn?.trim());
    if (filtered.length === 0) {
      toast.error('No valid WSN rows');
      return;
    }

    // Check duplicates
    const wsnCounts: { [key: string]: number } = {};
    for (const row of filtered) {
      const wsn = row.wsn?.trim() || '';
      wsnCounts[wsn] = (wsnCounts[wsn] || 0) + 1;
    }
    const duplicates = Object.entries(wsnCounts)
      .filter(([_, count]) => count > 1)
      .map(([wsn]) => wsn);

    if (duplicates.length > 0) {
      toast.error(`❌ Duplicate WSNs: ${duplicates.join(', ')}`);
      return;
    }

    setMultiLoading(true);
    try {
      const payload = filtered.map(row => ({
        wsn: row.wsn?.trim(),
        picking_date: commonDate,
        picker_name: commonPicker,
        picking_remarks: row.picking_remarks || '',
        product_title: row.product_title || '',
        brand: row.brand || '',
        cms_vertical: row.cms_vertical || '',
        fsp: row.fsp || '',
        mrp: row.mrp || '',
        rack_no: row.rack_no || '',
        source: row.source || ''
      }));

      console.log('Submitting payload:', payload);
      const res = await pickingAPI.multiEntry(payload, activeWarehouse?.id);
      
      toast.success(`✓ Saved ${res.data.successCount} rows`);
      setMultiRows([]);
      generateEmptyRows(10);
      if (tabValue === 1) loadPickingList();
    } catch (err: any) {
      console.error('Submit error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Multi entry failed';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setMultiLoading(false);
    }
  };

  // ====== PICKING LIST FUNCTIONS ======
  const loadPickingList = async () => {
    setListLoading(true);
    try {
      const response = await pickingAPI.getAll(page, limit, {
        warehouseId: activeWarehouse?.id,
        search: searchFilter,
        category: categoryFilter
      });
      
      let data = response.data.data;
      
      // Apply date range filter
      if (dateRange.start && dateRange.end) {
        data = data.filter((row: any) => {
          const date = new Date(row.picking_date);
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          return date >= start && date <= end;
        });
      }
      
      // Apply sorting
      if (sortConfig.key) {
        data.sort((a: any, b: any) => {
          const aVal = a[sortConfig.key];
          const bVal = b[sortConfig.key];
          
          if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      setListData(data);
      setTotal(response.data.total);
    } catch (error: any) {
      toast.error('Failed to load list');
    } finally {
      setListLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await pickingAPI.getAll(1, 1000, { warehouseId: activeWarehouse?.id });
      const uniqueCategories = Array.from(new Set(response.data.data.map((r: any) => r.cms_vertical).filter(Boolean))) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      setCategories([]);
    }
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(listData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Picking');
      const filename = `picking_${dateRange.start}_to_${dateRange.end || 'export'}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`✓ Exported ${listData.length} records`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleSort = (column: string) => {
    setSortConfig(prev => ({
      key: column,
      order: prev.key === column && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (!activeWarehouse) {
    return (
      <AppLayout>
        <Box sx={{ p: 6, textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Box sx={{ p: 5, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 4, color: 'white', boxShadow: '0 20px 60px rgba(102, 126, 234, 0.4)' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>⚠️ No Warehouse Selected</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Please select a warehouse to continue</Typography>
          </Box>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <Box sx={{ 
        width: '100%', 
        maxWidth: '100vw',
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        px: { xs: 0.5, sm: 1, md: 2 },
        overflowX: 'hidden'
      }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, py: 1, flexShrink: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.2rem' } }}>
            📦 Picking Management
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => {
              if (tabValue === 1) loadPickingList();
              loadCategories();
            }}
            sx={{ borderRadius: 1, fontWeight: 600, fontSize: { xs: '0.6rem', md: '0.75rem' }, py: { xs: 0.3, md: 0.5 }, px: { xs: 0.8, md: 1.5 } }}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Box>

        {/* TABS */}
        <Paper sx={{ mb: 1, flexShrink: 0, borderRadius: 1 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: { xs: '0.65rem', md: '0.8rem' },
                textTransform: 'none',
                minHeight: { xs: 32, md: 36 },
              }
            }}
          >
            <Tab label="🔢 Multi-Entry Grid" />
            <Tab label="📋 Picking List" />
          </Tabs>
        </Paper>

        {/* CONTENT */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: { xs: 0.5, md: 1 } }}>
          {/* TAB 0: MULTI ENTRY */}
          {tabValue === 0 && (
            <Box sx={{ py: 2 }}>
              <Stack spacing={2}>
                {/* HEADER SECTION */}
                <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, fontSize: '0.75rem', textTransform: 'uppercase', color: '#333' }}>
                    Header Information
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      type="date"
                      label="Picking Date"
                      value={commonDate}
                      onChange={(e) => setCommonDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Picker Name"
                      value={commonPicker}
                      onChange={(e) => setCommonPicker(e.target.value)}
                      size="small"
                      fullWidth
                    />
                    <Stack direction="row" spacing={0.5}>
                      <Button 
                        onClick={() => generateEmptyRows(10)} 
                        size="small" 
                        variant="outlined" 
                        sx={{ flex: 1, fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        +10 Rows
                      </Button>
                      <Button 
                        onClick={() => generateEmptyRows(100)} 
                        size="small" 
                        variant="outlined" 
                        sx={{ flex: 1, fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        +100 Rows
                      </Button>
                      <Button 
                        onClick={() => setColumnSettingsOpen(true)} 
                        size="small" 
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        sx={{ flex: 0.8, fontSize: '0.7rem', fontWeight: 600 }}
                      />
                    </Stack>
                  </Box>
                </Paper>

                {/* GRID */}
                <TableContainer sx={{ 
                  border: '2px solid #e0e0e0', 
                  borderRadius: 1.5,
                  maxHeight: 'calc(100vh - 300px)',
                  minHeight: 400,
                  backgroundColor: '#fafafa'
                }}>
                  <Table size="small" stickyHeader>
                    <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.7rem', 
                          width: 40,
                          backgroundColor: '#e5e7eb',
                          color: '#374151'
                        }}>
                          #
                        </TableCell>
                        {visibleColumns.map((col) => (
                          <TableCell 
                            key={col}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: '0.7rem', 
                              minWidth: columnWidths[col] || 120,
                              backgroundColor: ['wsn', 'picking_remarks'].includes(col) ? '#dbeafe' : '#f3f4f6',
                              color: '#1f2937',
                              whiteSpace: 'nowrap',
                              borderRight: '1px solid #e5e7eb'
                            }}
                          >
                            {col.replace(/_/g, ' ').toUpperCase()}
                          </TableCell>
                        ))}
                        <TableCell sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.7rem', 
                          width: 35,
                          backgroundColor: '#f3f4f6'
                        }}>
                          ✓
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {multiRows.map((row, rowIdx) => {
                        const isDuplicate = multiRows.filter(r => r.wsn?.trim() === row.wsn?.trim() && r.wsn?.trim()).length > 1;
                        return (
                          <TableRow 
                            key={rowIdx}
                            sx={{ 
                              backgroundColor: isDuplicate && row.wsn ? '#fecaca' : rowIdx % 2 === 0 ? '#ffffff' : '#f9fafb',
                              '&:hover': { backgroundColor: isDuplicate && row.wsn ? '#fda3a3' : '#f0f0f0' }
                            }}
                          >
                            <TableCell sx={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 600,
                              color: '#6b7280',
                              p: '6px 4px'
                            }}>
                              {rowIdx + 1}
                            </TableCell>
                            {visibleColumns.map((col, colIdx) => (
                              <TableCell 
                                key={col} 
                                sx={{ 
                                  p: '2px',
                                  borderRight: '1px solid #e5e7eb'
                                }}
                              >
                                {['product_title', 'brand', 'cms_vertical', 'fsp', 'mrp', 'rack_no', 'source'].includes(col) ? (
                                  <Box sx={{ 
                                    p: '6px', 
                                    fontSize: '0.7rem',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: 0.5,
                                    border: '1px solid #d1d5db',
                                    minHeight: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#6b7280'
                                  }}>
                                    {row[col] || '-'}
                                  </Box>
                                ) : (
                                  <TextField 
                                    size="small" 
                                    fullWidth 
                                    value={row[col] || ''} 
                                    onChange={(e) => updateMultiRow(rowIdx, col, e.target.value)}
                                    onKeyDown={(e: any) => handleKeyDown(e, rowIdx, colIdx)}
                                    inputRef={(el: any) => inputRefs.current[`${rowIdx}-${colIdx}`] = el}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#d1d5db' },
                                        '&:hover fieldset': { borderColor: '#9ca3af' }
                                      },
                                      '& .MuiOutlinedInput-input': { 
                                        py: '6px', 
                                        px: '8px', 
                                        fontSize: '0.65rem',
                                        fontWeight: ['wsn', 'picking_remarks'].includes(col) ? 600 : 400
                                      } 
                                    }} 
                                  />
                                )}
                              </TableCell>
                            ))}
                            <TableCell sx={{ p: '2px', textAlign: 'center' }}>
                              {isDuplicate && row.wsn ? (
                                <Chip label="DUP" size="small" color="error" sx={{ height: 16, fontSize: '0.55rem' }} />
                              ) : row.wsn ? (
                                <CheckIcon sx={{ fontSize: '0.9rem', color: '#10b981' }} />
                              ) : null}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* SUBMIT BUTTON */}
                <Button 
                  fullWidth 
                  variant="contained" 
                  onClick={handleMultiSubmit} 
                  disabled={multiLoading || multiRows.filter(r => r.wsn?.trim()).length === 0}
                  sx={{ 
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    py: 1.5,
                    borderRadius: 1,
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {multiLoading ? '⏳ Submitting...' : `✓ SUBMIT MULTI (${multiRows.filter(r => r.wsn?.trim()).length} entries)`}
                </Button>

                {/* Column Settings Dialog */}
                <Dialog open={columnSettingsOpen} onClose={() => setColumnSettingsOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700 }}>⚙️ Column Settings</DialogTitle>
                  <DialogContent>
                    <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                      {allAvailableColumns.map(col => (
                        <FormControlLabel 
                          key={col}
                          control={
                            <Checkbox 
                              checked={visibleColumns.includes(col)}
                              onChange={(e) => {
                                const newCols = e.target.checked 
                                  ? [...visibleColumns, col]
                                  : visibleColumns.filter(c => c !== col);
                                setVisibleColumns(newCols);
                                saveColumnsToStorage('picking_multi_columns', newCols);
                              }}
                            />
                          }
                          label={col.replace(/_/g, ' ').toUpperCase()}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setColumnSettingsOpen(false)} variant="contained" size="small">Done</Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            </Box>
          )}

          {/* TAB 1: PICKING LIST */}
          {tabValue === 1 && (
            <Box sx={{ py: 2 }}>
              <Stack spacing={2}>
                {/* FILTERS */}
                <Paper sx={{ p: 2, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    <TextField 
                      placeholder="Search WSN, Product..." 
                      value={searchFilter} 
                      onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }} 
                      size="small" 
                      fullWidth
                      variant="outlined"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select 
                        label="Category" 
                        value={categoryFilter} 
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={0.5}>
                      <TextField 
                        label="From Date" 
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        fullWidth
                      />
                      <TextField 
                        label="To Date" 
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                        fullWidth
                      />
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <Button 
                        onClick={() => setListColumnSettingsOpen(true)} 
                        variant="outlined" 
                        size="small" 
                        fullWidth
                        startIcon={<SettingsIcon />}
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        Columns
                      </Button>
                      <Button 
                        onClick={exportToExcel} 
                        variant="contained" 
                        size="small" 
                        fullWidth
                        startIcon={<DownloadIcon />}
                        sx={{ background: '#10b981', fontSize: '0.7rem', fontWeight: 600 }}
                      >
                        Export
                      </Button>
                    </Stack>
                  </Box>
                </Paper>

                {/* TABLE */}
                <TableContainer sx={{ 
                  border: '2px solid #e0e0e0', 
                  borderRadius: 1.5,
                  maxHeight: 'calc(100vh - 300px)',
                  minHeight: 400,
                  backgroundColor: '#fafafa'
                }}>
                  <Table size="small" stickyHeader>
                    <TableHead sx={{ backgroundColor: '#f3f4f6' }}>
                      <TableRow>
                        {listColumns.map(col => (
                          <TableCell 
                            key={col}
                            onClick={() => handleSort(col)}
                            sx={{ 
                              fontWeight: 700, 
                              fontSize: '0.7rem',
                              minWidth: 100,
                              backgroundColor: '#e5e7eb',
                              color: '#1f2937',
                              cursor: 'pointer',
                              userSelect: 'none',
                              whiteSpace: 'nowrap',
                              borderRight: '1px solid #d1d5db',
                              '&:hover': { backgroundColor: '#d1d5db' }
                            }}
                          >
                            {col.replace(/_/g, ' ').toUpperCase()}
                            {sortConfig.key === col && (
                              <Box component="span" sx={{ ml: 0.5 }}>{sortConfig.order === 'asc' ? ' ↑' : ' ↓'}</Box>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listLoading ? (
                        <TableRow><TableCell colSpan={listColumns.length} align="center" sx={{ py: 3 }}>Loading...</TableCell></TableRow>
                      ) : listData.length === 0 ? (
                        <TableRow><TableCell colSpan={listColumns.length} align="center" sx={{ py: 3 }}>No records found</TableCell></TableRow>
                      ) : (
                        listData.map((row, idx) => (
                          <TableRow 
                            key={idx}
                            sx={{ 
                              backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                              '&:hover': { backgroundColor: '#f0f0f0' }
                            }}
                          >
                            {listColumns.map(col => (
                              <TableCell 
                                key={col}
                                sx={{ 
                                  fontSize: '0.65rem',
                                  p: '8px',
                                  borderRight: '1px solid #e5e7eb',
                                  color: '#374151'
                                }}
                              >
                                {col === 'source' ? (
                                  <Chip 
                                    label={row[col]} 
                                    size="small" 
                                    color={row[col] === 'QC' ? 'success' : 'info'}
                                    sx={{ height: 20, fontSize: '0.6rem', fontWeight: 600 }}
                                  />
                                ) : col === 'picking_date' ? (
                                  new Date(row[col]).toLocaleDateString()
                                ) : (
                                  row[col] || '-'
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* PAGINATION */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, background: '#f9fafb', borderRadius: 1 }}>
                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280' }}>
                    📊 Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} records
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      disabled={page === 1} 
                      onClick={() => setPage(page - 1)} 
                      variant="outlined" 
                      size="small"
                      sx={{ fontSize: '0.7rem', minWidth: 45, fontWeight: 600 }}
                    >
                      ◀ Prev
                    </Button>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, px: 1, display: 'flex', alignItems: 'center' }}>
                      {page} / {Math.ceil(total / limit) || 1}
                    </Typography>
                    <Button 
                      disabled={page >= Math.ceil(total / limit)} 
                      onClick={() => setPage(page + 1)} 
                      variant="outlined" 
                      size="small"
                      sx={{ fontSize: '0.7rem', minWidth: 45, fontWeight: 600 }}
                    >
                      Next ▶
                    </Button>
                  </Stack>
                </Box>

                {/* Column Settings Dialog */}
                <Dialog open={listColumnSettingsOpen} onClose={() => setListColumnSettingsOpen(false)} maxWidth="sm" fullWidth>
                  <DialogTitle sx={{ fontSize: '0.95rem', fontWeight: 700 }}>⚙️ List Columns</DialogTitle>
                  <DialogContent>
                    <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                      {['wsn', 'product_title', 'brand', 'cms_vertical', 'fsp', 'mrp', 'picking_date', 'picker_name', 'source', 'picking_remarks'].map(col => (
                        <FormControlLabel 
                          key={col}
                          control={
                            <Checkbox 
                              checked={listColumns.includes(col)}
                              onChange={(e) => {
                                const newCols = e.target.checked 
                                  ? [...listColumns, col]
                                  : listColumns.filter(c => c !== col);
                                setListColumns(newCols);
                                saveColumnsToStorage('picking_list_columns', newCols);
                              }}
                            />
                          }
                          label={col.replace(/_/g, ' ').toUpperCase()}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setListColumnSettingsOpen(false)} variant="contained" size="small">Done</Button>
                  </DialogActions>
                </Dialog>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}