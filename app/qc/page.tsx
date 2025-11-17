'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, MenuItem, Chip, Stack,
  Tab, Tabs, CircularProgress, Alert, TablePagination,
  Select, FormControl, InputLabel, Container, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox, FormControlLabel, Divider
} from '@mui/material';
import {
  Add as AddIcon, Download as DownloadIcon, Upload as UploadIcon,
  Delete as DeleteIcon, Refresh as RefreshIcon, Settings as SettingsIcon,
  OpenInNew as OpenIcon, CheckCircle as CheckIcon
} from '@mui/icons-material';
import { qcAPI, rackAPI } from '@/lib/api';
import { useWarehouse } from '@/app/context/WarehouseContext';
import { getStoredUser } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import NoWarehouseScreen from '@/components/NoWarehouse';

interface QCMultiRow {
  wsn: string;
  qc_date: string;
  qc_by: string;
  product_serial_number: string;
  rack_no: string;
  qc_remarks: string;
  qc_grade: string;
  [key: string]: string;
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function generateEmptyRows(count: number, qcBy: string = ''): QCMultiRow[] {
  return Array.from({ length: count }, () => ({
    wsn: '',
    qc_date: new Date().toISOString().split('T')[0],
    qc_by: qcBy,
    product_serial_number: '',
    rack_no: '',
    qc_remarks: '',
    qc_grade: ''
  }));
}

export default function QCPage() {
  const router = useRouter();
  const context = useWarehouse();
  const activeWarehouse = (context as any)?.activeWarehouse;
  const warehouseId = (context as any)?.warehouseId;

  const [user, setUser] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  // ====== QC GRADE MANAGEMENT ======
  const [qcGradesManagement, setQcGradesManagement] = useState<Array<{ value: string; label: string }>>([
    { value: 'A', label: 'Grade A - Excellent' },
    { value: 'B', label: 'Grade B - Good' },
    { value: 'C', label: 'Grade C - Fair' },
    { value: 'D', label: 'Grade D - Poor' },
    { value: 'REJECT', label: 'Reject' }
  ]);
  const [gradeSettingsOpen, setGradeSettingsOpen] = useState(false);
  const [newGradeValue, setNewGradeValue] = useState('');
  const [newGradeLabel, setNewGradeLabel] = useState('');

  // ====== SINGLE ENTRY STATE ======
  const [singleWSN, setSingleWSN] = useState('');
  const [productData, setProductData] = useState<any>(null);
  const [singleForm, setSingleForm] = useState({
    qc_date: new Date().toISOString().split('T')[0],
    qc_by: '',
    product_serial_number: '',
    rack_no: '',
    qc_remarks: '',
    other_remarks: '',
    qc_grade: ''
  });
  const [singleLoading, setSingleLoading] = useState(false);

  // ====== BULK UPLOAD STATE ======
  const [bulkFile, setBulkFile] = useState<any>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkCurrentBatch, setBulkCurrentBatch] = useState<any>(null);

  // ====== MULTI ENTRY STATE ======
  const [multiRows, setMultiRows] = useState<QCMultiRow[]>([]);
  const [multiLoading, setMultiLoading] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['wsn', 'qc_date', 'qc_by', 'rack_no', 'qc_grade', 'qc_remarks']);
  const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
  const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [commonQCBy, setCommonQCBy] = useState('');

  // ====== QC LIST STATE ======
  const [listData, setListData] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [total, setTotal] = useState(0);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [brands, setBrands] = useState<string[]>([]);
  const [listColumns, setListColumns] = useState<string[]>([
    'wsn', 'product_title', 'brand', 'fsp', 'mrp', 'qc_date', 'qc_by', 'fk_grade', 'status'
  ]);
  const [listColumnSettingsOpen, setListColumnSettingsOpen] = useState(false);


  // ====== BATCH MANAGEMENT STATE ======
  const [batches, setBatches] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // ====== DROPDOWN DATA ======
  const [racks, setRacks] = useState<any[]>([]);

  // ====== ALL useEffect - AFTER ALL STATES ======
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push('/login');
      return;
    }
    setUser(storedUser);
    setSingleForm(prev => ({ ...prev, qc_by: storedUser.fullName || '' }));
    setCommonQCBy(storedUser.fullName || '');
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem('qcGrades');
    if (saved) {
      try {
        setQcGradesManagement(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('qcListColumns');
    if (saved) {
      try {
        setListColumns(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (user && multiRows.length === 0) {
      setMultiRows(generateEmptyRows(5, user?.fullName || commonQCBy));
    }
  }, [user]);

  useEffect(() => {
    if (activeWarehouse && (tabValue === 0 || tabValue === 2)) {
      loadRacks();
    }
  }, [activeWarehouse, tabValue]);

  useEffect(() => {
    if (activeWarehouse && tabValue === 3) {
      loadQCList();
      loadBrands();
      loadBatches();
    }
  }, [activeWarehouse, tabValue, page, limit, searchFilter, statusFilter, brandFilter]);

 

  const addQCGrade = () => {
    if (!newGradeValue.trim() || !newGradeLabel.trim()) {
      toast.error('Enter both value and label');
      return;
    }
    if (qcGradesManagement.some(g => g.value === newGradeValue)) {
      toast.error('Grade already exists');
      return;
    }
    const updated = [...qcGradesManagement, { value: newGradeValue, label: newGradeLabel }];
    setQcGradesManagement(updated);
    localStorage.setItem('qcGrades', JSON.stringify(updated));
    setNewGradeValue('');
    setNewGradeLabel('');
    toast.success('✓ Grade added');
  };

  const deleteQCGrade = (value: string) => {
    const updated = qcGradesManagement.filter(g => g.value !== value);
    setQcGradesManagement(updated);
    localStorage.setItem('qcGrades', JSON.stringify(updated));
    toast.success('✓ Grade deleted');
  };
  

  useEffect(() => {
  if (commonQCBy && multiRows.length === 0) {
    setMultiRows(generateEmptyRows(5));
  }
 }, [commonQCBy]);


  // ====== RACK MANAGEMENT ======
  const loadRacks = async () => {
    try {
      const response = await rackAPI.getByWarehouse(warehouseId);
      setRacks(response.data);
    } catch (error) {
      console.error('Failed to load racks');
    }
  };

  // ====== SINGLE ENTRY FUNCTIONS ======
  const handleWSNBlur = async () => {
    if (!singleWSN.trim()) return;
    try {
      const response = await qcAPI.getInboundByWSN(singleWSN, warehouseId);
      setProductData(response.data);
      toast.success('✓ Product found!');
    } catch (error: any) {
      setProductData(null);
      toast.error('Product not found in inbound');
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!singleWSN.trim()) {
    toast.error('WSN is required');
    return;
  }
  if (!singleForm.qc_grade) {
    toast.error('QC Grade is required');
    return;
  }

  setSingleLoading(true);
  try {
    // Check if WSN already exists in QC
    const existingQC = await qcAPI.checkWSNExists(singleWSN, warehouseId);
    
    if (existingQC?.data?.exists) {
      // Show update dialog
      const confirmed = confirm(`WSN already exists in QC! Do you want to UPDATE the existing record?`);
      
      if (confirmed) {
        // Update existing QC entry
        await qcAPI.updateSingleQC(existingQC.data.id, {
          ...singleForm,
          warehouse_id: warehouseId
        });
        toast.success('✓ QC entry updated successfully!');
      } else {
        setSingleLoading(false);
        return;
      }
    } else {
      // Create new QC entry
      await qcAPI.createSingleQC({
        wsn: singleWSN,
        ...singleForm,
        warehouse_id: warehouseId
      });
      toast.success('✓ QC entry created successfully!');
    }

    // Reset form
    setSingleWSN('');
    setProductData(null);
    setSingleForm({
      qc_date: new Date().toISOString().split('T')[0],
      qc_by: user?.fullName || '',
      product_serial_number: '',
      rack_no: '',
      qc_remarks: '',
      other_remarks: '',
      qc_grade: ''
    });
    loadQCList();
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed to create/update entry');
  } finally {
    setSingleLoading(false);
  }
 };

  // ====== BULK UPLOAD FUNCTIONS ======
  const downloadTemplate = () => {
    const template = [{
      'WSN': 'ABC123',
      'QC_DATE': new Date().toISOString().split('T')[0],
      'QC_BY': 'User Name',
      'QC_GRADE': 'A'
    }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'QC_Template.xlsx');
    toast.success('✓ Template downloaded');
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', bulkFile);
    formData.append('warehouse_id', warehouseId?.toString() || '');

    setBulkLoading(true);
    try {
      const response = await qcAPI.bulkQCUpload(formData);
      setBulkCurrentBatch({
        id: response.data.batchId,
        total: response.data.totalRows,
        timestamp: response.data.timestamp
      });
      toast.success(`✓ Batch started: ${response.data.batchId}`);
      setBulkFile(null);
      setTimeout(() => {
        setBulkCurrentBatch(null);
        loadBatches();
        loadQCList();
      }, 3000);
    } catch (error: any) {
      toast.error('Upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  // ====== MULTI ENTRY FUNCTIONS ======
  const addMultiRow = () => {
    setMultiRows([...multiRows, {
      wsn: '',
      qc_date: commonDate,
      qc_by: commonQCBy,
      product_serial_number: '',
      rack_no: '',
      qc_remarks: '',
      qc_grade: ''
    }]);
  };

  const add10Rows = () => {
    const newRows = generateEmptyRows(10).map(row => ({ ...row, qc_date: commonDate, qc_by: commonQCBy }));
    setMultiRows([...multiRows, ...newRows]);
    toast.success('✓ Added 10 rows');
  };

  const add30Rows = () => {
    const newRows = generateEmptyRows(30).map(row => ({ ...row, qc_date: commonDate, qc_by: commonQCBy }));
    setMultiRows([...multiRows, ...newRows]);
    toast.success('✓ Added 30 rows');
  };

  const updateMultiRow = (index: number, field: string, value: string) => {
    const newRows: QCMultiRow[] = [...multiRows];
    newRows[index][field] = value;
    setMultiRows(newRows);
  };

  const updateCommonDate = (date: string) => {
    setCommonDate(date);
    setMultiRows(multiRows.map(row => ({ ...row, qc_date: date })));
  };

  const updateCommonQCBy = (qcBy: string) => {
    setCommonQCBy(qcBy);
    setMultiRows(multiRows.map(row => ({ ...row, qc_by: qcBy })));
  };

  const handleMultiSubmit = async () => {
  const filtered = multiRows.filter((r) => r.wsn?.trim());
  if (filtered.length === 0) {
    toast.error('No valid WSN rows');
    return;
  }

  // Check for duplicates in current entries
  const wsnCounts: { [key: string]: number } = {};
  for (const row of filtered) {
    wsnCounts[row.wsn?.trim() || ''] = (wsnCounts[row.wsn?.trim() || ''] || 0) + 1;
  }

  const duplicates = Object.entries(wsnCounts)
    .filter(([_, count]) => count > 1)
    .map(([wsn]) => wsn);

  if (duplicates.length > 0) {
    toast.error(`❌ Duplicate WSNs found: ${duplicates.join(', ')}`);
    return;
  }

  // Check if WSNs already exist in QC list
  setMultiLoading(true);
  try {
    const existingWSNs = await qcAPI.getExistingWSNs(warehouseId);
    const existingSet = new Set(existingWSNs.data);

    const alreadyQCed = filtered.filter(r => existingSet.has(r.wsn?.trim()));
    
    if (alreadyQCed.length > 0) {
      toast.error(
        `⚠️ ${alreadyQCed.length} WSN(s) already in QC: ${alreadyQCed.map(r => r.wsn).join(', ')}`
      );
      setMultiLoading(false);
      return;
    }

    // All validations passed - submit
    const res = await qcAPI.multiQCEntry({
      entries: filtered,
      warehouse_id: warehouseId
    });

    toast.success(`✓ Saved ${res.data.successCount} rows`);
    setMultiRows(generateEmptyRows(5));
    loadQCList();
    loadBatches();
  } catch (err: any) {
    toast.error('Multi entry failed');
  } finally {
    setMultiLoading(false);
  }
  };

  // ====== QC LIST FUNCTIONS ======
  const loadQCList = async () => {
    setListLoading(true);
    try {
      const response = await qcAPI.getQCList({
        page,
        limit,
        warehouseId,
        search: searchFilter,
        status: statusFilter,
        brand: brandFilter
      });
      setListData(response.data.data);
      setTotal(response.data.total);
    } catch (error: any) {
      toast.error('Failed to load list');
    } finally {
      setListLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await qcAPI.getBrands(warehouseId);
      setBrands(response.data || []);
    } catch (error) {
      setBrands([]);
    }
  };

  const exportToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(listData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'QC List');
      const filename = `qc_list_${Date.now()}.xlsx`;
      XLSX.writeFile(wb, filename);
      toast.success(`✓ Exported ${listData.length} records`);
    } catch (error) {
      toast.error('Export failed');
    }
  };

  // ====== BATCH MANAGEMENT ======
  const loadBatches = async () => {
    setBatchLoading(true);
    try {
      const response = await qcAPI.getQCBatches(warehouseId);
      setBatches(response.data);
    } catch (error) {
      console.error('Batches error');
    } finally {
      setBatchLoading(false);
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (!confirm('Delete batch?')) return;
    try {
      await qcAPI.deleteQCBatch(batchId);
      toast.success('Batch deleted');
      loadBatches();
      loadQCList();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // No Warehouse Selected screen
  if (!activeWarehouse) {
  return (
    <AppLayout>
      <NoWarehouseScreen />
    </AppLayout>
  );
  }

  if (!user) {
  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>Loading...</Box>
    </AppLayout>
  );
  }

 

  //--UI--////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1.2rem' }}>
            📦 QC Management
          </Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadQCList();
              loadBatches();
              loadRacks();
              loadBrands();
            }}
            sx={{ borderRadius: 1, fontWeight: 600, fontSize: '0.75rem', py: 0.5, px: 1.5, borderWidth: 1.5 }}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>

        {/* TABS */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: 3,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '2px 2px 0 0'
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'none',
                minHeight: 32,
                py: 0.5,
                transition: 'background 0.2s ease',
                '&:hover': { background: 'rgba(102, 126, 234, 0.08)' },
                '&.Mui-selected': { color: '#667eea' }
              }
            }}
          >
            <Tab label="📝 Single Entry" />
            <Tab label="📂 Bulk Upload" />
            <Tab label="🔢 Multi Entry" />
            <Tab label="📋 QC List" />
            <Tab label="📦 Batch Manager" />
          </Tabs>

          {/* TAB 0: SINGLE ENTRY */}
          <TabPanel value={tabValue} index={0}>
            <Stack spacing={3}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <Paper sx={{ p: 2, backgroundColor: '#f9fafb' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>
                    Product Entry
                  </Typography>
                  <TextField
                    fullWidth
                    label="WSN"
                    value={singleWSN}
                    onChange={(e) => setSingleWSN(e.target.value)}
                    onBlur={handleWSNBlur}
                    variant="outlined"
                    placeholder="Scan or enter WSN"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontSize: '0.85rem',
                        '& input': { py: 0.8 }
                      }
                    }}
                  />
                </Paper>

                {productData && (
                  <Paper sx={{ p: 2, backgroundColor: '#f0f9ff', border: '2px solid #0284c7' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.8rem', textTransform: 'uppercase', color: '#0c63e4' }}>
                      ✓ Product Details
                    </Typography>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Title</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{productData.product_title}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>Brand</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{productData.brand}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>FSP</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#059669' }}>₹{productData.fsp}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#666', fontWeight: 500 }}>MRP</Typography>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>₹{productData.mrp}</Typography>
                        </Box>
                      </Box>
                      {productData.fkt_link && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => window.open(productData.fkt_link, '_blank')}
                          endIcon={<OpenIcon />}
                          sx={{ mt: 1, background: '#10b981', '&:hover': { background: '#059669' }, textTransform: 'none', fontWeight: 600, fontSize: '0.7rem' }}
                        >
                          Open FKT Link
                        </Button>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Box>

              {productData && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, fontSize: '0.8rem', textTransform: 'uppercase', color: '#666' }}>
                    QC Details
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    <TextField
                      fullWidth
                      type="date"
                      label="QC Date"
                      value={singleForm.qc_date}
                      onChange={(e) => setSingleForm({ ...singleForm, qc_date: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.85rem', '& input': { py: 0.8 } } }}
                    />
                    <TextField
                      fullWidth
                      label="QC By"
                      value={singleForm.qc_by}
                      onChange={(e) => setSingleForm({ ...singleForm, qc_by: e.target.value })}
                      size="small"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.85rem', '& input': { py: 0.8 } } }}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>QC Grade</InputLabel>
                      <Select
                        label="QC Grade"
                        value={singleForm.qc_grade}
                        onChange={(e) => setSingleForm({ ...singleForm, qc_grade: e.target.value })}
                        sx={{ borderRadius: 1 }}
                      >
                        {qcGradesManagement.map(g => (
                          <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Rack Number</InputLabel>
                      <Select
                        label="Rack Number"
                        value={singleForm.rack_no}
                        onChange={(e) => setSingleForm({ ...singleForm, rack_no: e.target.value })}
                        sx={{ borderRadius: 1 }}
                      >
                        {racks.map(r => (
                          <MenuItem key={r.id} value={r.rack_name}>{r.rack_name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mt: 1.5 }}>
                    <TextField
                      fullWidth
                      label="Product Serial No"
                      value={singleForm.product_serial_number}
                      onChange={(e) => setSingleForm({ ...singleForm, product_serial_number: e.target.value })}
                      size="small"
                      multiline
                      rows={2}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.85rem' } }}
                    />
                    <TextField
                      fullWidth
                      label="QC Remarks"
                      value={singleForm.qc_remarks}
                      onChange={(e) => setSingleForm({ ...singleForm, qc_remarks: e.target.value })}
                      size="small"
                      multiline
                      rows={2}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.85rem' } }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Other Remarks"
                    value={singleForm.other_remarks}
                    onChange={(e) => setSingleForm({ ...singleForm, other_remarks: e.target.value })}
                    size="small"
                    multiline
                    rows={2}
                    sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.85rem' } }}
                  />
                </Paper>
              )}

              {productData && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSingleSubmit}
                  disabled={singleLoading || !productData}
                  sx={{
                    py: 0.9,
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 15px 40px rgba(102, 126, 234, 0.5)',
                      transform: 'translateY(-3px)'
                    },
                    '&:disabled': { background: 'rgba(0,0,0,0.12)', boxShadow: 'none' }
                  }}
                >
                  {singleLoading ? '⏳ Creating...' : '✓ Create QC Entry'}
                </Button>
              )}
            </Stack>
          </TabPanel>

          {/* TAB 1: BULK UPLOAD */}
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f9fafb' }}>
              <UploadIcon sx={{ fontSize: 48, color: '#999', mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 700, mb: 2 }}>Upload Excel File</Typography>
              <Button
                variant="outlined"
                onClick={downloadTemplate}
                sx={{ mb: 2, borderRadius: 1, fontWeight: 600 }}
              >
                📥 Download Template
              </Button>
              <Box sx={{ mb: 2 }}>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  style={{ marginBottom: 8 }}
                />
                {bulkFile && (
                  <Typography sx={{ color: 'green', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✓ {bulkFile.name}
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkLoading}
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)',
                  '&:hover': { boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)', transform: 'translateY(-2px)' },
                  '&:disabled': { background: 'rgba(0,0,0,0.12)', boxShadow: 'none' }
                }}
              >
                {bulkLoading ? '⏳ Uploading...' : '🚀 Upload & Process'}
              </Button>
              {bulkCurrentBatch && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  ✓ Batch started: {bulkCurrentBatch.id} ({bulkCurrentBatch.total} rows)
                </Alert>
              )}
            </Paper>
          </TabPanel>

          {/* TAB 2: MULTI ENTRY */}
          <TabPanel value={tabValue} index={2}>
            <Stack spacing={2}>
              <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f9fafb', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                <TextField
                  type="date"
                  label="QC Date"
                  value={commonDate}
                  onChange={(e) => updateCommonDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.75rem', '& input': { py: 0.5 } } }}
                />
                <TextField
                  label="QC By"
                  value={commonQCBy}
                  onChange={(e) => updateCommonQCBy(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.75rem', '& input': { py: 0.5 } } }}
                />
                <Stack direction="row" spacing={0.5}>
                  <Button onClick={add10Rows} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600, fontSize: '0.65rem', flex: 1 }}>+10</Button>
                  <Button onClick={add30Rows} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 600, fontSize: '0.65rem', flex: 1 }}>+30</Button>
                </Stack>

<Button
  onClick={() => setGradeSettingsOpen(true)}
  variant="outlined"
  size="small"
  sx={{ borderRadius: 1, fontWeight: 700, fontSize: '0.65rem' }}
  startIcon={<SettingsIcon />}
>
  Grade Settings
</Button>
                <Button
                  onClick={() => setColumnSettingsOpen(true)}
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1, fontWeight: 700, fontSize: '0.65rem' }}
                  startIcon={<SettingsIcon />}
                >
                  Columns
                </Button>
              </Paper>

              <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1, mb: 2, maxHeight: 500, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', width: 40 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 120 }}>WSN</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 100 }}>QC GRADE</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 100 }}>RACK NO</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 100 }}>PRODUCT SN</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 150 }}>QC REMARKS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.7rem', width: 50 }}>✓</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {multiRows.map((row, idx) => {
                      const isDuplicate = multiRows.filter((r) => r.wsn?.trim() === row.wsn?.trim() && r.wsn?.trim()).length > 1;
                      const firstDuplicate = multiRows.find((r) => r.wsn?.trim() === row.wsn?.trim() && r.wsn?.trim());
                      const isFirstOfDuplicate = isDuplicate && firstDuplicate && multiRows.indexOf(firstDuplicate) === idx;
                      
                      return (
                        <TableRow 
                          key={idx}
                          sx={{ 
                            backgroundColor: isDuplicate && !isFirstOfDuplicate ? '#fee2e2' : 'inherit',
                            '&:hover': { backgroundColor: isDuplicate && !isFirstOfDuplicate ? '#fecaca' : '#f9fafb' }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem' }}>{idx + 1}</TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.wsn || ''}
                              onChange={(e) => updateMultiRow(idx, 'wsn', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { py: 0.4, fontSize: '0.75rem' }, ...(isDuplicate && !isFirstOfDuplicate && { backgroundColor: '#fee2e2' }) }}
                              error={isDuplicate && !isFirstOfDuplicate}
                            />
                          </TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            <Select
                              size="small"
                              fullWidth
                              value={row.qc_grade || ''}
                              onChange={(e) => updateMultiRow(idx, 'qc_grade', e.target.value)}
                              sx={{ fontSize: '0.75rem', '& .MuiOutlinedInput-input': { py: 0.4 } }}
                            >
                              {qcGradesManagement.map(g => (
                                <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            <Select
                              size="small"
                              fullWidth
                              value={row.rack_no || ''}
                              onChange={(e) => updateMultiRow(idx, 'rack_no', e.target.value)}
                              sx={{ fontSize: '0.75rem', '& .MuiOutlinedInput-input': { py: 0.4 } }}
                            >
                              {racks.map(r => (
                                <MenuItem key={r.id} value={r.rack_name}>{r.rack_name}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.product_serial_number || ''}
                              onChange={(e) => updateMultiRow(idx, 'product_serial_number', e.target.value)}
                              sx={{ '& .MuiOutlinedInput-input': { py: 0.4, fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            <TextField
                              size="small"
                              fullWidth
                              value={row.qc_remarks || ''}
                              onChange={(e) => updateMultiRow(idx, 'qc_remarks', e.target.value)}
                              multiline
                              rows={1}
                              sx={{ '& .MuiOutlinedInput-input': { py: 0.4, fontSize: '0.75rem' } }}
                            />
                          </TableCell>
                          
                          <TableCell sx={{ p: 0.5 }}>
                            {isDuplicate && !isFirstOfDuplicate ? (
                              <Chip label="DUP" size="small" color="error" />
                            ) : row.wsn ? (
                              <CheckIcon sx={{ fontSize: '1rem', color: '#10b981' }} />
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                fullWidth
                variant="contained"
                onClick={handleMultiSubmit}
                disabled={multiLoading || multiRows.some(r => r.wsn?.trim() && multiRows.filter(x => x.wsn?.trim() === r.wsn?.trim()).length > 1)}
                sx={{
                  py: 0.9,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                  '&:hover': { boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5)', transform: 'translateY(-3px)' },
                  '&:disabled': { background: 'rgba(0,0,0,0.12)', boxShadow: 'none' }
                }}
              >
                {multiLoading ? '⏳ Submitting...' : `✓ Submit All (${multiRows.filter(r => r.wsn?.trim()).length} rows)`}
              </Button>



              <Dialog open={gradeSettingsOpen} onClose={() => setGradeSettingsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>⚙️ QC Grade Management</DialogTitle>
                <DialogContent>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Add New Grade</Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <TextField
                        label="Value (e.g., E)"
                        value={newGradeValue}
                        onChange={(e) => setNewGradeValue(e.target.value.toUpperCase())}
                        size="small"
                        sx={{ flex: 0.3 }}
                      />
                      <TextField
                        label="Label (e.g., Grade E - Excellent)"
                        value={newGradeLabel}
                        onChange={(e) => setNewGradeLabel(e.target.value)}
                        size="small"
                        sx={{ flex: 0.7 }}
                      />
                      <Button onClick={addQCGrade} variant="contained" size="small">Add</Button>
                    </Stack>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Existing Grades</Typography>
                    <Stack spacing={1}>
                      {qcGradesManagement.map(grade => (
                        <Box key={grade.value} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
                          <Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>{grade.value}</Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>{grade.label}</Typography>
                          </Box>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => deleteQCGrade(grade.value)}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setGradeSettingsOpen(false)} variant="contained">Done</Button>
                </DialogActions>
              </Dialog>
            </Stack>
          </TabPanel>

          {/* TAB 3: QC LIST */}
<TabPanel value={tabValue} index={3}>
  <Stack spacing={2}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' }, gap: 1.5, mb: 2 }}>
      <TextField
        placeholder="Search WSN/Product..."
        value={searchFilter}
        onChange={(e) => { setSearchFilter(e.target.value); setPage(1); }}
        size="small"
        fullWidth
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1, fontSize: '0.75rem' } }}
      />
      <FormControl fullWidth size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          sx={{ borderRadius: 1 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Brand</InputLabel>
        <Select
          label="Brand"
          value={brandFilter}
          onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
          sx={{ borderRadius: 1 }}
        >
          <MenuItem value="">All</MenuItem>
          {brands.map(b => (
            <MenuItem key={b} value={b}>{b}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Per Page</InputLabel>
        <Select
          label="Per Page"
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          sx={{ borderRadius: 1 }}
        >
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
          <MenuItem value={250}>250</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" spacing={0.5}>
        <Button 
          onClick={() => setListColumnSettingsOpen(true)} 
          variant="outlined" 
          size="small" 
          fullWidth 
          sx={{ borderRadius: 1, fontWeight: 600, fontSize: '0.65rem' }} 
          startIcon={<SettingsIcon />}
        >
          Columns
        </Button>
        <Button onClick={exportToExcel} variant="contained" size="small" fullWidth sx={{ borderRadius: 1, fontWeight: 600, fontSize: '0.65rem', background: '#10b981' }} startIcon={<DownloadIcon />}>Export</Button>
      </Stack>
    </Box>

    <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1, mb: 2, maxHeight: 500, overflowY: 'auto' }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
          <TableRow>
            {listColumns.map(col => (
              <TableCell key={col} sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                {col.replace(/_/g, ' ').toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {listLoading ? (
            <TableRow>
              <TableCell colSpan={listColumns.length} align="center">Loading...</TableCell>
            </TableRow>
          ) : listData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={listColumns.length} align="center">📭 No data found</TableCell>
            </TableRow>
          ) : (
            listData.map(item => (
              <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                {listColumns.map(col => (
                  <TableCell key={col} sx={{ fontSize: '0.75rem' }}>
                    {col === 'qc_date' ? new Date(item[col]).toLocaleDateString() : 
                     col === 'status' ? (
                       <Chip label={item[col]} size="small" color={item[col] === 'APPROVED' ? 'success' : item[col] === 'REJECTED' ? 'error' : 'warning'} />
                     ) : (
                       item[col] || '-'
                     )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
        📊 {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
      </Typography>
      <Stack direction="row" spacing={0.5}>
        <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.65rem', minWidth: 70 }}>◀ Prev</Button>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, px: 1, py: 0.5 }}>{page} / {Math.ceil(total / limit) || 1}</Typography>
        <Button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(page + 1)} variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: '0.65rem', minWidth: 70 }}>Next ▶</Button>
      </Stack>
    </Box>

    {/* LIST COLUMN SETTINGS DIALOG */}
    <Dialog
      open={listColumnSettingsOpen}
      onClose={() => setListColumnSettingsOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' } }}
    >
      <DialogTitle>⚙️ Column Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {['wsn', 'product_title', 'brand', 'cms_vertical', 'fsp', 'mrp', 'qc_date', 'qc_by', 'fk_grade', 'status', 'qc_remarks'].map(col => (
            <FormControlLabel
              key={col}
              control={
                <Checkbox
                  checked={listColumns.includes(col)}
                  onChange={(e) => {
                    let newCols;
                    if (e.target.checked) {
                      newCols = [...listColumns, col];
                    } else {
                      newCols = listColumns.filter(c => c !== col);
                    }
                    setListColumns(newCols);
                    localStorage.setItem('qcListColumns', JSON.stringify(newCols));
                  }}
                  sx={{ '&.Mui-checked': { color: '#667eea' } }}
                />
              }
              label={col.replace(/_/g, ' ').toUpperCase()}
              sx={{ fontSize: '0.75rem' }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setListColumnSettingsOpen(false)} variant="contained">Done</Button>
      </DialogActions>
    </Dialog>
  </Stack>
</TabPanel>

          {/* TAB 4: BATCH MANAGER */}
          <TabPanel value={tabValue} index={4}>
            <TableContainer sx={{ border: '1px solid #e5e7eb', borderRadius: 1, maxHeight: 500, overflowY: 'auto' }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f3f4f6', position: 'sticky', top: 0 }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>🗂️ Batch ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>📊 Count</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>🕒 Last Updated</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', width: 80 }}>⚡ Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 2 }}>📭 No batches found</TableCell>
                    </TableRow>
                  ) : (
                    batches.map(batch => (
                      <TableRow key={batch.batch_id}>
                        <TableCell sx={{ fontSize: '0.75rem' }}><Chip label={batch.batch_id} size="small" variant="outlined" /></TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{batch.count}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>{new Date(batch.last_updated).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => deleteBatch(batch.batch_id)}
                            startIcon={<DeleteIcon />}
                            sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Paper>
      </Container>
    </AppLayout>
  );
}
