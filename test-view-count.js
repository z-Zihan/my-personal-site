// 测试浏览量更新脚本
// 在浏览器控制台中运行此代码来测试 API

async function testViewCount() {
  const testArticleId = 1; // 替换为你的文章 ID

  console.log('🔍 开始测试浏览量更新...');

  try {
    // 第一次请求
    console.log('📡 发送第一次请求...');
    const res1 = await fetch(`https://zzihanaini.vercel.app/api/article-detail?id=${testArticleId}`);
    const data1 = await res1.json();
    console.log('✅ 第一次请求结果:', data1.data?.views);

    // 等待 1 秒
    await new Promise(r => setTimeout(r, 1000));

    // 第二次请求
    console.log('📡 发送第二次请求...');
    const res2 = await fetch(`https://zzihanaini.vercel.app/api/article-detail?id=${testArticleId}`);
    const data2 = await res2.json();
    console.log('✅ 第二次请求结果:', data2.data?.views);

    // 第三次请求
    await new Promise(r => setTimeout(r, 1000));
    console.log('📡 发送第三次请求...');
    const res3 = await fetch(`https://zzihanaini.vercel.app/api/article-detail?id=${testArticleId}`);
    const data3 = await res3.json();
    console.log('✅ 第三次请求结果:', data3.data?.views);

    console.log('\n📊 结果分析:');
    console.log(`第一次：${data1.data?.views}`);
    console.log(`第二次：${data2.data?.views} (增加了 ${data2.data?.views - data1.data?.views})`);
    console.log(`第三次：${data3.data?.views} (增加了 ${data3.data?.views - data2.data?.views})`);

    if (data2.data?.views > data1.data?.views && data3.data?.views > data2.data?.views) {
      console.log('✅ 浏览量更新正常！');
    } else {
      console.log('❌ 浏览量没有更新，可能的问题:');
      console.log('  1. Supabase RLS 策略阻止了更新');
      console.log('  2. 数据库连接问题');
      console.log('  3. articles 表没有 views 字段');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testViewCount();
