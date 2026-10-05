import React, { useState, useEffect, useCallback } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats, Difficulty } from '../utils/gameUtils';

interface InfinityRoundProps {
  onHome: () => void;
}

const InfinityRound: React.FC<InfinityRoundProps> = ({ onHome }) => {
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
  const [totalAnswered, setTotalAnswered] = useState(0);

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

    setTotalAnswered(prev => prev + 1);

    if (answer === question.answer) {
      newStats.correct = stats.correct + 1;
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedback('correct');
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
    }, 600);
  }, [input, question, stats, gameOver, feedback, nextQuestion]);

  const startGame = () => {
    setQuestion(generateQuestion(difficulty));
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const endRound = () => {
    const finalStats = {
      ...stats,
      totalTime: Math.floor((Date.now() - startTime) / 1000),
    };
    setStats(finalStats);
    setGameOver(true);
    setTimeout(() => setShowStats(true), 500);
  };

  const resetGame = () => {
    setQuestion(generateQuestion(difficulty));
    setInput('');
    setScore(0);
    setGameOver(false);
    setShowStats(false);
    setFeedback(null);
    setStreak(0);
    setTotalAnswered(0);
    setGameStarted(false);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-game setup
  if (!gameStarted && !gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4">
          <div className="text-7xl mb-4">♾️</div>
          <h1 className="text-4xl font-bold text-purple-700 mb-4">Infinity Round!</h1>
          
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
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff === '2-digit' ? '2-digit' : diff === '3-digit' ? '3-digit' : 'Mixed'}
                </button>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-lg mb-2">
            Answer as many addition questions as you want!
          </p>
          <p className="text-gray-500 mb-6">
            No time limit. Press "End Round" when you're done.
          </p>
          <div className="bg-purple-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
            <p className="text-purple-700 font-medium">♾️ Go at your own pace and see how many you can get!</p>
          </div>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 transform hover:scale-110 shadow-lg"
          >
            ♾️ START!
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-700">♾️ Infinity Round</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{score}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalAnswered}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">🔥 {streak}</div>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
            <button
              onClick={endRound}
              disabled={gameOver}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-2 px-5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
            >
              🏁 End Round
            </button>
          </div>
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
            <div className="mt-4 text-3xl text-green-500 font-bold animate-bounce">✅ Nice!</div>
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
          color="purple"
          disabled={gameOver || feedback !== null}
          enableKeyboard={true}
        />
      </div>

      {/* Stats Overlay */}
      {showStats && (
        <StatsOverlay
          stats={stats}
          title="Infinity Round Complete!"
          subtitle={`You answered ${totalAnswered} questions in ${formatTime(stats.totalTime)}!`}
          onPlayAgain={resetGame}
          onHome={onHome}
          isWinner={stats.correct > stats.incorrect}
          playerColor="purple"
        />
      )}
    </div>
  );
};

export default InfinityRound;
