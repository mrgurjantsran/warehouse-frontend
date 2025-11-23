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
        height: '100dvh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        position: 'relative',
        '@supports (-webkit-touch-callout: none)': {
          height: '-webkit-fill-available',
        },
      }}
    >
      <CssBaseline />
      
      {/* Sidebar container */}
      <Box 
        sx={{ 
          height: '100dvh',
          '@supports (-webkit-touch-callout: none)': {
            height: '-webkit-fill-available',
          },
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100dvh',
          width: '100%',
          bgcolor: '#f5f5f5',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          '@supports (-webkit-touch-callout: none)': {
            height: '-webkit-fill-available',
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
