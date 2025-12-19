'use client';

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useRouter } from 'next/navigation';

interface Game {
  _id: string;
  title: string;
  iconEmoji: string;
  description?: string;
  category: string;
  minAge: number;
  maxAge: number;
}

interface GameCarouselProps {
  games: Game[];
  childId: string;
  childAge: number;
}

export function GameCarousel({ games, childId, childAge }: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();

  // Filter games by age
  const ageAppropriateGames = games.filter(
    (game) => childAge >= game.minAge && childAge <= game.maxAge
  );

  useEffect(() => {
    if (ageAppropriateGames.length > 0 && currentIndex >= ageAppropriateGames.length) {
      setCurrentIndex(0);
    }
  }, [ageAppropriateGames.length, currentIndex]);

  if (ageAppropriateGames.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No games available for your age group yet. Check back soon! 🎮
        </Typography>
      </Box>
    );
  }

  const currentGame = ageAppropriateGames[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ageAppropriateGames.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ageAppropriateGames.length) % ageAppropriateGames.length);
  };

  const handleGameClick = () => {
    router.push(`/games/${currentGame._id}?childId=${childId}`);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Card
        sx={{
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
        onClick={handleGameClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleGameClick();
          }
        }}
        aria-label={`Play ${currentGame.title}`}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h2" component="div" sx={{ mb: 2 }}>
            {currentGame.iconEmoji}
          </Typography>
          <Typography variant="h5" component="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
            {currentGame.title}
          </Typography>
          {currentGame.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {currentGame.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={currentGame.category}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Ages ${currentGame.minAge}-${currentGame.maxAge}`}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Click to play! 🎮
          </Typography>
        </CardContent>
      </Card>

      {ageAppropriateGames.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: { xs: -20, sm: -40 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            aria-label="Previous game"
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: { xs: -20, sm: -40 },
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
            aria-label="Next game"
          >
            <ArrowForwardIosIcon />
          </IconButton>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            {ageAppropriateGames.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentIndex ? 'primary.main' : 'action.disabled',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                aria-label={`Go to game ${index + 1}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentIndex(index);
                  }
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
