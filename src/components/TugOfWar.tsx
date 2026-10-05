import React, { useState, useEffect, useCallback, useRef } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats, Difficulty } from '../utils/gameUtils';

interface TugOfWarProps {
  onHome: () => void;
}

const TugOfWar: React.FC<TugOfWarProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>('mixed');
  const [question, setQuestion] = useState<Question>(generateQuestion('mixed'));
  const [team1Input, setTeam1Input] = useState('');
  const [team2Input, setTeam2Input] = useState('');
  const [ropePosition, setRopePosition] = useState(0); // -100 to 100, negative = team1 winning
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'team1' | 'team2' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [team1CorrectFlash, setTeam1CorrectFlash] = useState(false);
  const [team2CorrectFlash, setTeam2CorrectFlash] = useState(false);

  const [team1Stats, setTeam1Stats] = useState<PlayerStats>({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    questionsAnswered: [],
    answersGiven: [],
    correctAnswers: [],
  });

  const [team2Stats, setTeam2Stats] = useState<PlayerStats>({
    correct: 0,
    incorrect: 0,
    totalTime: 0,
    questionsAnswered: [],
    answersGiven: [],
    correctAnswers: [],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedTime(elapsed);
      
      // Check if time is up
      if (elapsed >= timeLimit) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameOver(true);
        // Determine winner based on rope position
        setWinner(ropePosition < 0 ? 'team1' : ropePosition > 0 ? 'team2' : null);
        setTimeout(() => setShowStats(true), 2000);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, startTime, timeLimit, ropePosition]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion(difficulty));
  }, [difficulty]);

  const checkAnswer = useCallback((team: 1 | 2, input: string) => {
    if (input.length === 0 || gameOver) return;
    
    const answer = parseInt(input);
    const encodedQ = question.num1 * 1000 + question.num2;
    
    if (team === 1) {
      const newStats = {
        ...team1Stats,
        questionsAnswered: [...team1Stats.questionsAnswered, encodedQ],
        answersGiven: [...team1Stats.answersGiven, answer],
        correctAnswers: [...team1Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        newStats.correct = team1Stats.correct + 1;
        setTeam1Stats(newStats);
        setTeam1Input('');
        
        // Move rope towards team1's side (negative direction)
        setRopePosition(prev => {
          const newPos = prev - 10;
          // Check if team1 wins
          if (newPos <= -100) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            setWinner('team1');
            setTimeout(() => setShowStats(true), 2000);
          }
          return Math.max(newPos, -100);
        });
        
        setTeam1CorrectFlash(true);
        setTimeout(() => setTeam1CorrectFlash(false), 1000);
        nextQuestion();
      } else {
        newStats.incorrect = team1Stats.incorrect + 1;
        setTeam1Stats(newStats);
        setTeam1Input('');
      }
    } else {
      const newStats = {
        ...team2Stats,
        questionsAnswered: [...team2Stats.questionsAnswered, encodedQ],
        answersGiven: [...team2Stats.answersGiven, answer],
        correctAnswers: [...team2Stats.correctAnswers, question.answer],
      };
      
      if (answer === question.answer) {
        newStats.correct = team2Stats.correct + 1;
        setTeam2Stats(newStats);
        setTeam2Input('');
        
        // Move rope towards team2's side (positive direction)
        setRopePosition(prev => {
          const newPos = prev + 10;
          // Check if team2 wins
          if (newPos >= 100) {
            if (timerRef.current) clearInterval(timerRef.current);
            setGameOver(true);
            setWinner('team2');
            setTimeout(() => setShowStats(true), 2000);
          }
          return Math.min(newPos, 100);
        });
        
        setTeam2CorrectFlash(true);
        setTimeout(() => setTeam2CorrectFlash(false), 1000);
        nextQuestion();
      } else {
        newStats.incorrect = team2Stats.incorrect + 1;
        setTeam2Stats(newStats);
        setTeam2Input('');
      }
    }
  }, [question, team1Stats, team2Stats, gameOver, nextQuestion]);

  const handleTeam1Digit = (digit: string) => {
    if (gameOver) return;
    setTeam1Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const handleTeam2Digit = (digit: string) => {
    if (gameOver) return;
    setTeam2Input(prev => prev.length < 4 ? prev + digit : prev);
  };

  const startGame = () => {
    setQuestion(generateQuestion(difficulty));
    setGameStarted(true);
    setStartTime(Date.now());
    setRopePosition(0);
  };

  const resetGame = () => {
    setQuestion(generateQuestion(difficulty));
    setTeam1Input('');
    setTeam2Input('');
    setRopePosition(0);
    setGameOver(false);
    setWinner(null);
    setShowStats(false);
    setGameStarted(false);
    setTeam1CorrectFlash(false);
    setTeam2CorrectFlash(false);
    setTeam1Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
    setTeam2Stats({ correct: 0, incorrect: 0, totalTime: 0, questionsAnswered: [], answersGiven: [], correctAnswers: [] });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pre-game setup screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🪢</div>
          <h2 className="text-3xl font-bold text-orange-700 mb-6">Tug of War</h2>
          
          {/* Difficulty Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">Choose difficulty:</label>
            <div className="grid grid-cols-3 gap-2">
              {(['2-digit', 'mixed', '3-digit'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                    difficulty === diff
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {diff === '2-digit' ? '2-digit' : diff === '3-digit' ? '3-digit' : 'Mixed'}
                </button>
              ))}
            </div>
          </div>

          {/* Time Limit Selection */}
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">Select time limit:</label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90, 120, 180, 300].map(seconds => (
                <button
                  key={seconds}
                  onClick={() => setTimeLimit(seconds)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                    timeLimit === seconds
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Game lasts <span className="font-bold text-orange-600">{timeLimit < 60 ? `${timeLimit} seconds` : `${timeLimit / 60} minute${timeLimit > 60 ? 's' : ''}`}</span>
            </p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-4 mb-6 border-2 border-orange-200 text-left">
            <h4 className="font-bold text-orange-700 mb-2">📋 Rules:</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Two teams compete to pull the rope to their side</li>
              <li>• Each correct answer pulls the rope towards your team</li>
              <li>• First team to pull the rope past the baseline wins!</li>
              <li>• If time runs out, the team closest to their baseline wins</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-6 rounded-xl text-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            🪢 Start Tug of War!
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

  const timeLeft = Math.max(0, timeLimit - elapsedTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onHome}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl transition-all"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-orange-700">🪢 Tug of War!</h1>
          <div className={`text-lg font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Tug of War Animation */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          {/* Baselines */}
          <div className="relative mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-blue-600 font-bold text-sm">🔵 Team 1 Baseline</div>
              <div className="text-red-600 font-bold text-sm">🔴 Team 2 Baseline</div>
            </div>
            
            {/* Rope Track */}
            <div className="relative h-20 bg-gradient-to-r from-blue-100 via-gray-100 to-red-100 rounded-full border-4 border-gray-300 overflow-hidden">
              {/* Baseline markers */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500"></div>
              
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400 -translate-x-1/2"></div>
              
              {/* Characters and Rope */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out flex items-center"
                style={{ left: `${50 + (ropePosition / 2)}%`, transform: `translate(-50%, -50%)` }}
              >
                {/* Team 1 Character */}
                <div className={`text-4xl transition-all duration-300 ${team1CorrectFlash ? 'scale-125' : ''}`}>
                  🧑
                </div>
                
                {/* Rope */}
                <div className="w-16 h-2 bg-yellow-600 rounded-full mx-2 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                </div>
                
                {/* Team 2 Character */}
                <div className={`text-4xl transition-all duration-300 ${team2CorrectFlash ? 'scale-125' : ''}`}>
                  🧑
                </div>
              </div>
            </div>

            {/* Position indicator */}
            <div className="mt-2 text-center">
              <div className="inline-block bg-gray-100 rounded-full px-4 py-1">
                <span className="font-bold text-gray-700">
                  {ropePosition === 0 ? '⚖️ Even!' : ropePosition < 0 ? `🔵 Team 1 leading by ${Math.abs(ropePosition)}%` : `🔴 Team 2 leading by ${ropePosition}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-6 text-center border-2 border-orange-300">
            <p className="text-gray-600 text-lg mb-2">Solve this to pull the rope!</p>
            <div className="text-5xl md:text-6xl font-bold text-gray-800">
              {question.num1} + {question.num2} = ?
            </div>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 text-center transform animate-bounceIn shadow-2xl">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className={`text-4xl font-bold ${winner === 'team1' ? 'text-blue-600' : winner === 'team2' ? 'text-red-600' : 'text-gray-600'}`}>
              {winner === 'team1' ? '🔵 Team 1' : winner === 'team2' ? '🔴 Team 2' : "It's a Tie!"} Wins!
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

      {/* Team Areas */}
      <div className="max-w-6xl mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team 1 - Blue */}
          <div className={`bg-blue-50 rounded-3xl p-4 border-4 shadow-lg transition-all duration-300 ${
            team1CorrectFlash ? 'border-green-400 ring-2 ring-green-300' : 'border-blue-300'
          }`}>
            <div className="text-center mb-3">
              <h3 className="text-xl font-bold text-blue-700">🔵 Team 1</h3>
              <div className="text-sm text-blue-600 mt-1">✅ {team1Stats.correct} correct</div>
            </div>
            <NumberPad
              value={team1Input}
              onDigit={handleTeam1Digit}
              onClear={() => setTeam1Input('')}
              onSubmit={() => checkAnswer(1, team1Input)}
              onDelete={() => setTeam1Input(prev => prev.slice(0, -1))}
              color="blue"
              disabled={gameOver}
            />
          </div>

          {/* Team 2 - Red */}
          <div className={`bg-red-50 rounded-3xl p-4 border-4 shadow-lg transition-all duration-300 ${
            team2CorrectFlash ? 'border-green-400 ring-2 ring-green-300' : 'border-red-300'
          }`}>
            <div className="text-center mb-3">
              <h3 className="text-xl font-bold text-red-700">🔴 Team 2</h3>
              <div className="text-sm text-red-600 mt-1">✅ {team2Stats.correct} correct</div>
            </div>
            <NumberPad
              value={team2Input}
              onDigit={handleTeam2Digit}
              onClear={() => setTeam2Input('')}
              onSubmit={() => checkAnswer(2, team2Input)}
              onDelete={() => setTeam2Input(prev => prev.slice(0, -1))}
              color="red"
              disabled={gameOver}
            />
          </div>
        </div>
      </div>

      {/* Stats Overlay - Show winner's stats */}
      {showStats && winner && (
        <StatsOverlay
          stats={winner === 'team1' ? team1Stats : team2Stats}
          title={`${winner === 'team1' ? '🔵 Team 1' : '🔴 Team 2'} Wins!`}
          subtitle="Great tug of war!"
          onPlayAgain={resetGame}
          onHome={onHome}
          isWinner={true}
          playerColor={winner === 'team1' ? 'blue' : 'red'}
        />
      )}
    </div>
  );
};

export default TugOfWar;
