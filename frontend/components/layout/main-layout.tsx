'use client';

import { Box, Container } from '@mui/material';
import { Header, HeaderProps } from './header';
import { Footer } from './footer';

interface MainLayoutProps extends Omit<HeaderProps, 'children'> {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showFooter?: boolean;
}

export function MainLayout({
  children,
  maxWidth = 'lg',
  showFooter = true,
  ...headerProps
}: MainLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Header {...headerProps} />
      <Container
        maxWidth={maxWidth}
        component="main"
        sx={{
          flex: 1,
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </Container>
      {showFooter && <Footer />}
    </Box>
  );
}
