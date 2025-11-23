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
      id="app-root"
      sx={{
        minHeight: '100dvh',
        height: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        background: 'purple', // debug color
      }}
    >
      <Sidebar sx={{ height: '100dvh' }} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100dvh',
          height: '100dvh',
          width: '100%',
          bgcolor: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}


