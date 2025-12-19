'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BrushIcon from '@mui/icons-material/Brush';

interface NavigationProps {
  childId?: string;
  role?: 'child' | 'parent' | 'teacher' | 'admin';
}

export function Navigation({ childId, role = 'child' }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (role === 'child' && childId) {
    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
      if (newValue === 'home') {
        router.push(`/child-launcher/${childId}`);
      } else if (newValue === 'games') {
        router.push(`/child-launcher/${childId}?tab=games`);
      } else if (newValue === 'learn') {
        router.push(`/child-launcher/${childId}?tab=learn`);
      } else if (newValue === 'create') {
        router.push(`/child-launcher/${childId}?tab=create`);
      } else if (newValue === 'achievements') {
        router.push(`/child-launcher/${childId}?tab=achievements`);
      }
    };

    // Determine current value based on pathname
    let currentValue = 'home';
    if (pathname?.includes('/games')) {
      currentValue = 'games';
    } else if (pathname?.includes('/sandbox') || pathname?.includes('create')) {
      currentValue = 'create';
    }

    return (
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        elevation={3}
      >
        <BottomNavigation
          value={currentValue}
          onChange={handleChange}
          showLabels
          sx={{
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              px: 1,
            },
          }}
        >
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
            aria-label="Go to home"
          />
          <BottomNavigationAction
            label="Play"
            value="games"
            icon={<GamesIcon />}
            aria-label="Play games"
          />
          <BottomNavigationAction
            label="Learn"
            value="learn"
            icon={<SchoolIcon />}
            aria-label="Learn"
          />
          <BottomNavigationAction
            label="Create"
            value="create"
            icon={<BrushIcon />}
            aria-label="Creative sandbox"
          />
          <BottomNavigationAction
            label="Badges"
            value="achievements"
            icon={<EmojiEventsIcon />}
            aria-label="View achievements"
          />
        </BottomNavigation>
      </Paper>
    );
  }

  return null;
}
