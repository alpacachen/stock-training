import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取指定类型的股票数据
 * @param {string} stockType - 1=主板, 8=科创板
 * @param {string} typeName - 类型名称
 */
async function fetchStocksByType(stockType, typeName) {
  console.log(`\n开始获取上交所${typeName}数据...`);

  try {
    const url = 'https://query.sse.com.cn/sseQuery/commonQuery.do';
    const params = {
      jsonCallBack: 'jsonpCallback' + Date.now(),
      STOCK_TYPE: stockType,
      REG_PROVINCE: '',
      CSRC_CODE: '',
      STOCK_CODE: '',
      sqlId: 'COMMON_SSE_CP_GPJCTPZ_GPLB_GP_L',
      COMPANY_STATUS: '2,4,5,7,8',
      type: 'inParams',
      isPagination: 'true',
      'pageHelp.cacheSize': '1',
      'pageHelp.beginPage': '1',
      'pageHelp.pageSize': '10000',
      'pageHelp.pageNo': '1',
      'pageHelp.endPage': '1',
      '_': Date.now()
    };

    const response = await axios.get(url, {
      params,
      headers: {
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Referer': 'https://www.sse.com.cn/',
        'Sec-Fetch-Dest': 'script',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"'
      },
      timeout: 60000,
      withCredentials: false
    });

    const text = response.data;
    const jsonMatch = text.match(/jsonpCallback\d+\((.*)\);?$/s);

    if (!jsonMatch) {
      console.error(`❌ ${typeName} 无法解析返回数据`);
      return [];
    }

    const data = JSON.parse(jsonMatch[1]);
    const rawData = data.pageHelp?.data || data.result || [];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.error(`❌ ${typeName} 返回数据中没有股票数据`);
      return [];
    }

    console.log(`✅ ${typeName} 获取到 ${rawData.length} 条原始数据`);

    const stocks = rawData.map(item => ({
      code: item.A_STOCK_CODE?.trim() || item.COMPANY_CODE?.trim() || '',
      name: item.COMPANY_ABBR?.trim() || item.SEC_NAME_CN?.trim() || '',
      fullName: item.FULL_NAME?.trim() || item.COMPANY_NAME?.trim() || '',
      listDate: item.LIST_DATE?.trim() || '',
      status: item.STATE_CODE === '2' ? '上市' : '其他',
      type: typeName
    })).filter(s => s.code && s.name);

    console.log(`✅ ${typeName} 解析出 ${stocks.length} 条有效数据`);

    return stocks;

  } catch (error) {
    console.error(`❌ 获取${typeName}失败:`, error.message);
    return [];
  }
}

/**
 * 直接使用上交所接口获取所有股票列表
 */
async function fetchSSEStocks() {
  console.log('开始获取上交所全部股票数据...\n');

  // 获取主板和科创板数据
  const mainBoardStocks = await fetchStocksByType('1', '主板');
  const keChuangStocks = await fetchStocksByType('8', '科创板');

  // 合并数据
  const allStocks = [...mainBoardStocks, ...keChuangStocks];

  console.log(`\n📊 总计获取 ${allStocks.length} 只股票`);
  console.log(`  - 主板: ${mainBoardStocks.length} 只`);
  console.log(`  - 科创板: ${keChuangStocks.length} 只`);

  // 显示前 5 条作为示例
  console.log('\n前 5 条数据示例:');
  allStocks.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.code} - ${s.name} (${s.type})`);
  });

  return allStocks;
}

/**
 * 判断股票类型（根据代码前缀）
 */
function getStockType(code) {
  const prefix = code?.substring(0, 3);
  switch (prefix) {
    case '600':
    case '601':
    case '603':
    case '605':
      return '主板';
    case '688':
    case '689':
      return '科创板';
    default:
      return '其他';
  }
}

/**
 * 保存数据到前端项目
 */
function saveToFrontend(stocks) {
  // 脚本在 scripts 目录，目标在 src/data 目录
  const outputPath = path.join(__dirname, '../src/data/sse-stocks.json');

  // 确保目录存在
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const data = {
    total: stocks.length,
    updatedAt: new Date().toISOString().split('T')[0],
    source: '上海证券交易所',
    stocks: stocks
  };

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 数据已保存到: ${outputPath}`);

  // 输出统计信息
  const typeCount = {};
  stocks.forEach(s => {
    typeCount[s.type] = (typeCount[s.type] || 0) + 1;
  });

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
    const stocks = await fetchSSEStocks();

    if (stocks.length > 0) {
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