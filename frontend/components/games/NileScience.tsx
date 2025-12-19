'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

interface NileScienceProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

const QUESTIONS = {
  easy: [
    {
      question: 'What is the longest river in the world?',
      options: ['Amazon River', 'Nile River', 'Yellow River', 'Mississippi River'],
      correctAnswer: 'Nile River',
      explanation: 'The Nile River is approximately 6,650 km long, making it the longest river in the world!',
      category: 'Geography',
    },
    {
      question: 'The Nile River flows into which sea?',
      options: ['Red Sea', 'Mediterranean Sea', 'Dead Sea', 'Black Sea'],
      correctAnswer: 'Mediterranean Sea',
      explanation: 'The Nile flows northward through Egypt and empties into the Mediterranean Sea.',
      category: 'Geography',
    },
    {
      question: 'What color is the fertile soil left by the Nile floods?',
      options: ['Red', 'Black', 'Yellow', 'White'],
      correctAnswer: 'Black',
      explanation: 'The black fertile soil is why ancient Egyptians called their land "Kemet" meaning "black land".',
      category: 'History',
    },
    {
      question: 'Which animal is commonly found in the Nile River?',
      options: ['Polar Bear', 'Crocodile', 'Penguin', 'Kangaroo'],
      correctAnswer: 'Crocodile',
      explanation: 'Nile crocodiles are one of the most famous animals living in and around the Nile River!',
      category: 'Biology',
    },
    {
      question: 'What is the main direction the Nile River flows?',
      options: ['North', 'South', 'East', 'West'],
      correctAnswer: 'North',
      explanation: 'The Nile is unique because it flows northward, from the highlands to the sea.',
      category: 'Geography',
    },
    {
      question: 'What plant grows along the Nile that ancient Egyptians used for paper?',
      options: ['Papyrus', 'Bamboo', 'Oak', 'Pine'],
      correctAnswer: 'Papyrus',
      explanation: 'Papyrus plants were used to make one of the first forms of paper in ancient Egypt!',
      category: 'History',
    },
    {
      question: 'How many countries does the Nile flow through?',
      options: ['5', '11', '3', '20'],
      correctAnswer: '11',
      explanation: 'The Nile flows through 11 countries in northeastern Africa!',
      category: 'Geography',
    },
    {
      question: 'What season did the Nile traditionally flood in ancient Egypt?',
      options: ['Winter', 'Spring', 'Summer', 'Autumn'],
      correctAnswer: 'Summer',
      explanation: 'The Nile flooded every summer, bringing rich soil perfect for farming.',
      category: 'History',
    },
    {
      question: 'Which bird is sacred in ancient Egypt and lives near the Nile?',
      options: ['Eagle', 'Ibis', 'Parrot', 'Ostrich'],
      correctAnswer: 'Ibis',
      explanation: 'The ibis was sacred to Thoth, the god of wisdom, and lived along the Nile banks.',
      category: 'History',
    },
    {
      question: 'What is built across the Nile to control water flow?',
      options: ['Bridge', 'Dam', 'Tunnel', 'Tower'],
      correctAnswer: 'Dam',
      explanation: 'The Aswan Dam was built to control the Nile\'s flooding and generate electricity.',
      category: 'Engineering',
    },
  ],
  medium: [
    {
      question: 'What percentage of Egypt\'s population lives near the Nile River?',
      options: ['50%', '75%', '95%', '100%'],
      correctAnswer: '95%',
      explanation: 'About 95% of Egyptians live within a few kilometers of the Nile River valley.',
      category: 'Geography',
    },
    {
      question: 'Which lake is the source of the White Nile?',
      options: ['Lake Chad', 'Lake Victoria', 'Lake Tanganyika', 'Lake Malawi'],
      correctAnswer: 'Lake Victoria',
      explanation: 'Lake Victoria, shared by Kenya, Uganda, and Tanzania, is the source of the White Nile.',
      category: 'Geography',
    },
    {
      question: 'What ancient structure did Egyptians build to measure Nile water levels?',
      options: ['Pyramid', 'Nilometer', 'Obelisk', 'Sphinx'],
      correctAnswer: 'Nilometer',
      explanation: 'Nilometers were used to predict harvest success based on flood levels.',
      category: 'History',
    },
    {
      question: 'The Nile Delta forms which shape?',
      options: ['Circle', 'Triangle', 'Square', 'Pentagon'],
      correctAnswer: 'Triangle',
      explanation: 'The Nile Delta is named after the Greek letter Delta (Δ) because of its triangular shape.',
      category: 'Geography',
    },
    {
      question: 'Which dam created Lake Nasser?',
      options: ['Hoover Dam', 'Aswan High Dam', 'Three Gorges Dam', 'Grand Coulee Dam'],
      correctAnswer: 'Aswan High Dam',
      explanation: 'The Aswan High Dam, completed in 1970, created Lake Nasser, one of the world\'s largest reservoirs.',
      category: 'Engineering',
    },
    {
      question: 'What is the name of the annual Nile flood in ancient Egypt?',
      options: ['Akhet', 'Peret', 'Shemu', 'Inundation'],
      correctAnswer: 'Akhet',
      explanation: 'Akhet was the flood season, one of three seasons in the ancient Egyptian calendar.',
      category: 'History',
    },
    {
      question: 'Which gas do aquatic plants in the Nile produce?',
      options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Methane'],
      correctAnswer: 'Oxygen',
      explanation: 'Like all plants, aquatic plants produce oxygen through photosynthesis.',
      category: 'Biology',
    },
    {
      question: 'What color is the Blue Nile named after?',
      options: ['The sky', 'Dark sediment', 'Blue flowers', 'Deep water'],
      correctAnswer: 'Dark sediment',
      explanation: 'The Blue Nile appears dark or blue due to the black sediment it carries during floods.',
      category: 'Geography',
    },
    {
      question: 'How did ancient Egyptians irrigate their farms from the Nile?',
      options: ['Pipes', 'Shaduf', 'Sprinklers', 'Hoses'],
      correctAnswer: 'Shaduf',
      explanation: 'The shaduf was a hand-operated device to lift water from the Nile to irrigation canals.',
      category: 'History',
    },
    {
      question: 'What process causes the Nile to deposit fertile soil?',
      options: ['Erosion', 'Sedimentation', 'Evaporation', 'Condensation'],
      correctAnswer: 'Sedimentation',
      explanation: 'Sedimentation occurs when the river slows down and deposits the soil it carries.',
      category: 'Science',
    },
  ],
  hard: [
    {
      question: 'What is the total length of the Nile River?',
      options: ['4,132 km', '6,650 km', '8,500 km', '5,200 km'],
      correctAnswer: '6,650 km',
      explanation: 'The Nile is approximately 6,650 kilometers (4,130 miles) long.',
      category: 'Geography',
    },
    {
      question: 'Which explorer is credited with finding the source of the Nile?',
      options: ['David Livingstone', 'John Speke', 'Henry Stanley', 'Richard Burton'],
      correctAnswer: 'John Speke',
      explanation: 'John Hanning Speke identified Lake Victoria as the source in 1858.',
      category: 'History',
    },
    {
      question: 'What is the ecological impact of the Aswan High Dam?',
      options: ['Increased flooding', 'Loss of silt downstream', 'More rain', 'Colder water'],
      correctAnswer: 'Loss of silt downstream',
      explanation: 'The dam traps nutrient-rich silt, affecting agriculture and the Nile Delta ecosystem.',
      category: 'Environment',
    },
    {
      question: 'What ancient civilization besides Egypt relied on the Nile?',
      options: ['Mesopotamia', 'Nubia', 'Greece', 'Rome'],
      correctAnswer: 'Nubia',
      explanation: 'The Kingdom of Nubia (ancient Sudan) was centered along the Nile south of Egypt.',
      category: 'History',
    },
    {
      question: 'What is eutrophication in the Nile ecosystem?',
      options: ['Water shortage', 'Excess nutrients causing algae', 'Fish migration', 'River widening'],
      correctAnswer: 'Excess nutrients causing algae',
      explanation: 'Eutrophication occurs when excess nutrients cause rapid algae growth, depleting oxygen.',
      category: 'Biology',
    },
    {
      question: 'Which two rivers join to form the Nile at Khartoum?',
      options: ['Red and Yellow', 'White and Blue', 'Green and Black', 'North and South'],
      correctAnswer: 'White and Blue',
      explanation: 'The White Nile and Blue Nile converge at Khartoum, Sudan.',
      category: 'Geography',
    },
    {
      question: 'What percentage of the Nile\'s water comes from the Blue Nile during flood season?',
      options: ['30%', '50%', '80%', '90%'],
      correctAnswer: '80%',
      explanation: 'During flood season, the Blue Nile contributes about 80% of the water and most of the silt.',
      category: 'Science',
    },
    {
      question: 'What treaty governs water rights to the Nile?',
      options: ['Cairo Agreement', 'Nile Waters Agreement', 'African Water Pact', 'UN Water Treaty'],
      correctAnswer: 'Nile Waters Agreement',
      explanation: 'The 1959 Nile Waters Agreement between Egypt and Sudan governs water allocation.',
      category: 'Politics',
    },
    {
      question: 'Which fish is endemic to the Nile and important to local fisheries?',
      options: ['Nile Salmon', 'Nile Perch', 'Nile Tuna', 'Nile Cod'],
      correctAnswer: 'Nile Perch',
      explanation: 'The Nile Perch is a large freshwater fish important to the fishing industry.',
      category: 'Biology',
    },
    {
      question: 'What is the primary cause of the Nile\'s annual flood historically?',
      options: ['Ocean tides', 'Ethiopian monsoons', 'Melting snow', 'Underground springs'],
      correctAnswer: 'Ethiopian monsoons',
      explanation: 'Monsoon rains in the Ethiopian highlands cause the Blue Nile to swell and flood.',
      category: 'Climate',
    },
  ],
};

export default function NileScience({ difficulty, onComplete }: NileScienceProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [categoriesCorrect, setCategoriesCorrect] = useState<Record<string, number>>({});

  const totalQuestions = 10;

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  const initializeGame = () => {
    const questionPool = QUESTIONS[difficulty];
    const selectedQuestions = [...questionPool]
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);

    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsGameComplete(false);
    setCategoriesCorrect({});
  };

  const handleAnswerClick = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
      setScore((prev) => prev + 20);

      // Track category performance
      const category = questions[currentQuestionIndex].category;
      setCategoriesCorrect((prev) => ({
        ...prev,
        [category]: (prev[category] || 0) + 1,
      }));
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < totalQuestions) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Game complete
        setIsGameComplete(true);
        const accuracy = ((correctAnswers + (correct ? 1 : 0)) / totalQuestions) * 100;
        const finalScore = score + (correct ? 20 : 0);

        setTimeout(() => {
          onComplete(finalScore, accuracy, {
            totalQuestions,
            correctAnswers: correctAnswers + (correct ? 1 : 0),
            difficulty,
            theme: 'nile-river-science',
            categoriesCorrect,
          });
        }, 2000);
      }
    }, 3000);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
        <p className="text-xl text-gray-600">Preparing questions about the Nile...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-blue-900 mb-2">
          🌊 Nile River Science Quest 🌊
        </h2>
        <p className="text-lg text-blue-700">Discover the secrets of Egypt's mighty river!</p>
      </div>

      {/* Progress Display */}
      <div className="mb-6 flex justify-between items-center bg-white/70 rounded-xl p-4">
        <div className="text-center">
          <p className="text-sm text-blue-700">Question</p>
          <p className="text-3xl font-bold text-blue-900">
            {currentQuestionIndex + 1} / {totalQuestions}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-700">Score</p>
          <p className="text-3xl font-bold text-cyan-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-700">Correct</p>
          <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-blue-700">Category</p>
          <p className="text-xl font-bold text-teal-600">{currentQuestion.category}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white/50 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 h-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {!isGameComplete ? (
        <>
          {/* Question Card */}
          <div className="mb-8 bg-white/80 rounded-xl p-6 shadow-lg border-4 border-blue-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🏺</div>
              <p className="text-2xl font-bold text-blue-900 mb-2">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correctAnswer;
              let buttonClass = 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500';

              if (showFeedback) {
                if (isSelected && isCorrect) {
                  buttonClass = 'bg-gradient-to-r from-green-400 to-green-500';
                } else if (isSelected && !isCorrect) {
                  buttonClass = 'bg-gradient-to-r from-red-400 to-red-500';
                } else if (isCorrectAnswer) {
                  buttonClass = 'bg-gradient-to-r from-green-400 to-green-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  disabled={showFeedback}
                  className={`
                    ${buttonClass}
                    text-white font-bold text-xl py-4 px-6 rounded-xl
                    transition-all transform hover:scale-102 shadow-lg
                    disabled:cursor-not-allowed border-2 border-blue-600
                    text-left
                  `}
                >
                  <span className="text-2xl mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback with Explanation */}
          {showFeedback && (
            <div
              className={`p-6 rounded-xl text-center border-4 ${
                isCorrect
                  ? 'bg-green-100 border-green-600'
                  : 'bg-red-100 border-red-600'
              }`}
            >
              <p className={`text-2xl font-bold mb-3 ${
                isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {isCorrect ? '✅ Excellent!' : '❌ Not quite right'}
              </p>
              <p className="text-lg text-gray-800 bg-white/60 rounded-lg p-3">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-white/80 rounded-xl shadow-lg">
          <p className="text-6xl mb-4">🏆</p>
          <p className="text-4xl font-bold text-blue-900 mb-4">
            Quest Complete!
          </p>
          <p className="text-2xl text-blue-700 mb-2">
            Final Score: {score}
          </p>
          <p className="text-xl text-blue-600 mb-4">
            Correct Answers: {correctAnswers} / {totalQuestions}
          </p>

          {/* Category Breakdown */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-lg font-bold text-blue-800 mb-2">Knowledge Areas:</p>
            <div className="text-left space-y-1">
              {Object.entries(categoriesCorrect).map(([category, count]) => (
                <div key={category} className="flex justify-between text-blue-700">
                  <span>{category}:</span>
                  <span className="font-bold">{count} correct</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-lg text-gray-500 mt-6">
            Calculating rewards...
          </p>
        </div>
      )}

      {/* Reset Button */}
      {!isGameComplete && (
        <div className="mt-8 text-center">
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Restart Quest
          </button>
        </div>
      )}
    </div>
  );
}
