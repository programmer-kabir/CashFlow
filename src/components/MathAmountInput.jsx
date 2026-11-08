import React, { useState, useEffect } from 'react';
import { evaluateMathExpression } from '../utils/mathParser';
import { Calculator, Check, Delete, Sparkles } from 'lucide-react';

const MathAmountInput = ({
  value,
  onChange,
  placeholder = '0',
  autoFocus = false,
  required = true,
  className = '',
  accentColor = 'emerald' // 'emerald' | 'rose' | 'indigo' | 'amber'
}) => {
  const [internalText, setInternalText] = useState(value ? value.toString() : '');
  const [mathPreview, setMathPreview] = useState(null);
  const [showKeypad, setShowKeypad] = useState(false);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setInternalText(value.toString());
    }
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setInternalText(raw);

    // Check if it has operators: +, -, *, /, x, X, ×, ÷, %
    if (/[+\-*\/xX×÷%]/.test(raw)) {
      const res = evaluateMathExpression(raw);
      setMathPreview(res);
    } else {
      setMathPreview(null);
      onChange && onChange(raw);
    }
  };

  const handleApplyResult = () => {
    if (mathPreview !== null) {
      const formatted = mathPreview.toString();
      setInternalText(formatted);
      onChange && onChange(formatted);
      setMathPreview(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mathPreview !== null) {
        e.preventDefault(); // Don't submit parent form yet, evaluate first!
        handleApplyResult();
      }
    }
  };

  const handleBlur = () => {
    if (mathPreview !== null) {
      handleApplyResult();
    }
  };

  // Quick math button click helper
  const handleAppendSymbol = (sym) => {
    if (sym === 'C') {
      setInternalText('');
      setMathPreview(null);
      onChange && onChange('');
      return;
    }

    if (sym === '=') {
      handleApplyResult();
      return;
    }

    // Quick add numbers like "+100", "+500"
    if (sym.startsWith('+') && !isNaN(Number(sym.slice(1)))) {
      const toAdd = Number(sym.slice(1));
      const currentVal = evaluateMathExpression(internalText) || 0;
      const nextVal = (currentVal + toAdd).toString();
      setInternalText(nextVal);
      setMathPreview(null);
      onChange && onChange(nextVal);
      return;
    }

    const next = internalText + sym;
    setInternalText(next);
    const res = evaluateMathExpression(next);
    setMathPreview(res);
  };

  const ringClasses = {
    emerald: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    rose: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-600 dark:text-rose-400',
    indigo: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    amber: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-amber-600 dark:text-amber-400'
  };

  return (
    <div className="space-y-2">
      {/* Input container */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 select-none">
          ৳
        </span>

        <input
          type="text"
          inputMode="decimal"
          required={required}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={internalText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] rounded-2xl text-2xl font-bold font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-all shadow-2xs ${className} ${ringClasses[accentColor] || ringClasses.emerald}`}
        />

        {/* Toggle Calculator Keypad Button inside input */}
        <button
          type="button"
          onClick={() => setShowKeypad(!showKeypad)}
          title="ক্যালকুলেটর কিপ্যাড অন/অফ করুন"
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
            showKeypad 
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.06]'
          }`}
        >
          <Calculator className="w-5 h-5" />
        </button>
      </div>

      {/* Live Evaluated Result Banner */}
      {mathPreview !== null && (
        <div
          onClick={handleApplyResult}
          className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all animate-fadeIn shadow-xs"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>🧮 মোট হিসাব: ৳{mathPreview.toLocaleString()}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
            <Check className="w-3 h-3 stroke-[3]" /> সেট করুন (Enter)
          </span>
        </div>
      )}

      {/* Interactive Multi-Functional Math Keypad (Collapsible or Quick Access) */}
      {showKeypad && (
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.07] space-y-2 animate-fadeIn shadow-inner">
          {/* Quick Increment Pills */}
          <div className="flex items-center justify-between gap-1.5 text-xs font-bold">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">দ্রুত যোগ:</span>
            <div className="flex items-center gap-1">
              {['+50', '+100', '+500', '+1000'].map(pill => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => handleAppendSymbol(pill)}
                  className="px-2 py-1 rounded-lg bg-white dark:bg-white/[0.08] hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-white/[0.08] text-[11px] font-mono font-bold transition-all cursor-pointer shadow-2xs"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Math Operators Row */}
          <div className="grid grid-cols-7 gap-1 pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
            {[
              { label: '+', sym: ' + ' },
              { label: '-', sym: ' - ' },
              { label: '×', sym: ' * ' },
              { label: '÷', sym: ' / ' },
              { label: '%', sym: '%' },
              { label: '( )', sym: '()' },
              { label: 'C', sym: 'C', color: 'text-rose-500' }
            ].map(op => (
              <button
                key={op.label}
                type="button"
                onClick={() => handleAppendSymbol(op.sym)}
                className={`py-1.5 rounded-xl bg-white dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.12] border border-slate-200/80 dark:border-white/[0.08] text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shadow-2xs ${op.color || ''}`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathAmountInput;

