export interface Question {
  num1: number;
  num2: number;
  answer: number;
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

export function generateQuestion(): Question {
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  return { num1, num2, answer: num1 * num2 };
}

export function generateMultipleChoice(correctAnswer: number): number[] {
  const choices = new Set<number>([correctAnswer]);
  while (choices.size < 4) {
    const offset = Math.floor(Math.random() * 20) - 10;
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
    advice.push("🌟 Amazing work! You're a multiplication master!");
    advice.push("🚀 Try harder numbers or challenge a friend!");
  } else if (percentage >= 70) {
    advice.push("👏 Great job! You're getting really good!");
    advice.push("📝 Practice the 7s and 8s times tables a bit more.");
  } else if (percentage >= 50) {
    advice.push("💪 Good effort! Keep practicing!");
    advice.push("🎯 Focus on the times tables you got wrong.");
    advice.push("💡 Try counting by that number to help remember!");
  } else {
    advice.push("🌱 Don't give up! Practice makes perfect!");
    advice.push("📚 Try practicing smaller numbers first (1s, 2s, 5s, 10s).");
    advice.push("🎵 Sing multiplication songs to help remember!");
    advice.push("✏️ Draw groups of objects to visualize multiplication.");
  }

  const tableMistakes: Record<number, number> = {};
  for (let i = 0; i < stats.questionsAnswered.length; i++) {
    if (stats.answersGiven[i] !== stats.correctAnswers[i]) {
      const q = stats.questionsAnswered[i];
      const num1 = Math.floor(q / 10);
      const num2 = q % 10;
      tableMistakes[num1] = (tableMistakes[num1] || 0) + 1;
      tableMistakes[num2] = (tableMistakes[num2] || 0) + 1;
    }
  }

  const sortedMistakes = Object.entries(tableMistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  if (sortedMistakes.length > 0) {
    const tables = sortedMistakes.map(([num]) => `${num}'s`).join(' and ');
    advice.push(`🔢 Focus extra practice on the ${tables} times tables!`);
  }

  return advice;
}

export type GameMode = 'landing' | 'two-player' | 'one-player' | 'lightning' | 'infinity' | 'tug-of-war';
