import React, { useState, useEffect, useCallback } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats, Difficulty } from '../utils/gameUtils';

interface OnePlayerGameProps {
  onHome: () => void;
}

const QUESTIONS_TO_COMPLETE = 10;

const OnePlayerGame: React.FC<OnePlayerGameProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [question, setQuestion] = useState<Question>(generateQuestion('mixed'));
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [streak, setStreak] = useState(0);

  const [stats, setStats] = useState<PlayerStats>({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    questionsAnswered: [],
    answersGiven: [],
    correctAnswers: [],
  });

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, gameStarted, gameOver]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(difficulty));
  }, [difficulty]);

  const handleSubmit = useCallback(() => {
    if (input.length === 0 || gameOver || feedback) return;

    const answer = parseInt(input);
    const encodedQ = question.num1 * 1000 + question.num2;
    
    const newStats = {
      ...stats,
      questionsAnswered: [...stats.questionsAnswered, encodedQ],
      answersGiven: [...stats.answersGiven, answer],
      correctAnswers: [...stats.correctAnswers, question.answer],
    };

    if (answer === question.answer) {
      const newScore = score + 1;
      newStats.correct = stats.correct + 1;
      setScore(newScore);
      setStreak(prev => prev + 1);
      setFeedback('correct');

      if (newScore >= QUESTIONS_TO_COMPLETE) {
        newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
        setStats(newStats);
        setGameOver(true);
        setTimeout(() => setShowStats(true), 1500);
        return;
      }
    } else {
      newStats.incorrect = stats.incorrect + 1;
      setStreak(0);
      setFeedback('incorrect');
    }

    setStats(newStats);
    setInput('');
    
    setTimeout(() => {
      setFeedback(null);
      nextQuestion();
    }, 800);
  }, [input, question, score, stats, startTime, gameOver, feedback, nextQuestion]);

  const startGame = () => {
    setQuestion(generateQuestion(difficulty));
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const resetGame = () => {
    setQuestion(generateQuestion(difficulty));
    setInput('');
    setScore(0);
    setGameOver(false);
    setShowStats(false);
    setFeedback(null);
    setStreak(0);
    setGameStarted(false);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-game setup
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-3xl font-bold text-green-700 mb-6">Practice Mode</h2>
          
          {/* Difficulty Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">
              Choose difficulty:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['2-digit', 'mixed', '3-digit'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                    difficulty === diff
                      ? 'bg-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff === '2-digit' ? '2-digit' : diff === '3-digit' ? '3-digit' : 'Mixed'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200 text-left">
            <h4 className="font-bold text-green-700 mb-2">📋 What to expect:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Answer {QUESTIONS_TO_COMPLETE} addition questions</li>
              <li>• Practice at your own pace</li>
              <li>• Get tips on how to improve</li>
              <li>• {difficulty === '2-digit' ? 'Adding two 2-digit numbers' : difficulty === '3-digit' ? 'Adding two 3-digit numbers' : 'Mix of 2-digit and 3-digit numbers'}</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🎯 Start Practice!
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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-green-700">🎯 Practice Mode</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-green-700">Progress</span>
            <span className="font-bold text-green-700">{score}/{QUESTIONS_TO_COMPLETE}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${(score / QUESTIONS_TO_COMPLETE) * 100}%` }}
            />
          </div>
          {streak >= 3 && (
            <div className="text-center mt-2 text-orange-500 font-bold animate-pulse">
              🔥 {streak} in a row! Keep going!
            </div>
          )}
        </div>
      </div>

      {/* Question Display */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className={`bg-white rounded-3xl p-8 shadow-xl text-center transition-all duration-300 ${
          feedback === 'correct' ? 'ring-4 ring-green-400 scale-105' :
          feedback === 'incorrect' ? 'ring-4 ring-red-400 shake' : ''
        }`}>
          <p className="text-gray-500 text-lg mb-2">What is...</p>
          <div className="text-5xl md:text-6xl font-bold text-gray-800">
            {question.num1} + {question.num2} = ?
          </div>
          {feedback === 'correct' && (
            <div className="mt-4 text-3xl text-green-500 font-bold animate-bounce">✅ Correct!</div>
          )}
          {feedback === 'incorrect' && (
            <div className="mt-4 text-3xl text-red-500 font-bold">❌ The answer was {question.answer}</div>
          )}
        </div>
      </div>

      {/* Number Pad */}
      <div className="max-w-sm mx-auto px-4 mt-6 pb-8">
        <NumberPad
          value={input}
          onDigit={(digit) => {
            if (gameOver || feedback) return;
            setInput(prev => prev.length < 4 ? prev + digit : prev);
          }}
          onClear={() => setInput('')}
          onSubmit={handleSubmit}
          onDelete={() => setInput(prev => prev.slice(0, -1))}
          color="green"
          disabled={gameOver || feedback !== null}
          enableKeyboard={true}
        />
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <StatsOverlay
          stats={stats}
          title="Practice Complete!"
          subtitle="Great job practicing your addition!"
          onPlayAgain={resetGame}
          onHome={onHome}
          isWinner={true}
          playerColor="green"
        />
      )}
    </div>
  );
};

export default OnePlayerGame;
