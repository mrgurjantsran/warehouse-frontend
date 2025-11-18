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
        maxWidth: '100%',
        overflowX: 'hidden',        // ★ prevents whole page from shifting right
        position: 'relative',
      }}
      suppressHydrationWarning
    >
      <CssBaseline />

      {/* SIDEBAR */}
      <Box
        sx={{
          width: { xs: 0, sm: 230 },   // ★ Auto-hide sidebar on mobile
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Sidebar />
      </Box>

      {/* MAIN CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f5f5f5',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',       // ★ stops entire screen from scrolling horizontally
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}
