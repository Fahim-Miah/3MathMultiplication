import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface TwoPlayerStatsOverlayProps {
  player1Stats: PlayerStats;
  player2Stats: PlayerStats;
  winner: 'player1' | 'player2' | null;
  onPlayAgain: () => void;
  onHome: () => void;
}

const TwoPlayerStatsOverlay: React.FC<TwoPlayerStatsOverlayProps> = ({
  player1Stats,
  player2Stats,
  winner,
  onPlayAgain,
  onHome,
}) => {
  const p1Percentage = calculatePercentage(player1Stats.correct, player1Stats.questionsAnswered.length);
  const p2Percentage = calculatePercentage(player2Stats.correct, player2Stats.questionsAnswered.length);
  const p1Advice = getAdvice(player1Stats);
  const p2Advice = getAdvice(player2Stats);

  useEffect(() => {
    // Fire confetti for the winner
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: winner === 'player1' ? ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'] : ['#ef4444', '#f87171', '#fca5a5', '#dc2626'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: winner === 'player1' ? ['#3b82f6', '#60a5fa', '#93c5fd', '#2563eb'] : ['#ef4444', '#f87171', '#fca5a5', '#dc2626'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [winner]);

  const renderPlayerCard = (
    stats: PlayerStats,
    playerName: string,
    color: 'blue' | 'red',
    percentage: number,
    advice: string[],
    isWinner: boolean
  ) => {
    const colorMap = {
      blue: {
        gradient: 'from-blue-400 to-blue-600',
        text: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        bar: 'from-blue-400 to-blue-600',
      },
      red: {
        gradient: 'from-red-400 to-red-600',
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        bar: 'from-red-400 to-red-600',
      },
    };

    const colors = colorMap[color];

    return (
      <div className={`rounded-2xl p-5 border-2 ${colors.border} ${colors.bg} ${isWinner ? 'ring-4 ring-yellow-400 shadow-lg' : ''}`}>
        <div className="text-center mb-4">
          {isWinner && <div className="text-3xl mb-1">🏆</div>}
          <h3 className={`text-xl font-bold ${colors.text}`}>
            {color === 'blue' ? '🔵' : '🔴'} {playerName}
          </h3>
          {isWinner && <span className="text-sm text-yellow-600 font-bold">WINNER!</span>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold text-green-600`}>{stats.correct}</div>
            <div className="text-xs text-gray-500">✅ Correct</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold text-red-600`}>{stats.incorrect}</div>
            <div className="text-xs text-gray-500">❌ Wrong</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold text-blue-600`}>{formatTime(stats.totalTime)}</div>
            <div className="text-xs text-gray-500">⏱️ Time</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${colors.text}`}>{percentage}%</div>
            <div className="text-xs text-gray-500">📊 Accuracy</div>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Advice */}
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <h4 className="font-bold text-yellow-800 text-sm mb-1">💡 Tips:</h4>
          <ul className="space-y-1">
            {advice.slice(0, 3).map((tip, index) => (
              <li key={index} className="text-yellow-900 text-xs leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform animate-scaleIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-red-500 bg-clip-text text-transparent">
            Game Over!
          </h2>
          <p className="text-gray-500 mt-1">
            {winner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'} wins with {winner === 'player1' ? player1Stats.correct : player2Stats.correct} correct answers!
          </p>
        </div>

        {/* Both Players Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {renderPlayerCard(player1Stats, 'Player 1', 'blue', p1Percentage, p1Advice, winner === 'player1')}
          {renderPlayerCard(player2Stats, 'Player 2', 'red', p2Percentage, p2Advice, winner === 'player2')}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onHome}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            🏠 Home
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-blue-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoPlayerStatsOverlay;
