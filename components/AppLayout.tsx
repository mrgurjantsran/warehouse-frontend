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
        minHeight: '100%',   // ✅ FIXED
        height: 'auto',      // ✅ FIXED
        overflow: 'hidden',
        position: 'relative',
      }}
      suppressHydrationWarning
    >
      <CssBaseline />

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          width: '100%',
          maxWidth: '100%',

          /* MOST IMPORTANT FIX */
          minHeight: '100%',   // ✅ FIXED
          height: 'auto',      // ✅ FIXED

          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
