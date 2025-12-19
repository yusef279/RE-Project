'use client';

import { Box, Card, CardContent, Typography, LinearProgress, Avatar, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface Badge {
  _id: string;
  name: string;
  description: string;
  iconEmoji?: string;
  earnedAt?: string;
}

interface ProgressDisplayProps {
  totalPoints: number;
  badges?: Badge[];
  level?: number;
  pointsToNextLevel?: number;
  avatarUrl?: string;
  childName?: string;
}

export function ProgressDisplay({
  totalPoints,
  badges = [],
  level = Math.floor(totalPoints / 100) + 1,
  pointsToNextLevel = 100 - (totalPoints % 100),
  avatarUrl,
  childName,
}: ProgressDisplayProps) {
  const progressPercent = ((totalPoints % 100) / 100) * 100;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Avatar and Points Card */}
      <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={avatarUrl}
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                bgcolor: 'secondary.main',
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
            >
              {childName?.[0]?.toUpperCase() || '👤'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                {childName || 'Player'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <StarIcon sx={{ fontSize: 24 }} />
                <Typography variant="h5" component="span" sx={{ fontWeight: 'bold' }}>
                  {totalPoints}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  points
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Level Progress */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Level {level}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {pointsToNextLevel} points to next level
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Badges Card */}
      {badges.length > 0 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEventsIcon color="primary" />
              <Typography variant="h6" component="h3">
                Badges Earned ({badges.length})
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {badges.map((badge) => (
                <Chip
                  key={badge._id}
                  icon={
                    badge.iconEmoji ? (
                      <span style={{ fontSize: '1.2rem' }}>{badge.iconEmoji}</span>
                    ) : undefined
                  }
                  label={badge.name}
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  title={badge.description}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
