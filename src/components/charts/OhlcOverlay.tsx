import { useAtomValue } from 'jotai';
import { crosshairBarAtom, crosshairMaAtom } from '../../store/chartAtoms';

export function OhlcOverlay() {
  const bar = useAtomValue(crosshairBarAtom);
  const ma = useAtomValue(crosshairMaAtom);
  if (!bar) return null;

  const basePrice = bar.prevClose ?? bar.open;
  const isUp = bar.close >= basePrice;
  const color = isUp ? 'text-red-500' : 'text-emerald-500';
  const change = bar.close - basePrice;
  const changePct = basePrice !== 0 ? (change / basePrice) * 100 : 0;
  const sign = change >= 0 ? '+' : '';

  return (
    <>
      <div className="absolute top-1 left-2 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none">
        <span className="text-muted">O</span>
        <span className={color}>{bar.open.toFixed(2)}</span>
        <span className="text-muted">H</span>
        <span className={color}>{bar.high.toFixed(2)}</span>
        <span className="text-muted">L</span>
        <span className={color}>{bar.low.toFixed(2)}</span>
        <span className="text-muted">C</span>
        <span className={color}>{bar.close.toFixed(2)}</span>
        <span className={color}>{sign}{change.toFixed(2)}</span>
        <span className={color}>{sign}{changePct.toFixed(2)}%</span>
      </div>
      {ma && (
        <div className="absolute top-1 right-14 z-10 flex items-center gap-3 text-xs font-mono pointer-events-none">
          {ma.ma5 !== null && (
            <span><span className="text-white/60">MA5</span> <span style={{ color: '#ffffff' }}>{ma.ma5.toFixed(2)}</span></span>
          )}
          {ma.ma10 !== null && (
            <span><span className="text-white/60">MA10</span> <span style={{ color: '#fbbf24' }}>{ma.ma10.toFixed(2)}</span></span>
          )}
          {ma.ma20 !== null && (
            <span><span className="text-white/60">MA20</span> <span style={{ color: '#a855f7' }}>{ma.ma20.toFixed(2)}</span></span>
          )}
        </div>
      )}
    </>
  );
}
