'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { Button, AppBar, Toolbar, Typography, IconButton, Badge } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
  showLeaderboard?: boolean;
  onLeaderboardClick?: () => void;
  children?: React.ReactNode;
}

export function Header({
  title = 'Play, Learn & Protect',
  subtitle,
  showNotifications = false,
  notificationCount = 0,
  onNotificationClick,
  showLeaderboard = false,
  onLeaderboardClick,
  children,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        background: 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)',
        boxShadow: 3,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="Egyptian vase">🏺</span>
          <div>
            <Typography
              variant="h6"
              component="h1"
              sx={{ color: 'white', fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {subtitle}
              </Typography>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {children}
          
          {showLeaderboard && (
            <IconButton
              onClick={onLeaderboardClick}
              sx={{ color: 'white' }}
              aria-label="View leaderboard"
              title="View Leaderboard"
            >
              <LeaderboardIcon />
            </IconButton>
          )}

          {showNotifications && (
            <IconButton
              onClick={onNotificationClick}
              sx={{ color: 'white' }}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}

          {user && (
            <>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  display: { xs: 'none', sm: 'block' },
                  mr: 1,
                }}
              >
                {user.email}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                aria-label="Logout"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
