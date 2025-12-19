'use client';

import { Box, Typography, Container } from '@mui/material';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          © {currentYear} Play, Learn & Protect. All rights reserved.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ mt: 1, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
        >
          Educational platform with digital safety for children in Egypt 🇪🇬
        </Typography>
      </Container>
    </Box>
  );
}
