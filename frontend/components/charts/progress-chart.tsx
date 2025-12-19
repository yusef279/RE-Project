'use client';

import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressDataPoint {
  date: string;
  points: number;
  gamesCompleted: number;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
}

export function ProgressChart({ data, title = 'Progress Over Time' }: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No progress data available yet.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Points"
            />
            <Line
              type="monotone"
              dataKey="gamesCompleted"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Games Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
