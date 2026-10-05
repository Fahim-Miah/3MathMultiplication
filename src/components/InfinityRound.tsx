import React, { useState, useEffect, useCallback } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats } from '../utils/gameUtils';

interface InfinityRoundProps {
  onHome: () => void;
}

const InfinityRound: React.FC<InfinityRoundProps> = ({ onHome }) => {
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [startTime] = useState(Date.now());
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
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
  }, []);

  const checkAnswer = useCallback((inputValue: string) => {
    const answer = parseInt(inputValue);
    const encodedQ = question.num1 * 10 + question.num2;
    
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
  }, [question, stats, nextQuestion]);

  const endRound = () => {
    const finalStats = {
      ...stats,
      totalTime: Math.floor((Date.now() - startTime) / 1000),
    };
    setStats(finalStats);
    setGameOver(true);
    setTimeout(() => setShowStats(true), 500);
  };

  const handleDigit = (digit: string) => {
    if (gameOver || feedback) return;
    setInput(prev => prev.length < 3 ? prev + digit : prev);
  };

  const resetGame = () => {
    setQuestion(generateQuestion());
    setInput('');
    setScore(0);
    setGameOver(false);
    setShowStats(false);
    setFeedback(null);
    setStreak(0);
    setTotalAnswered(0);
    setStats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <div className="text-6xl font-bold text-gray-800">
            {question.num1} × {question.num2} = ?
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
          onDigit={handleDigit}
          onClear={() => setInput('')}
          onSubmit={() => checkAnswer(input)}
          onDelete={() => setInput(prev => prev.slice(0, -1))}
          color="purple"
          disabled={gameOver || feedback !== null}
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
