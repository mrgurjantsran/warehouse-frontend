'use client';

import { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
      suppressHydrationWarning
    >
      <CssBaseline />

      {/* SIDEBAR (NO WRAPPER BOX) */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
          height: '100%',
          WebkitOverflowScrolling: 'touch',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
