import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { Game, GameType, GameCategory } from '../schemas/game.schema';
import { Badge } from '../schemas/badge.schema';
import { getModelToken } from '@nestjs/mongoose';

async function seedGames() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gameModel = app.get<Model<Game>>(getModelToken(Game.name));
  const badgeModel = app.get<Model<Badge>>(getModelToken(Badge.name));

  // Clear existing games
  await gameModel.deleteMany({});

  const games = [
    {
      title: 'Math Quiz',
      description: 'Test your math skills with fun quizzes! Solve addition, subtraction, multiplication problems.',
      type: GameType.LEARN,
      category: GameCategory.MATH,
      iconEmoji: '🧮',
      minAge: 6,
      maxAge: 12,
      basePoints: 15,
      isActive: true,
      isEgyptianThemed: false,
      culturalThemes: [],
      iconBadges: ['Educational'],
      config: {
        difficulties: ['easy', 'medium', 'hard'],
        questionTypes: ['addition', 'subtraction', 'multiplication'],
      },
    },
    {
      title: 'Memory Match',
      description: 'Match pairs of cards and improve your memory! Find all matching pairs to win.',
      type: GameType.PLAY,
      category: GameCategory.MEMORY,
      iconEmoji: '🎴',
      minAge: 3,
      maxAge: 12,
      basePoints: 10,
      isActive: true,
      isEgyptianThemed: false,
      culturalThemes: [],
      iconBadges: [],
      config: {
        difficulties: ['easy', 'medium', 'hard'],
        gridSizes: { easy: 4, medium: 6, hard: 8 },
      },
    },
    {
      title: "Pharaoh's Math Pyramid",
      description: 'Help build the pyramids by solving math problems! Egyptian-themed mathematics adventure.',
      type: GameType.LEARN,
      category: GameCategory.MATH,
      iconEmoji: '🔺',
      minAge: 6,
      maxAge: 12,
      basePoints: 20,
      isActive: true,
      isEgyptianThemed: true,
      culturalThemes: ['Ancient Egypt', 'Pyramids', 'History'],
      iconBadges: ['Historical', 'Egyptian Culture'],
      config: {
        difficulties: ['easy', 'medium', 'hard'],
        theme: 'ancient-egypt',
      },
    },
    {
      title: 'Nile River Science',
      description: 'Learn about the Nile River ecosystem and Egyptian geography through interactive challenges.',
      type: GameType.LEARN,
      category: GameCategory.QUIZ,
      iconEmoji: '🏞️',
      minAge: 7,
      maxAge: 12,
      basePoints: 18,
      isActive: true,
      isEgyptianThemed: true,
      culturalThemes: ['Geography', 'Nile River', 'Egyptian Nature'],
      iconBadges: ['Science', 'Egyptian Culture'],
      config: {
        subjects: ['geography', 'biology', 'ecology'],
        theme: 'nile-river',
      },
    },
    {
      title: 'Arabic Word Puzzle',
      description: 'Practice Arabic vocabulary and spelling with fun word puzzles!',
      type: GameType.LEARN,
      category: GameCategory.LANGUAGE,
      iconEmoji: '📝',
      minAge: 6,
      maxAge: 12,
      basePoints: 15,
      isActive: true,
      isEgyptianThemed: true,
      culturalThemes: ['Arabic Language', 'Egyptian Dialect'],
      iconBadges: ['Language', 'Educational'],
      config: {
        language: 'arabic',
        difficulties: ['easy', 'medium', 'hard'],
      },
    },
    {
      title: 'Creative Sandbox',
      description: 'Create your own stories and animations with Egyptian-themed tools!',
      type: GameType.PLAY,
      category: GameCategory.CREATIVE,
      iconEmoji: '🎨',
      minAge: 5,
      maxAge: 12,
      basePoints: 25,
      isActive: true,
      isEgyptianThemed: true,
      culturalThemes: ['Egyptian Art', 'Creativity', 'Storytelling'],
      iconBadges: ['Creative', 'Egyptian Culture'],
      config: {
        tools: ['drawing', 'animation', 'storytelling'],
        egyptianAssets: ['pyramids', 'hieroglyphs', 'pharaohs', 'desert-animals'],
      },
    },
  ];

  await gameModel.insertMany(games);

  console.log(`✅ Successfully seeded ${games.length} games!`);
  console.log('\nGames created:');
  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.title} (${game.type}, ${game.category})`);
  });

  // Seed badges
  await badgeModel.deleteMany({});

  const badges = [
    {
      name: 'First Steps',
      description: 'Complete your first game!',
      iconEmoji: '🎯',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'first_game',
      },
    },
    {
      name: 'Explorer',
      description: 'Earn 100 points',
      iconEmoji: '🏃',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'points_milestone',
        points: 100,
      },
    },
    {
      name: 'Champion',
      description: 'Earn 500 points',
      iconEmoji: '🏆',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'points_milestone',
        points: 500,
      },
    },
    {
      name: 'Master',
      description: 'Earn 1000 points',
      iconEmoji: '👑',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'points_milestone',
        points: 1000,
      },
    },
    {
      name: 'Perfect Score',
      description: 'Get a perfect score on any game',
      iconEmoji: '💯',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'perfect_score',
      },
    },
    {
      name: 'Dedicated Learner',
      description: 'Complete 10 games',
      iconEmoji: '📚',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'games_completed',
        count: 10,
      },
    },
    {
      name: 'Pharaoh Champion',
      description: 'Complete 25 games',
      iconEmoji: '🏺',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'games_completed',
        count: 25,
      },
    },
    {
      name: 'Daily Player',
      description: 'Play games for 5 days in a row',
      iconEmoji: '🔥',
      category: 'achievement',
      isActive: true,
      criteria: {
        type: 'streak',
        days: 5,
      },
    },
  ];

  await badgeModel.insertMany(badges);

  console.log(`\n✅ Successfully seeded ${badges.length} badges!`);
  console.log('\nBadges created:');
  badges.forEach((badge, index) => {
    console.log(`${index + 1}. ${badge.iconEmoji} ${badge.name} - ${badge.description}`);
  });

  await app.close();
}

seedGames()
  .then(() => {
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  });
