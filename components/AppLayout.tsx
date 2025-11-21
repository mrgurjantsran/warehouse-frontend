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
        minHeight: '100vh',
        maxWidth: '100vw',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <CssBaseline />
      {/* Side bar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
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
