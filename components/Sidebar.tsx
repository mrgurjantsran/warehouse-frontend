'use client';

import { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { motion, AnimatePresence, color } from 'framer-motion';
import { ExpandLess, ExpandMore, Close as CloseIcon } from '@mui/icons-material';

import {
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
  LocalPrintshop as PrinterIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // Load collapsed state from localStorage
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Settings dropdown
  const [settingsOpen, setSettingsOpen] = useState(() =>
    pathname.startsWith('/settings'),
  );

  // Flyout for collapsed mode
  const [flyoutVisible, setFlyoutVisible] = useState(false);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [flyoutHovered, setFlyoutHovered] = useState(false);

  // Detect mobile reliably and update on resize
  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Hide flyout if sidebar is not collapsed
  useEffect(() => {
    if (collapsed) {
      setFlyoutVisible(settingsHovered || flyoutHovered);
    } else {
      setFlyoutVisible(false);
    }
  }, [collapsed, settingsHovered, flyoutHovered]);

  // Save collapsed state to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', collapsed.toString());
    }
  }, [collapsed]);

  // Close mobile drawer on route change to keep UI consistent
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const drawerWidth = collapsed ? 70 : 230;

  const mainMenu = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
    { label: 'Inbound', icon: InventoryIcon, path: '/inbound' },
    { label: 'QC', icon: CheckIcon, path: '/qc' },
    { label: 'Picking', icon: AssignmentIcon, path: '/picking' },
    { label: 'Outbound', icon: ShippingIcon, path: '/outbound' },
  ];

  const settingsMenu = [
    { label: 'Master Data', icon: StorageIcon, path: '/settings/master-data' },
    { label: 'Warehouses', icon: WarehouseIcon, path: '/settings/warehouses' },
    { label: 'Racks', icon: CategoryIcon, path: '/settings/racks' },
    { label: 'Users', icon: PersonIcon, path: '/settings/users' },
    { label: 'Permissions', icon: SettingsIcon, path: '/settings/permissions' },
    { label: 'Printers', icon: PrinterIcon, path: '/settings/printers' },
    { label: 'Reports', icon: AssignmentIcon, path: '/settings/reports' },
  ];

  const navigate = (path: string) => {
    router.push(path);
    if (isMobile) setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={() => (isMobile ? setMobileOpen(false) : setCollapsed(!collapsed))}
          sx={{ color: 'white', margin:-1 }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon />
        </IconButton>

        {!collapsed && (
          <>
            {/* <WarehouseIcon sx={{ color: '#3b82f6' }} /> */}
            <Typography fontWeight="bold">Divine WMS</Typography>
            
          </>
        )}

        {isMobile && (
          <IconButton
            sx={{ marginLeft: 'auto', color: 'white' }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close drawer"
          >
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />

      <List>
        {mainMenu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding>
              <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    bgcolor: active ? 'rgba(59,130,246,0.2)' : 'transparent',
                    color: active ? '#60a5fa' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'inherit',
                      minWidth: collapsed ? 'auto' : 40,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}

        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />

        <ListItem
          disablePadding
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
        >
          <ListItemButton
            onClick={() => setSettingsOpen(!settingsOpen)}
            sx={{ mx: 1, borderRadius: 1, color: 'rgba(255,255,255,0.7)' }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: collapsed ? 'auto' : 40,
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText primary="Settings" />
                {settingsOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>

        <AnimatePresence>
          {settingsOpen && (!collapsed || isMobile) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <List sx={{ pl: 4 }}>
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.path;

                  return (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: 1,
                          color: active ? '#60a5fa' : 'rgba(255,255,255,0.8)',
                          bgcolor: active ? 'rgba(59,130,246,0.2)' : 'transparent',
                          my: 0.5,
                        }}
                      >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 30 }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </motion.div>
          )}
        </AnimatePresence>
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {!collapsed && (
        <Box sx={{ p: 2 }}>
          <Typography variant="caption" color="rgba(255,255,255,0.6)">
            WMS v1.0.0
          </Typography>
        </Box>
      )}
    </>
  );

  return (
    <div>
      {isMobile ? (
     <>
     <Drawer
     variant="temporary"
     open={mobileOpen}
     onClose={() => setMobileOpen(false)}
     ModalProps={{ keepMounted: true }}
     sx={{
     '& .MuiDrawer-paper': {
      width: 230,
      bgcolor: '#052457ff',
      color: 'white',
      // zIndex can be customized if needed, but usually not required.
     },
     }}
     >
     {drawerContent}
    </Drawer>


    {/* Floating menu icon: Only show when drawer is closed */}
    {!mobileOpen && (
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 3000,
          bgcolor: '#052457',
          color: 'white',
        }}
        aria-label="Open menu"
      >
        <MenuIcon />
      </IconButton>
    )}
   </>
   ) : (
        <Drawer
  variant="permanent"
  sx={{
    width: drawerWidth,
    flexShrink: 0,           // ★ stop layout from widening
    overflow: 'hidden',      // ★ prevent 1–2px horizontal bleed
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      bgcolor: '#052457ff',
      color: 'white',
      transition: 'width 0.3s',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },
  }}
>

          {drawerContent}
        </Drawer>
      )}

      {flyoutVisible && collapsed && (
        <Paper
          onMouseEnter={() => setFlyoutHovered(true)}
          onMouseLeave={() => setFlyoutHovered(false)}
          elevation={6}
          sx={{
            position: 'fixed',
            top: 70,
            left: drawerWidth,
            width: 220,
            bgcolor: '#052457',
            color: 'white',
            p: 1,
            borderRadius: 1,
            zIndex: 2000,
          }}
        >
          <Typography sx={{ px: 1, pb: 1, fontSize: 13, opacity: 0.7 }}>Settings</Typography>

          <List>
            {settingsMenu.map((item) => {
              const Icon = item.icon;
              return (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{ borderRadius: 1, color: 'rgba(255,255,255,0.8)' }}
                  >
                    <ListItemIcon sx={{ color: 'inherit' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </div>
  );
}
