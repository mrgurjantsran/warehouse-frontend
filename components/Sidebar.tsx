'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
  Collapse,
} from '@mui/material';

import {
  LocalPrintshop as PrinterIcon,  
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Warehouse as WarehouseIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

const drawerWidth = 230;

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { label: 'Inbound', icon: InventoryIcon, path: '/inbound' },
    { label: 'QC', icon: CheckIcon, path: '/qc' },
    { label: 'Picking', icon: AssignmentIcon, path: '/picking' },
    { label: 'Outbound', icon: ShippingIcon, path: '/outbound' },
  ];

    const settingsItems = [
    { label: 'Master Data', icon: StorageIcon, path: '/settings/master-data' },
    { label: 'Warehouses', icon: WarehouseIcon, path: '/settings/warehouses' },
    { label: 'Racks', icon: CategoryIcon, path: '/settings/racks' },
    { label: 'Users', icon: PersonIcon, path: '/settings/users' },
    { label: 'Permissions', icon: SettingsIcon, path: '/settings/permissions' },
    { label: 'Printers', icon: PrinterIcon, path: '/settings/printers' },
    { label: 'Reports', icon: AssignmentIcon, path: '/settings/reports' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#052457ff',
          color: 'white',
        },
      }}
    >
      <Toolbar sx={{ bgcolor: '#052457ff' }}>
        <WarehouseIcon sx={{ mr: 1, color: '#3b82f6' }} />
        <Typography variant="h6" fontSize={24} fontWeight="bold">
          Divine WMS
        </Typography>
      </Toolbar>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      
      {/* Sidebar content */}
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}

        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

        {/* Settings Section */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            onClick={() => setSettingsOpen(!settingsOpen)}
            sx={{
              mx: 1,
              borderRadius: 1,
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                color: '#60a5fa',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
            {settingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      pl: 4,
                      mx: 1,
                      borderRadius: 1,
                      bgcolor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                      color: isActive ? '#60a5fa' : 'rgba(255,255,255,0.6)',
                      '&:hover': {
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#60a5fa',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2, bgcolor: '#0f172a' }}>
        <Typography variant="caption" color="rgba(255,255,255,0.5)">
          WMS v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
}
