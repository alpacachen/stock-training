import { useAtom, type PrimitiveAtom } from 'jotai';
import { activeIndicatorAtom } from '../store/trainingAtoms';
import type { IndicatorType } from '../types';

const OPTIONS: { value: IndicatorType; label: string }[] = [
  { value: 'volume', label: '量能柱' },
  { value: 'macd', label: 'MACD' },
  { value: 'rsi', label: 'RSI' },
  { value: 'boll', label: 'BOLL' },
  { value: 'kdj', label: 'KDJ' },
];

interface IndicatorTabsProps {
  indicatorAtom?: PrimitiveAtom<IndicatorType>;
}

export function IndicatorTabs({ indicatorAtom = activeIndicatorAtom }: IndicatorTabsProps) {
  const [active, setActive] = useAtom(indicatorAtom);

  return (
    <select
      value={active}
      onChange={(e) => setActive(e.target.value as IndicatorType)}
      className="bg-white/5 text-xs text-white border border-white/10 rounded px-2 py-1 outline-none cursor-pointer hover:bg-white/10 transition-colors"
    >
      {OPTIONS.map(({ value, label }) => (
        <option key={value} value={value} className="bg-gray-900 text-white">
          {label}
        </option>
      ))}
    </select>
  );
}
