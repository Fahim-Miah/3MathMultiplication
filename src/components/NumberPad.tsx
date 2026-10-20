import React, { useEffect, useCallback, useRef } from 'react';

interface NumberPadProps {
  value: string;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  color: 'blue' | 'red' | 'green' | 'purple';
  disabled?: boolean;
  enableKeyboard?: boolean;
}

const colorClasses = {
  blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-600', text: 'text-blue-700', light: 'bg-blue-100', submit: 'bg-blue-600 hover:bg-blue-700' },
  red: { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-600', text: 'text-red-700', light: 'bg-red-100', submit: 'bg-red-600 hover:bg-red-700' },
  green: { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-600', text: 'text-green-700', light: 'bg-green-100', submit: 'bg-green-600 hover:bg-green-700' },
  purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-600', text: 'text-purple-700', light: 'bg-purple-100', submit: 'bg-purple-600 hover:bg-purple-700' },
};

const NumberPad: React.FC<NumberPadProps> = ({ value, onDigit, onClear, onSubmit, onDelete, color, disabled = false, enableKeyboard = false }) => {
  const colors = colorClasses[color];
  const topDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  // Track last touch time to prevent double-firing on touch devices
  const lastTouchTimeRef = useRef(0);

  useEffect(() => {
    if (!enableKeyboard || disabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') onDigit(e.key);
      else if (e.key === 'Enter') onSubmit();
      else if (e.key === 'Backspace') onDelete();
      else if (e.key === 'Escape' || e.key === 'Delete') onClear();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboard, disabled, onDigit, onSubmit, onDelete, onClear]);

  // Unified handler that prevents double-firing on touch devices
  const handleAction = useCallback((action: () => void) => {
    if (disabled) return;
    action();
  }, [disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent, action: () => void) => {
    if (disabled) return;
    e.preventDefault(); // Prevents the subsequent click event
    lastTouchTimeRef.current = Date.now();
    action();
  }, [disabled]);

  const handleClick = useCallback((e: React.MouseEvent, action: () => void) => {
    if (disabled) return;
    // If a touch just happened (within 500ms), ignore this click to prevent double-firing
    if (Date.now() - lastTouchTimeRef.current < 500) {
      e.preventDefault();
      return;
    }
    action();
  }, [disabled]);

  const touchStyles: React.CSSProperties = { 
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  };

  return (
    <div className={`p-4 rounded-2xl ${colors.light} border-4 ${colors.border} shadow-lg`} style={{ touchAction: 'manipulation' }}>
      {/* Display */}
      <div className={`mb-4 p-4 bg-white rounded-xl text-center text-3xl font-bold ${colors.text} min-h-[60px] flex items-center justify-center border-2 ${colors.border}`}>
        {value || <span className="text-gray-300">?</span>}
      </div>
      
      {/* Number Grid */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {topDigits.map((digit) => (
          <button
            key={digit}
            onTouchStart={(e) => handleTouchStart(e, () => onDigit(digit))}
            onClick={(e) => handleClick(e, () => onDigit(digit))}
            disabled={disabled}
            className={`${colors.bg} ${colors.hover} text-white font-bold text-xl py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-btn`}
            style={touchStyles}
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Bottom row - Centered zero */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onTouchStart={(e) => handleTouchStart(e, onClear)}
          onClick={(e) => handleClick(e, onClear)}
          disabled={disabled}
          className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md touch-btn"
          style={touchStyles}
        >
          Clear
        </button>
        <button
          onTouchStart={(e) => handleTouchStart(e, () => onDigit('0'))}
          onClick={(e) => handleClick(e, () => onDigit('0'))}
          disabled={disabled}
          className={`${colors.bg} ${colors.hover} text-white font-bold text-xl py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-btn`}
          style={touchStyles}
        >
          0
        </button>
        <button
          onTouchStart={(e) => handleTouchStart(e, onDelete)}
          onClick={(e) => handleClick(e, onDelete)}
          disabled={disabled}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md touch-btn"
          style={touchStyles}
        >
          ⌫
        </button>
      </div>
      
      {/* Submit Button */}
      <button
        onTouchStart={(e) => handleTouchStart(e, onSubmit)}
        onClick={(e) => handleClick(e, onSubmit)}
        disabled={disabled || value.length === 0}
        className={`w-full ${colors.submit} text-white font-bold py-3 rounded-xl transition-all duration-150 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-lg touch-btn`}
        style={touchStyles}
      >
        ✓ Submit
      </button>

      {enableKeyboard && <p className="text-center text-xs text-gray-400 mt-2">⌨️ You can also use your keyboard!</p>}
    </div>
  );
};

export default NumberPad;
