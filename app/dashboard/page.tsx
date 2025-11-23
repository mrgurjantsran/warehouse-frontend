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
  useAuthGuard();
  const [user, setUser] = useState<User | null>(null);
  const { activeWarehouse } = useWarehouse();

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />

      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #e0e0e0' }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              📊 Dashboard
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.fullName || 'Loading...'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role.toUpperCase() || ''}
              </Typography>
            </Box>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                fontWeight: 'bold',
              }}
            >
              {user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              LOGOUT
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

     <Container 
  maxWidth="xl" 
  sx={{ 
    py: 3,
    // Remove minHeight completely
    height: 'auto'  // Content-based height
  }}
>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            👋 Welcome back, {user?.fullName?.split(' ')[0] || 'User'} ({user?.role || 'N/A'})!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Here's what's happening in your warehouse today
          </Typography>

          {!activeWarehouse && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'rgba(255, 193, 7, 0.2)',
                borderRadius: 1,
                border: '1px solid rgba(255, 193, 7, 0.5)',
              }}
            >
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚠️ Please set an active warehouse from Settings → Warehouses
              </Typography>
            </Box>
          )}
        </Paper>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          📊 Key Performance Indicators
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          {[
            { label: 'Inbound', value: 156, icon: <InventoryIcon fontSize="large" />, color: '#2196f3' },
            { label: 'QC', value: 89, icon: <CheckIcon fontSize="large" />, color: '#4caf50' },
            { label: 'Picking', value: 45, icon: <AssignmentIcon fontSize="large" />, color: '#ff9800' },
            { label: 'Outbound', value: 23, icon: <ShippingIcon fontSize="large" />, color: '#9c27b0' },
            { label: 'Master Data', value: 342, icon: <StorageIcon fontSize="large" />, color: '#f44336' },
          ].map((item) => (
            <Card
              key={item.label}
              elevation={2}
              sx={{
                borderRadius: 2,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: item.color,
                    width: 56,
                    height: 56,
                    margin: '0 auto 12px',
                  }}
                >
                  {item.icon}
                </Avatar>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          📈 Recent Activity
        </Typography>

        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Last 24 hours summary
          </Typography>

          <Stack spacing={1.5}>
            {[
              { text: '15 new inbound entries added', color: '#2196f3' },
              { text: '8 items moved to QC', color: '#4caf50' },
              { text: '5 picking orders completed', color: '#ff9800' },
              { text: '3 outbound dispatches processed', color: '#9c27b0' },
            ].map((activity, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: '#f5f5f5',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: activity.color,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2">{activity.text}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Container>
    </AppLayout>
  );
}

