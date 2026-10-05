import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, generateMultipleChoice, Question, PlayerStats } from '../utils/gameUtils';

interface LightningRoundProps {
  onHome: () => void;
}

const GAME_DURATION = 60; // 60 seconds

const LightningRound: React.FC<LightningRoundProps> = ({ onHome }) => {
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [choices, setChoices] = useState<number[]>(generateMultipleChoice(question.answer));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);

  const [stats, setStats] = useState<PlayerStats>({
    correct: 0,
    incorrect: 0,
    totalTime: GAME_DURATION,
    questionsAnswered: [],
    answersGiven: [],
    correctAnswers: [],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameOver(true);
            setTimeout(() => setShowStats(true), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver]);

  const nextQuestion = useCallback(() => {
    const newQ = generateQuestion();
    setQuestion(newQ);
    setChoices(generateMultipleChoice(newQ.answer));
    setQuestionNumber(prev => prev + 1);
  }, []);

  const handleAnswer = useCallback((choice: number) => {
    if (gameOver || feedback !== null) return;

    const encodedQ = question.num1 * 10 + question.num2;
    const newStats = {
      ...stats,
      questionsAnswered: [...stats.questionsAnswered, encodedQ],
      answersGiven: [...stats.answersGiven, choice],
      correctAnswers: [...stats.correctAnswers, question.answer],
    };

    setFeedback(choice);

    if (choice === question.answer) {
      newStats.correct = stats.correct + 1;
      setScore(prev => prev + 1);
    } else {
      newStats.incorrect = stats.incorrect + 1;
    }

    setStats(newStats);

    setTimeout(() => {
      setFeedback(null);
      nextQuestion();
    }, 600);
  }, [question, stats, gameOver, feedback, nextQuestion]);

  const startGame = () => {
    setGameStarted(true);
  };

  const resetGame = () => {
    const newQ = generateQuestion();
    setQuestion(newQ);
    setChoices(generateMultipleChoice(newQ.answer));
    setScore(0);
    setGameOver(false);
    setShowStats(false);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    setGameStarted(false);
    setQuestionNumber(1);
    setStats({ correct: 0, incorrect: 0, totalTime: GAME_DURATION, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-600';
    if (timeLeft > 10) return 'text-yellow-600';
    return 'text-red-600 animate-pulse';
  };

  const getTimerBarColor = () => {
    if (timeLeft > 30) return 'from-green-400 to-emerald-500';
    if (timeLeft > 10) return 'from-yellow-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  if (!gameStarted && !gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4">
          <div className="text-7xl mb-4">⚡</div>
          <h1 className="text-4xl font-bold text-orange-600 mb-4">Lightning Round!</h1>
          <p className="text-gray-600 text-lg mb-2">
            Answer as many multiplication questions as you can in <span className="font-bold text-orange-600">60 seconds!</span>
          </p>
          <p className="text-gray-500 mb-6">
            Pick the correct answer from 4 choices. Be quick and accurate!
          </p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-6 border-2 border-orange-200">
            <p className="text-orange-700 font-medium">⚡ Speed matters! The faster you answer, the more points you get!</p>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            ⚡ START!
          </button>
          <button
            onClick={onHome}
            className="block mx-auto mt-4 text-gray-500 hover:text-gray-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-orange-600">⚡ Lightning Round</h1>
          <div className={`text-2xl font-bold ${getTimerColor()}`}>
            ⏱️ {timeLeft}s
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Question #{questionNumber}</span>
            <span className="text-sm font-bold text-orange-600">Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${getTimerBarColor()} transition-all duration-1000 ease-linear`}
              style={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-gray-500 text-lg mb-3">Quick! What is...</p>
          <div className="text-7xl font-bold text-gray-800 mb-6">
            {question.num1} × {question.num2}
          </div>

          {/* Multiple Choice Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {choices.map((choice, index) => {
              let btnClass = 'bg-gradient-to-br from-orange-100 to-amber-100 hover:from-orange-200 hover:to-amber-200 border-orange-300 text-gray-800';
              
              if (feedback !== null) {
                if (choice === question.answer) {
                  btnClass = 'bg-green-400 border-green-500 text-white scale-110';
                } else if (choice === feedback && choice !== question.answer) {
                  btnClass = 'bg-red-400 border-red-500 text-white scale-95';
                } else {
                  btnClass = 'bg-gray-100 border-gray-200 text-gray-400';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(choice)}
                  disabled={feedback !== null || gameOver}
                  className={`${btnClass} font-bold text-3xl py-6 rounded-2xl border-4 transition-all duration-200 transform shadow-md`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 text-center transform animate-bounceIn shadow-2xl">
            <div className="text-7xl mb-4">⚡</div>
            <h2 className="text-4xl font-bold text-orange-600">Time's Up!</h2>
            <p className="text-gray-500 mt-2 text-xl">You got {score} correct!</p>
          </div>
        </div>
      )}

      {/* Stats Overlay */}
      {showStats && (
        <StatsOverlay
          stats={stats}
          title="Lightning Round Complete!"
          subtitle={`You answered ${stats.questionsAnswered.length} questions!`}
          onPlayAgain={resetGame}
          onHome={onHome}
          isWinner={score >= 8}
          playerColor="purple"
        />
      )}
    </div>
  );
};

export default LightningRound;
