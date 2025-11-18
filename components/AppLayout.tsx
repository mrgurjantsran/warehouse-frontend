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
        width: '100%',          // ★ Prevent layout expansion
        maxWidth: '100%',       // ★ Prevent stretching caused by wide tables
        overflowX: 'hidden',    // ★ CRITICAL FIX → stops page from scrolling right
      }}
      suppressHydrationWarning
    >
      <CssBaseline />
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',   // ★ Ensures only table scrolls, not page
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
