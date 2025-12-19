'use client';

import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface ScreenTimeChartProps {
  currentMinutes: number;
  limitMinutes: number;
  childName?: string;
}

export function ScreenTimeChart({
  currentMinutes,
  limitMinutes,
  childName,
}: ScreenTimeChartProps) {
  const percentage = limitMinutes > 0 ? (currentMinutes / limitMinutes) * 100 : 0;
  const remainingMinutes = Math.max(0, limitMinutes - currentMinutes);
  const isOverLimit = currentMinutes > limitMinutes;

  const getColor = () => {
    if (isOverLimit) return 'error';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <AccessTimeIcon color="primary" />
          <Typography variant="h6" component="h3">
            Screen Time {childName ? `- ${childName}` : ''}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {currentMinutes} / {limitMinutes} minutes
            </Typography>
            <Typography
              variant="body2"
              color={isOverLimit ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: 'bold' }}
            >
              {isOverLimit ? 'Over limit' : `${remainingMinutes} min remaining`}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            color={getColor()}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>

        {isOverLimit && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            ⚠️ Screen time limit exceeded. Consider taking a break.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
