// 信号检测工具函数

/**
 * 检测MA均线金叉/死叉信号
 * @param maShort 短期均线值
 * @param maLong 长期均线值
 * @param prevMaShort 前一日短期均线
 * @param prevMaLong 前一日长期均线
 * @returns 信号描述或null
 */
export function detectCrossSignal(
  maShort: number | null,
  maLong: number | null,
  prevMaShort: number | null,
  prevMaLong: number | null
): string | null {
  if (!maShort || !maLong || !prevMaShort || !prevMaLong) {
    return null;
  }

  // 金叉：前一日短期 < 长期，今日短期 >= 长期
  if (prevMaShort < prevMaLong && maShort >= maLong) {
    return "金叉";
  }

  // 死叉：前一日短期 > 长期，今日短期 <= 长期
  if (prevMaShort > prevMaLong && maShort <= maLong) {
    return "死叉";
  }

  return null;
}

/**
 * 检测MACD金叉/死叉信号
 * @param dif 当前DIF值
 * @param dea 当前DEA值
 * @param prevDif 前一日DIF值
 * @param prevDea 前一日DEA值
 * @returns 信号描述
 */
export function detectMACDSignal(
  dif: number,
  dea: number,
  prevDif: number,
  prevDea: number
): string {
  // 金叉
  if (prevDif <= prevDea && dif > dea) {
    if (dif > 0 && dea > 0) {
      return "高位金叉";
    } else if (dif < 0 && dea < 0) {
      return "低位金叉";
    } else {
      return "零轴金叉";
    }
  }

  // 死叉
  if (prevDif >= prevDea && dif < dea) {
    if (dif > 0 && dea > 0) {
      return "高位死叉";
    } else if (dif < 0 && dea < 0) {
      return "低位死叉";
    } else {
      return "零轴死叉";
    }
  }

  return "";
}

/**
 * 检测KDJ金叉/死叉信号
 * @param k 当前K值
 * @param d 当前D值
 * @param prevK 前一日K值
 * @param prevD 前一日D值
 * @returns 信号描述
 */
export function detectKDJSignal(
  k: number,
  d: number,
  prevK: number,
  prevD: number
): string {
  let signal = "";

  // 金叉
  if (prevK <= prevD && k > d) {
    if (k < 20) {
      signal = "低位金叉";
    } else if (k > 80) {
      signal = "高位金叉";
    } else {
      signal = "金叉";
    }
  }

  // 死叉
  if (prevK >= prevD && k < d) {
    if (k > 80) {
      signal = "高位死叉";
    } else if (k < 20) {
      signal = "低位死叉";
    } else {
      signal = "死叉";
    }
  }

  // 超买超卖状态
  if (!signal) {
    if (k > 80 && d > 80) {
      signal = "超买";
    } else if (k < 20 && d < 20) {
      signal = "超卖";
    }
  }

  return signal;
}

/**
 * 格式化成交量
 */
export function formatVolume(volume: number): string {
  if (volume >= 100000000) {
    return (volume / 100000000).toFixed(2) + '亿';
  } else if (volume >= 10000) {
    return (volume / 10000).toFixed(2) + '万';
  }
  return volume.toString();
}

/**
 * 格式化价格变动
 */
export function formatChange(close: number, open: number): string {
  const change = ((close - open) / open) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
