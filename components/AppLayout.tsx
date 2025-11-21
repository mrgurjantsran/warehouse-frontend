'use client';

import { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      height: '100%',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      
      {/* SIDEBAR */}
      <Sidebar />
      
      {/* MAIN CONTENT AREA */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          height: '100%',
          overflow: 'auto',
          bgcolor: '#f5f5f5',
          '@media (max-width: 768px)': {
            minHeight: '-webkit-fill-available',
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
