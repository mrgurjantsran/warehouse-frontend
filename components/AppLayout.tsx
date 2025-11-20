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
          flexShrink: 0,          
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
          minHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
          height: 'auto',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',       // ★ stops entire screen from scrolling horizontally
          overflowY: 'visible',
          pb: 4, // bottom spacing for safety
          WebkitOverflowScrolling: 'touch',
        }}
        suppressHydrationWarning
        >
        {children}
      </Box>
    </Box>
  );
}



