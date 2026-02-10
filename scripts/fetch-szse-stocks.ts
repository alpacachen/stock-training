import axios from 'axios';
import iconv from 'iconv-lite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface StockData {
  code: string;
  name: string;
  fullName: string;
  listDate: string;
  status: string;
  type: string;
}

interface SZSEStocksOutput {
  total: number;
  updatedAt: string;
  source: string;
  stats: Record<string, number>;
  stocks: StockData[];
}

async function fetchSZSEStocks(): Promise<StockData[]> {
  console.log('开始获取深交所全部股票数据...\n');

  const codes: string[] = [];
  for (let i = 1; i <= 4000; i++) {
    codes.push('sz' + i.toString().padStart(6, '0'));
  }
  for (let i = 300001; i <= 301000; i++) {
    codes.push('sz' + i);
  }
  
  console.log(`生成了 ${codes.length} 个候选代码`);
  
  const batchSize = 800;
  const allStocks: StockData[] = [];
  const totalBatches = Math.ceil(codes.length / batchSize);
  
  for (let i = 0; i < codes.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = codes.slice(i, i + batchSize);
    const url = 'http://qt.gtimg.cn/q=' + batch.join(',');
    
    try {
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': '*/*'
        },
        timeout: 60000,
        responseType: 'arraybuffer'
      });
      
      const decoded = iconv.decode(Buffer.from(response.data as ArrayBuffer), 'gbk');
      
      const lines = decoded.split(';');
      lines.forEach(line => {
        const match = line.match(/v_(sz\d+)="([^"]+)"/);
        if (match) {
          const parts = match[2].split('~');
          if (parts.length > 1 && parts[1]) {
            const code = match[1].replace('sz', '');
            const name = parts[1].trim();
            if (name && name !== '' && 
                !name.includes('�') && 
                !name.includes('暂时无数据') &&
                !name.startsWith('NQ')) {
              allStocks.push({
                code: code,
                name: name,
                fullName: name,
                listDate: '',
                status: '上市',
                type: getStockType(code)
              });
            }
          }
        }
      });
      
      console.log(`✅ 批次 ${batchNum}/${totalBatches}: 累计 ${allStocks.length} 只股票`);
      
      if (i + batchSize < codes.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      const err = e as Error;
      console.error(`❌ 批次 ${batchNum} 失败:`, err.message);
    }
  }
  
  console.log(`\n✅ 总计获取 ${allStocks.length} 只深交所股票`);
  return allStocks;
}

function getStockType(code: string | undefined): string {
  if (!code) return '其他';
  const prefix = code.substring(0, 3);
  
  if (['000', '001', '002', '003'].includes(prefix)) {
    return '主板';
  }
  
  if (['300', '301'].includes(prefix)) {
    return '创业板';
  }
  
  return '其他';
}

function saveToFrontend(stocks: StockData[]): void {
  const outputPath = path.join(__dirname, '../src/data/szse-stocks.json');

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const typeCount: Record<string, number> = {};
  stocks.forEach(s => {
    typeCount[s.type] = (typeCount[s.type] || 0) + 1;
  });

  const data: SZSEStocksOutput = {
    total: stocks.length,
    updatedAt: new Date().toISOString().split('T')[0],
    source: '腾讯财经 - 深交所',
    stats: typeCount,
    stocks: stocks
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 数据已保存到: ${outputPath}`);

  console.log('\n📊 股票类型分布:');
  Object.entries(typeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 只`);
    });
}

async function main(): Promise<void> {
  try {
    const stocks = await fetchSZSEStocks();

    if (stocks.length > 0) {
      console.log('\n前 5 条数据示例:');
      stocks.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.code} - ${s.name} (${s.type})`);
      });
      
      saveToFrontend(stocks);
      console.log('\n✅ 数据获取并保存成功！');
    } else {
      console.log('\n❌ 没有获取到数据');
      process.exit(1);
    }
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

main();
