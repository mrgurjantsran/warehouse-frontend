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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      <CssBaseline />
      
      {/* Sidebar container */}
      <Box 
        sx={{ 
          height: '100%',
          flexShrink: 0,
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          width: '100%',
          bgcolor: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
