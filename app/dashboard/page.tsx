'use client';

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import toast, { Toaster } from 'react-hot-toast';
import { getStoredUser, logout } from '@/lib/auth';
import AppLayout from '@/components/AppLayout';
import { useWarehouse } from '@/app/context/WarehouseContext';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  warehouseId?: number;
}  

export default function DashboardPage() {  
  const router = useRouter();
  useAuthGuard(); // ✔ token check handled here

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { activeWarehouse } = useWarehouse();
  const warehouseId = activeWarehouse?.id;

  // ✔ Load user ONCE
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setTimeout(() => router.push('/login'), 500);
  };

  const kpiCards = [
    { label: 'Inbound', value: 156, color: '#1976d2', icon: InventoryIcon },
    { label: 'QC', value: 89, color: '#2e7d32', icon: CheckIcon },
    { label: 'Picking', value: 45, color: '#ed6c02', icon: AssignmentIcon },
    { label: 'Outbound', value: 23, color: '#9c27b0', icon: ShippingIcon },
    { label: 'Master Data', value: 342, color: '#d32f2f', icon: StorageIcon },
  ];

  return (
    <AppLayout>
      <Box sx={{ height: "100%", overflowY: "auto", pb: 5 }}>
      <Toaster position="top-right" />

      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
            📊 Dashboard
          </Typography>

          {user && (
            <>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.fullName ? user.fullName.charAt(0) : user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {user.fullName || user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role.toUpperCase()}
                  </Typography>
                </Box>
              </Stack>
            </>
          )}

          <Button
            color="error"
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 2 }}>

        {/* Welcome Banner */}        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            mb: 2, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            👋 Welcome back, {user?.fullName || user?.username}!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Here's what's happening in your warehouse today
          </Typography>
          {activeWarehouse ? (
            <Typography variant="h6" sx={{ mt: 2, bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1, display: 'inline-block' }}>
              🏭 Active Warehouse: <strong>{activeWarehouse.name}</strong> ({activeWarehouse.code})
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 2, color: '#ffeb3b' }}>
              ⚠️ Please set an active warehouse from Settings → Warehouses
            </Typography>
          )}
        </Paper>


        {/* KPI Cards */}
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          📊 Key Performance Indicators
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          {kpiCards.map((kpi, idx) => {
            const IconComponent = kpi.icon;
            return (
              <Card
                key={idx}
                elevation={2}
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: kpi.color, width: 56, height: 56 }}>
                      <IconComponent fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {kpi.label}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {kpi.value}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {/* Recent Activity */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📈 Recent Activity
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Last 24 hours summary
          </Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#1976d2', borderRadius: '50%', mr: 2 }} />
              <Typography variant="body2">15 new inbound entries added</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#2e7d32', borderRadius: '50%', mr: 2 }} />
              <Typography variant="body2">8 items moved to QC</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#ed6c02', borderRadius: '50%', mr: 2 }} />
              <Typography variant="body2">5 picking orders completed</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#9c27b0', borderRadius: '50%', mr: 2 }} />
              <Typography variant="body2">3 outbound dispatches processed</Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
      </Box>
    </AppLayout>    
  );
}
