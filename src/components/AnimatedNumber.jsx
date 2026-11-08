import React, { useEffect, useState, useRef } from 'react';

const AnimatedNumber = ({ value, duration = 850, prefix = '', suffix = '', className = '' }) => {
  const numValue = typeof value === 'number' ? value : Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(numValue);
  const startValRef = useRef(0);
  const isFirstMount = useRef(true);

  useEffect(() => {
    const initial = isFirstMount.current ? 0 : startValRef.current;
    isFirstMount.current = false;
    const diff = numValue - initial;

    if (diff === 0) {
      setDisplayValue(numValue);
      startValRef.current = numValue;
      return;
    }

    let startTimestamp = null;
    let animId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth cubic-bezier easeOutQuint
      const ease = 1 - Math.pow(1 - progress, 5);
      const current = Math.round(initial + diff * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numValue);
        startValRef.current = numValue;
      }
    };

    animId = window.requestAnimationFrame(step);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, [numValue, duration]);

  return (
    <span className={`inline-block font-mono tabular-nums ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedNumber;

