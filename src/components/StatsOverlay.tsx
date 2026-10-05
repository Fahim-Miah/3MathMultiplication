import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerStats, calculatePercentage, formatTime, getAdvice } from '../utils/gameUtils';

interface StatsOverlayProps {
  stats: PlayerStats;
  title: string;
  subtitle?: string;
  onPlayAgain: () => void;
  onHome: () => void;
  isWinner?: boolean;
  playerColor?: 'blue' | 'red' | 'green' | 'purple';
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({
  stats,
  title,
  subtitle,
  onPlayAgain,
  onHome,
  isWinner = false,
  playerColor = 'green',
}) => {
  const percentage = calculatePercentage(stats.correct, stats.questionsAnswered.length);
  const advice = getAdvice(stats);

  useEffect(() => {
    if (isWinner || percentage >= 70) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isWinner, percentage]);

  const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    red: 'from-red-400 to-red-600',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
  };

  const textColorMap = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transform animate-scaleIn">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">
            {isWinner ? '🏆' : percentage >= 70 ? '⭐' : percentage >= 50 ? '💪' : '🌱'}
          </div>
          <h2 className={`text-3xl font-bold bg-gradient-to-r ${colorMap[playerColor]} bg-clip-text text-transparent`}>
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200">
            <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
            <div className="text-sm text-green-700 font-medium">✅ Correct</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600">{stats.incorrect}</div>
            <div className="text-sm text-red-700 font-medium">❌ Incorrect</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
            <div className="text-3xl font-bold text-blue-600">{formatTime(stats.totalTime)}</div>
            <div className="text-sm text-blue-700 font-medium">⏱️ Time</div>
          </div>
          <div className={`bg-purple-50 rounded-2xl p-4 text-center border-2 border-purple-200`}>
            <div className={`text-3xl font-bold ${textColorMap[playerColor]}`}>{percentage}%</div>
            <div className="text-sm text-purple-700 font-medium">📊 Accuracy</div>
          </div>
        </div>

        {/* Accuracy Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
            <span>Accuracy</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${colorMap[playerColor]} transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Advice Section */}
        <div className="bg-yellow-50 rounded-2xl p-4 mb-6 border-2 border-yellow-200">
          <h3 className="font-bold text-yellow-800 mb-2 text-lg">💡 Tips to Improve:</h3>
          <ul className="space-y-2">
            {advice.map((tip, index) => (
              <li key={index} className="text-yellow-900 text-sm leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
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
            className={`flex-1 bg-gradient-to-r ${colorMap[playerColor]} text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
          >
            🔄 Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsOverlay;
