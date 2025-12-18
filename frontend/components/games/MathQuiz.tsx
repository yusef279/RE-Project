'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  question: string;
  answer: number;
  options: number[];
}

interface MathQuizProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (score: number, accuracy: number, metadata: Record<string, any>) => void;
}

export default function MathQuiz({ difficulty, onComplete }: MathQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);

  const totalQuestions = 10;
  const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100;

  useEffect(() => {
    generateQuestions();
  }, [difficulty]);

  const generateQuestions = () => {
    const newQuestions: Question[] = [];

    for (let i = 0; i < totalQuestions; i++) {
      const operators = ['+', '-', '*'];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      let num1 = Math.floor(Math.random() * range) + 1;
      let num2 = Math.floor(Math.random() * range) + 1;

      // Adjust for subtraction to avoid negative numbers
      if (operator === '-' && num2 > num1) {
        [num1, num2] = [num2, num1];
      }

      // For division, ensure clean division
      if (operator === '*' && difficulty === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
      }

      let answer: number;
      let questionText: string;

      switch (operator) {
        case '+':
          answer = num1 + num2;
          questionText = `${num1} + ${num2} = ?`;
          break;
        case '-':
          answer = num1 - num2;
          questionText = `${num1} - ${num2} = ?`;
          break;
        case '*':
          answer = num1 * num2;
          questionText = `${num1} × ${num2} = ?`;
          break;
        default:
          answer = num1 + num2;
          questionText = `${num1} + ${num2} = ?`;
      }

      // Generate wrong options
      const options = [answer];
      while (options.length < 4) {
        const wrongAnswer = answer + Math.floor(Math.random() * 20) - 10;
        if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
          options.push(wrongAnswer);
        }
      }

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      newQuestions.push({
        question: questionText,
        answer,
        options,
      });
    }

    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsGameComplete(false);
  };

  const handleAnswerClick = (answer: number) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestionIndex].answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
      setScore((prev) => prev + 15);
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
        const finalScore = score + (correct ? 15 : 0);

        setTimeout(() => {
          onComplete(finalScore, accuracy, {
            totalQuestions,
            correctAnswers: correctAnswers + (correct ? 1 : 0),
            difficulty,
          });
        }, 1500);
      }
    }, 1500);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 text-center">
        <p className="text-xl text-gray-600">Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
      {/* Progress Display */}
      <div className="mb-6 flex justify-between items-center">
        <div className="text-center">
          <p className="text-sm text-gray-600">Question</p>
          <p className="text-3xl font-bold text-purple-600">
            {currentQuestionIndex + 1} / {totalQuestions}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Score</p>
          <p className="text-3xl font-bold text-pink-600">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Correct</p>
          <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Difficulty</p>
          <p className="text-xl font-bold text-blue-600 capitalize">{difficulty}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {!isGameComplete ? (
        <>
          {/* Question */}
          <div className="mb-8 text-center">
            <p className="text-5xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.answer;
              let buttonClass = 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600';

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
                    text-white font-bold text-3xl py-8 rounded-xl
                    transition-all transform hover:scale-105 shadow-lg
                    disabled:cursor-not-allowed
                  `}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div
              className={`mt-6 p-4 rounded-xl text-center text-xl font-bold ${
                isCorrect
                  ? 'bg-green-100 border-2 border-green-500 text-green-700'
                  : 'bg-red-100 border-2 border-red-500 text-red-700'
              }`}
            >
              {isCorrect ? '✅ Correct! Great job!' : `❌ Wrong! The answer is ${currentQuestion.answer}`}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-4xl font-bold text-green-700 mb-4">
            🎉 Quiz Complete!
          </p>
          <p className="text-2xl text-gray-700 mb-2">
            Final Score: {score}
          </p>
          <p className="text-xl text-gray-600">
            Correct Answers: {correctAnswers} / {totalQuestions}
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Calculating rewards...
          </p>
        </div>
      )}

      {/* Reset Button */}
      {!isGameComplete && (
        <div className="mt-8 text-center">
          <button
            onClick={generateQuestions}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
}
