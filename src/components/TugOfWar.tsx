import React, { useState, useEffect, useCallback, useRef } from 'react';
import NumberPad from './NumberPad';
import StatsOverlay from './StatsOverlay';
import { generateQuestion, Question, PlayerStats } from '../utils/gameUtils';

interface TugOfWarProps {
  onHome: () => void;
}

const TugOfWar: React.FC<TugOfWarProps> = ({ onHome }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [team1Input, setTeam1Input] = useState('');
  const [team2Input, setTeam2Input] = useState('');
  const [ropePosition, setRopePosition] = useState(0);
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
      
      if (elapsed >= timeLimit) {
        if (timerRef.current) clearInterval(timerRef.current);
        setGameOver(true);
        setWinner(ropePosition < 0 ? 'team1' : ropePosition > 0 ? 'team2' : null);
        setTimeout(() => setShowStats(true), 2000);
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, startTime, timeLimit, ropePosition]);

  const nextQuestion = useCallback(() => {
    setQuestion(generateQuestion());
  }, []);

  const checkAnswer = useCallback((team: 1 | 2, input: string) => {
    if (input.length === 0 || gameOver) return;
    
    const answer = parseInt(input);
    const encodedQ = question.num1 * 10 + question.num2;
    
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
        
        setRopePosition(prev => {
          const newPos = prev - 10;
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
        
        setRopePosition(prev => {
          const newPos = prev + 10;
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
    setTeam1Input(prev => prev.length < 3 ? prev + digit : prev);
  };

  const handleTeam2Digit = (digit: string) => {
    if (gameOver) return;
    setTeam2Input(prev => prev.length < 3 ? prev + digit : prev);
  };

  const startGame = () => {
    setQuestion(generateQuestion());
    setGameStarted(true);
    setStartTime(Date.now());
    setRopePosition(0);
  };

  const resetGame = () => {
    setQuestion(generateQuestion());
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

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🪢</div>
          <h2 className="text-3xl font-bold text-orange-700 mb-6">Tug of War</h2>

          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-3 text-lg">Select time limit:</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5, 7, 10, 15].map(minutes => (
                <button
                  key={minutes}
                  onClick={() => setTimeLimit(minutes * 60)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                    timeLimit === minutes * 60
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-3">
              Game lasts <span className="font-bold text-orange-600">{timeLimit / 60} minute{timeLimit / 60 > 1 ? 's' : ''}</span>
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

      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="relative mb-6">
            <div className="flex justify-between items-center mb-3">
              <div className="text-blue-600 font-bold text-lg">🔵 Team 1 Baseline</div>
              <div className="text-red-600 font-bold text-lg">🔴 Team 2 Baseline</div>
            </div>
            
            {/* Big Tug of War Arena */}
            <div className="relative h-48 bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 rounded-3xl border-8 border-yellow-400 overflow-hidden shadow-inner">
              {/* Grass at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-400 to-green-300"></div>
              
              {/* Baseline markers */}
              <div className="absolute left-4 top-0 bottom-0 w-2 bg-blue-500 rounded-full shadow-lg"></div>
              <div className="absolute right-4 top-0 bottom-0 w-2 bg-red-500 rounded-full shadow-lg"></div>
              
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 -translate-x-1/2 opacity-50"></div>
              
              {/* Sun */}
              <div className="absolute top-4 right-8 text-5xl animate-pulse">☀️</div>
              
              {/* Clouds */}
              <div className="absolute top-6 left-12 text-3xl opacity-70">☁️</div>
              <div className="absolute top-10 left-1/3 text-2xl opacity-60">☁️</div>
              
              {/* Characters and Rope - Much Bigger! */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out flex items-center gap-4"
                style={{ left: `${50 + (ropePosition / 2.5)}%`, transform: `translate(-50%, -50%)` }}
              >
                {/* Team 1 Character - Big and Animated */}
                <div className={`text-8xl transition-all duration-300 ${
                  team1CorrectFlash ? 'scale-150 rotate-12 animate-bounce' : 'animate-pulse'
                }`}>
                  🦸
                </div>
                
                {/* Rope - Thicker and More Visible */}
                <div className="relative">
                  <div className="w-32 h-4 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 rounded-full shadow-lg border-2 border-yellow-800"></div>
                  {/* Rope texture */}
                  <div className="absolute top-0 left-0 right-0 h-full flex items-center justify-around">
                    <div className="w-1 h-3 bg-yellow-900 rounded"></div>
                    <div className="w-1 h-3 bg-yellow-900 rounded"></div>
                    <div className="w-1 h-3 bg-yellow-900 rounded"></div>
                    <div className="w-1 h-3 bg-yellow-900 rounded"></div>
                  </div>
                  {/* Center marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
                </div>
                
                {/* Team 2 Character - Big and Animated */}
                <div className={`text-8xl transition-all duration-300 ${
                  team2CorrectFlash ? 'scale-150 -rotate-12 animate-bounce' : 'animate-pulse'
                }`}>
                  🦸‍♀️
                </div>
              </div>
              
              {/* Effort particles when answering correctly */}
              {team1CorrectFlash && (
                <div className="absolute left-1/4 top-1/3 text-4xl animate-ping">💪</div>
              )}
              {team2CorrectFlash && (
                <div className="absolute right-1/4 top-1/3 text-4xl animate-ping">💪</div>
              )}
            </div>

            {/* Position indicator - Bigger and More Colorful */}
            <div className="mt-4 text-center">
              <div className={`inline-block rounded-full px-6 py-3 shadow-lg text-xl font-bold ${
                ropePosition === 0 
                  ? 'bg-gray-200 text-gray-700' 
                  : ropePosition < 0 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-red-500 text-white animate-pulse'
              }`}>
                {ropePosition === 0 
                  ? '⚖️ Perfectly Even!' 
                  : ropePosition < 0 
                    ? `🔵 Team 1 is winning! (${Math.abs(ropePosition)}%)` 
                    : `🔴 Team 2 is winning! (${ropePosition}%)`
                }
              </div>
            </div>
          </div>

          {/* Question Display - Bigger and More Exciting */}
          <div className="bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-200 rounded-3xl p-8 text-center border-4 border-orange-400 shadow-xl">
            <p className="text-orange-700 text-2xl font-bold mb-3 animate-bounce">🎯 Solve this to pull the rope! 🎯</p>
            <div className="text-6xl md:text-7xl font-bold text-gray-800 bg-white rounded-2xl py-6 shadow-inner">
              {question.num1} × {question.num2} = ?
            </div>
          </div>
        </div>
      </div>

      {gameOver && !showStats && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 text-center transform animate-bounceIn shadow-2xl">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className={`text-4xl font-bold ${winner === 'team1' ? 'text-blue-600' : winner === 'team2' ? 'text-red-600' : 'text-gray-600'}`}>
              {winner === 'team1' ? '🔵 Team 1' : winner === 'team2' ? '🔴 Team 2' : "It's a Tie!"} {winner ? 'Wins!' : ''}
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Loading stats...</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
