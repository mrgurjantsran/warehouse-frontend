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
        minHeight: '100dvh',
        height: '100dvh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
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
          '@supports (-webkit-touch-callout: none)': {
            minHeight: '-webkit-fill-available',
            height: '-webkit-fill-available',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
