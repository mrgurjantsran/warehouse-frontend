'use client';

import { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }} suppressHydrationWarning>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
