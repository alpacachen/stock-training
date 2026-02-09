import axios from 'axios';
import iconv from 'iconv-lite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 从腾讯接口批量获取股票数据
 */
async function fetchSZSEStocks() {
  console.log('开始获取深交所全部股票数据...\n');

  // 生成深交所主板代码范围 (000001-004000)
  const codes = [];
  for (let i = 1; i <= 4000; i++) {
    codes.push('sz' + i.toString().padStart(6, '0'));
  }
  // 创业板 300001-301000
  for (let i = 300001; i <= 301000; i++) {
    codes.push('sz' + i);
  }
  
  console.log(`生成了 ${codes.length} 个候选代码`);
  
  // 分批查询，每批800个
  const batchSize = 800;
  const allStocks = [];
  const totalBatches = Math.ceil(codes.length / batchSize);
  
  for (let i = 0; i < codes.length; i += batchSize) {
    const batchNum = Math.floor(i / batchSize) + 1;
    const batch = codes.slice(i, i + batchSize);
    const url = 'http://qt.gtimg.cn/q=' + batch.join(',');
    
    try {
      // 使用 arraybuffer 获取原始二进制数据
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': '*/*'
        },
        timeout: 60000,
        responseType: 'arraybuffer'
      });
      
      // 使用 GBK 解码
      const decoded = iconv.decode(Buffer.from(response.data), 'gbk');
      
      // 解析响应
      const lines = decoded.split(';');
      lines.forEach(line => {
        const match = line.match(/v_(sz\d+)="([^"]+)"/);
        if (match) {
          const parts = match[2].split('~');
          if (parts.length > 1 && parts[1]) {
            const code = match[1].replace('sz', '');
            const name = parts[1].trim();
            // 过滤无效数据
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
      
      // 延迟避免请求过快
      if (i + batchSize < codes.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      console.error(`❌ 批次 ${batchNum} 失败:`, e.message);
    }
  }
  
  console.log(`\n✅ 总计获取 ${allStocks.length} 只深交所股票`);
  return allStocks;
}

/**
 * 判断股票类型（根据代码前缀）
 */
function getStockType(code) {
  if (!code) return '其他';
  const prefix = code.substring(0, 3);
  
  // 深交所主板: 000, 001, 002, 003
  if (['000', '001', '002', '003'].includes(prefix)) {
    return '主板';
  }
  
  // 创业板: 300, 301
  if (['300', '301'].includes(prefix)) {
    return '创业板';
  }
  
  return '其他';
}

/**
 * 保存数据到前端项目
 */
function saveToFrontend(stocks) {
  const outputPath = path.join(__dirname, '../src/data/szse-stocks.json');

  // 确保目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 按类型统计
  const typeCount = {};
  stocks.forEach(s => {
    typeCount[s.type] = (typeCount[s.type] || 0) + 1;
  });

  const data = {
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

// 主函数
async function main() {
  try {
    const stocks = await fetchSZSEStocks();

    if (stocks.length > 0) {
      // 显示前 5 条作为示例
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
