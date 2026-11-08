// Advanced Multi-Functional In-Line Math Evaluator for CashFlow
// Supports:
// 1. Addition (+), Subtraction (-), Multiplication (*, x, ×), Division (/, ÷)
// 2. Parentheses / Brackets ( ( ) )
// 3. Percentages (%) e.g. 1000 - 10%, 500 + 15%, 200 * 5%
// 4. Bengali Numerals (০-৯) to Standard (0-9)
// 5. Decimals and floating point precision

const BENGALI_DIGITS = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

export const normalizeBengaliNumbers = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[০-৯]/g, (d) => BENGALI_DIGITS[d] || d);
};

export const evaluateMathExpression = (rawExpr) => {
  if (!rawExpr || typeof rawExpr !== 'string') return null;

  // 1. Convert Bengali numerals (০-৯) to standard (0-9)
  let expr = normalizeBengaliNumbers(rawExpr.trim());
  if (!expr) return null;

  // If already just a clean simple number
  if (/^-?\d+(\.\d+)?$/.test(expr)) {
    return parseFloat(expr);
  }

  // 2. Normalize friendly multiplication & division symbols
  // 'x', 'X', '×' -> '*'
  // '÷' -> '/'
  expr = expr
    .replace(/[xX×]/g, '*')
    .replace(/[÷]/g, '/');

  // 3. Handle Percentage logic:
  // A) "A - B%" => "A - (A * B / 100)"
  // B) "A + B%" => "A + (A * B / 100)"
  // C) "A * B%" => "A * (B / 100)"
  // D) "B%" => "(B / 100)"
  expr = expr.replace(/(\d+(\.\d+)?)\s*([\+\-])\s*(\d+(\.\d+)?)%/g, '($1 $3 ($1 * ($4 / 100)))');
  expr = expr.replace(/(\d+(\.\d+)?)\s*([\*\/])\s*(\d+(\.\d+)?)%/g, '($1 $3 ($4 / 100))');
  expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1 / 100)');

  // 4. Validate allowed characters: 0-9, ., +, -, *, /, (, ), whitespace
  if (!/^[\d\s\.\+\-\*\/\(\)]+$/.test(expr)) {
    return null;
  }

  try {
    // Check for balanced parentheses
    let openCount = 0;
    for (let char of expr) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
      if (openCount < 0) return null;
    }
    // Auto-close open trailing parentheses for typing comfort
    while (openCount > 0) {
      expr += ')';
      openCount--;
    }

    // Evaluate safely using Function constructor inside strict mode
    const sanitized = expr.replace(/[^0-9\.\+\-\*\/\(\)\s]/g, '');
    const result = new Function(`'use strict'; return (${sanitized});`)();

    if (typeof result === 'number' && isFinite(result) && !isNaN(result)) {
      // Round to 2 decimal places if needed
      return Math.round(result * 100) / 100;
    }
    return null;
  } catch (e) {
    return null;
  }
};
