import React from 'react';

interface NumberPadProps {
  value: string;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  color: 'blue' | 'red' | 'green' | 'purple';
  disabled?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    border: 'border-blue-600',
    text: 'text-blue-700',
    light: 'bg-blue-100',
    submit: 'bg-blue-600 hover:bg-blue-700',
  },
  red: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    border: 'border-red-600',
    text: 'text-red-700',
    light: 'bg-red-100',
    submit: 'bg-red-600 hover:bg-red-700',
  },
  green: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    border: 'border-green-600',
    text: 'text-green-700',
    light: 'bg-green-100',
    submit: 'bg-green-600 hover:bg-green-700',
  },
  purple: {
    bg: 'bg-purple-500',
    hover: 'hover:bg-purple-600',
    border: 'border-purple-600',
    text: 'text-purple-700',
    light: 'bg-purple-100',
    submit: 'bg-purple-600 hover:bg-purple-700',
  },
};

const NumberPad: React.FC<NumberPadProps> = ({
  value,
  onDigit,
  onClear,
  onSubmit,
  onDelete,
  color,
  disabled = false,
}) => {
  const colors = colorClasses[color];
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className={`p-4 rounded-2xl ${colors.light} border-4 ${colors.border} shadow-lg`}>
      {/* Display */}
      <div className={`mb-4 p-4 bg-white rounded-xl text-center text-3xl font-bold ${colors.text} min-h-[60px] flex items-center justify-center border-2 ${colors.border}`}>
        {value || <span className="text-gray-300">?</span>}
      </div>
      
      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {digits.map((digit) => (
          <button
            key={digit}
            onClick={() => onDigit(digit)}
            disabled={disabled}
            className={`${colors.bg} ${colors.hover} text-white font-bold text-xl py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
          >
            {digit}
          </button>
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onClear}
          disabled={disabled}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
        >
          Clear
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
        >
          ⌫
        </button>
        <button
          onClick={onSubmit}
          disabled={disabled || value.length === 0}
          className={`${colors.submit} text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
        >
          ✓
        </button>
      </div>
    </div>
  );
};

export default NumberPad;
