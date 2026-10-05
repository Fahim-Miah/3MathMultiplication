import React, { useState, useEffect, useCallback } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats } from '../utils/gameUtils';

interface TwoPlayerGameProps {
  onHome: () => void;
}

const TwoPlayerGame: React.FC<TwoPlayerGameProps> = ({ onHome }) => {
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [player1Input, setPlayer1Input] = useState('');
  const [player2Input, setPlayer2Input] = useState('');
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player1' | 'player2' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const [player1Stats, setPlayer1Stats] = useState<PlayerStats>({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    questionsAnswered: [],
    answersGiven: [],
    correctAnswers: [],
  });

  const [player2Stats, setPlayer2Stats] = useState<PlayerStats>({
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

  const checkAnswer = useCallback((player: 1 | 2, input: string) => {
    const answer = parseInt(input);
    const encodedQ = question.num1 * 10 + question.num2;
    
    if (player === 1) {
      const newStats = {
        ...player1Stats,
        questionsAnswered: [...player1Stats.questionsAnswered, encodedQ],
        answersGiven: [...player1Stats.answersGiven, answer],
        correctAnswers: [...player1Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        const newScore = player1Score + 1;
        newStats.correct = player1Stats.correct + 1;
        setPlayer1Score(newScore);
        setPlayer1Stats(newStats);
        
        if (newScore >= 10) {
          newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
          setPlayer1Stats(newStats);
          setGameOver(true);
          setWinner('player1');
          setTimeout(() => setShowStats(true), 2000);
          return;
        }
      } else {
        newStats.incorrect = player1Stats.incorrect + 1;
        setPlayer1Stats(newStats);
      }
      setPlayer1Input('');
    } else {
      const newStats = {
        ...player2Stats,
        questionsAnswered: [...player2Stats.questionsAnswered, encodedQ],
        answersGiven: [...player2Stats.answersGiven, answer],
        correctAnswers: [...player2Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        const newScore = player2Score + 1;
        newStats.correct = player2Stats.correct + 1;
        setPlayer2Score(newScore);
        setPlayer2Stats(newStats);
        
        if (newScore >= 10) {
          newStats.totalTime = Math.floor((Date.now() - startTime) / 1000);
          setPlayer2Stats(newStats);
          setGameOver(true);
          setWinner('player2');
          setTimeout(() => setShowStats(true), 2000);
          return;
        }
      } else {
        newStats.incorrect = player2Stats.incorrect + 1;
        setPlayer2Stats(newStats);
      }
      setPlayer2Input('');
    }
    nextQuestion();
  }, [question, player1Score, player2Score, player1Stats, player2Stats, startTime, nextQuestion]);

  const handlePlayer1Digit = (digit: string) => {
    if (gameOver) return;
    setPlayer1Input(prev => prev.length < 3 ? prev + digit : prev);
  };

  const handlePlayer2Digit = (digit: string) => {
    if (gameOver) return;
    setPlayer2Input(prev => prev.length < 3 ? prev + digit : prev);
  };

  const resetGame = () => {
    setQuestion(generateQuestion());
    setPlayer1Input('');
    setPlayer2Input('');
    setPlayer1Score(0);
    setPlayer2Score(0);
    setGameOver(false);
    setWinner(null);
    setShowStats(false);
    setPlayer1Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
    setPlayer2Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-red-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-purple-700">⚔️ Two Player Battle!</h1>
          <div className="text-lg font-bold text-gray-600">⏱️ {formatTime(elapsedTime)}</div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex items-center justify-center gap-4 bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex-1 text-center">
            <span className="text-blue-600 font-bold text-lg">🔵 Player 1</span>
            <div className="text-3xl font-bold text-blue-700">{player1Score}/10</div>
          </div>
          <div className="text-4xl font-bold text-gray-300">VS</div>
          <div className="flex-1 text-center">
            <span className="text-red-600 font-bold text-lg">🔴 Player 2</span>
            <div className="text-3xl font-bold text-red-700">{player2Score}/10</div>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 text-center transform animate-bounceIn shadow-2xl">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className={`text-4xl font-bold ${winner === 'player1' ? 'text-blue-600' : 'text-red-600'}`}>
              {winner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'} Wins!
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

      {/* Question Display */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
          <p className="text-gray-500 text-lg mb-2">Solve this:</p>
          <div className="text-6xl font-bold text-gray-800">
            {question.num1} × {question.num2} = ?
          </div>
        </div>
      </div>

      {/* Player Areas */}
      <div className="max-w-6xl mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Player 1 - Blue */}
          <div className="bg-blue-50 rounded-3xl p-4 border-4 border-blue-300 shadow-lg">
            <h3 className="text-center text-xl font-bold text-blue-700 mb-3">🔵 Player 1</h3>
            <NumberPad
              value={player1Input}
              onDigit={handlePlayer1Digit}
              onClear={() => setPlayer1Input('')}
              onSubmit={() => checkAnswer(1, player1Input)}
              onDelete={() => setPlayer1Input(prev => prev.slice(0, -1))}
              color="blue"
              disabled={gameOver}
            />
          </div>

          {/* Player 2 - Red */}
          <div className="bg-red-50 rounded-3xl p-4 border-4 border-red-300 shadow-lg">
            <h3 className="text-center text-xl font-bold text-red-700 mb-3">🔴 Player 2</h3>
            <NumberPad
              value={player2Input}
              onDigit={handlePlayer2Digit}
              onClear={() => setPlayer2Input('')}
              onSubmit={() => checkAnswer(2, player2Input)}
              onDelete={() => setPlayer2Input(prev => prev.slice(0, -1))}
              color="red"
              disabled={gameOver}
            />
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && winner && (
        <StatsOverlay
          stats={winner === 'player1' ? player1Stats : player2Stats}
          title={`${winner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'} Wins!`}
          subtitle="Congratulations, champion!"
          onPlayAgain={resetGame}
          onHome={onHome}
          isWinner={true}
          playerColor={winner === 'player1' ? 'blue' : 'red'}
        />
      )}
    </div>
  );
};

export default TwoPlayerGame;
