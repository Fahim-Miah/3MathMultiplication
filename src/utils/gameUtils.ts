export interface Question {
  num1: number;
  num2: number;
  answer: number;
  type: '2-digit' | '3-digit';
}

export interface PlayerStats {
  correct: number;
  incorrect: number;
  totalTime: number;
  questionsAnswered: number[];
  answersGiven: number[];
  correctAnswers: number[];
}

export interface GameResult {
  player1?: PlayerStats;
  player2?: PlayerStats;
  singlePlayer?: PlayerStats;
  winner?: 'player1' | 'player2' | 'single' | null;
}

export type Difficulty = '2-digit' | '3-digit' | 'mixed';

export function generateQuestion(difficulty: Difficulty = 'mixed'): Question {
  let num1: number;
  let num2: number;
  let type: '2-digit' | '3-digit';

  if (difficulty === '2-digit') {
    num1 = Math.floor(Math.random() * 90) + 10; // 10-99
    num2 = Math.floor(Math.random() * 90) + 10; // 10-99
    type = '2-digit';
  } else if (difficulty === '3-digit') {
    num1 = Math.floor(Math.random() * 900) + 100; // 100-999
    num2 = Math.floor(Math.random() * 900) + 100; // 100-999
    type = '3-digit';
  } else {
    // Mixed: 50% chance of each
    if (Math.random() < 0.5) {
      num1 = Math.floor(Math.random() * 90) + 10;
      num2 = Math.floor(Math.random() * 90) + 10;
      type = '2-digit';
    } else {
      num1 = Math.floor(Math.random() * 900) + 100;
      num2 = Math.floor(Math.random() * 900) + 100;
      type = '3-digit';
    }
  }

  return { num1, num2, answer: num1 + num2, type };
}

export function generateMultipleChoice(correctAnswer: number): number[] {
  const choices = new Set<number>([correctAnswer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 40) - 20;
    const wrong = correctAnswer + offset;
    if (wrong > 0 && wrong !== correctAnswer) {
      choices.add(wrong);
    }
  }
  return Array.from(choices).sort(() => Math.random() - 0.5);
}

export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getAdvice(stats: PlayerStats): string[] {
  const advice: string[] = [];
  const percentage = calculatePercentage(stats.correct, stats.questionsAnswered.length);

  if (percentage >= 90) {
    advice.push("🌟 Amazing work! You're an addition master!");
    advice.push("🚀 Try 3-digit numbers or challenge a friend!");
  } else if (percentage >= 70) {
    advice.push("👏 Great job! You're getting really good!");
    advice.push("📝 Practice carrying over when digits add up to 10 or more.");
  } else if (percentage >= 50) {
    advice.push("💪 Good effort! Keep practicing!");
    advice.push("🎯 Line up your numbers carefully (ones under ones, tens under tens).");
    advice.push("💡 Remember to carry the 1 when a column adds up to 10 or more!");
  } else {
    advice.push("🌱 Don't give up! Practice makes perfect!");
    advice.push("📚 Start with 2-digit numbers before trying 3-digit.");
    advice.push("✏️ Write the numbers down and add column by column.");
    advice.push("🔢 Check your work by adding the columns again!");
  }

  // Check if they struggle more with 3-digit
  const twoDigitCorrect = [];
  const threeDigitCorrect = [];
  
  for (let i = 0; i < stats.questionsAnswered.length; i++) {
    const q = stats.questionsAnswered[i];
    const num1 = Math.floor(q / 1000);
    const num2 = q % 1000;
    const isThreeDigit = num1 >= 100 || num2 >= 100;
    
    if (stats.answersGiven[i] === stats.correctAnswers[i]) {
      if (isThreeDigit) {
        threeDigitCorrect.push(true);
      } else {
        twoDigitCorrect.push(true);
      }
    } else {
      if (isThreeDigit) {
        threeDigitCorrect.push(false);
      } else {
        twoDigitCorrect.push(false);
      }
    }
  }

  const twoDigitPct = twoDigitCorrect.length > 0 
    ? calculatePercentage(twoDigitCorrect.filter(x => x).length, twoDigitCorrect.length)
    : 100;
  const threeDigitPct = threeDigitCorrect.length > 0
    ? calculatePercentage(threeDigitCorrect.filter(x => x).length, threeDigitCorrect.length)
    : 100;

  if (threeDigitPct < twoDigitPct - 20 && threeDigitCorrect.length >= 2) {
    advice.push("🔢 You're better at 2-digit addition! Practice 3-digit more!");
  } else if (twoDigitPct < threeDigitPct - 20 && twoDigitCorrect.length >= 2) {
    advice.push("🔢 You're better at 3-digit addition! Review 2-digit basics!");
  }

  return advice;
}

export type GameMode = 'landing' | 'two-player' | 'one-player' | 'lightning' | 'infinity' | 'tug-of-war';
