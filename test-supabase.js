// ============================================
// Supabase 数据库连接测试
// ============================================
// 用途：测试 Supabase 数据库连接和表结构
// 执行方式：node test-supabase.js
// ============================================

import { createClient } from '@supabase/supabase-js'

// 从环境变量读取配置，如果没有则使用默认值
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lseantwsebvsmavqcjat.supabase.co'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_FkAtim7rD1L2_5AWS9g-VQ_60b2Qbp9'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 错误：请先配置环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
  console.error('   可以复制 .env.example 为 .env.local 并填入配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 测试函数
async function testConnection() {
  console.log('🔍 测试 Supabase 连接...\n')
  console.log(`   URL: ${supabaseUrl}`)
  console.log('')

  let allPassed = true

  // 1. 测试核心表
  console.log('📌 测试博客核心表...\n')

  const tables = [
    { name: 'articles', columns: 'id, title' },
    { name: 'categories', columns: 'id, name' },
    { name: 'tags', columns: 'id, name' },
    { name: 'comments', columns: 'id, content' },
    { name: 'likes', columns: 'id, article_id' },
    { name: 'messages', columns: 'id, content' },
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table.name).select(table.columns).limit(1)
    if (error) {
      console.error(`   ❌ ${table.name}: ${error.message}`)
      allPassed = false
    } else {
      console.log(`   ✅ ${table.name}: OK`)
    }
  }

  // 2. 测试埋点分析表
  console.log('\n📌 测试埋点分析表...\n')

  const analyticsTables = [
    { name: 'visitors', columns: 'id, visitor_id' },
    { name: 'sessions', columns: 'id, session_id' },
    { name: 'page_views', columns: 'id, page_path' },
    { name: 'events', columns: 'id, event_name' },
  ]

  for (const table of analyticsTables) {
    const { error } = await supabase.from(table.name).select(table.columns).limit(1)
    if (error) {
      console.error(`   ❌ ${table.name}: ${error.message}`)
      allPassed = false
    } else {
      console.log(`   ✅ ${table.name}: OK`)
    }
  }

  // 3. 测试 Storage
  console.log('\n📌 测试 Storage...\n')

  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  console.log(`   🔍 当前 Storage Buckets: ${buckets}`)
  if (bucketError) {
    console.error(`   ❌ Storage: ${bucketError.message}`)
    allPassed = false
  } else {
    const blogImagesBucket = buckets.find(b => b.name === 'image')
    if (blogImagesBucket) {
      console.log(`   ✅ image bucket: 存在`)
    } else {
      console.warn(`   ⚠️  image bucket: 不存在`)
      console.warn(`      请在 Supabase Dashboard → Storage → New bucket 创建`)
      allPassed = false
    }
  }

  // 4. 测试数据
  console.log('\n📌 测试数据...\n')

  const { count } = await supabase.from('articles').select('*', { count: 'exact', head: true })
  console.log(`   📝 文章总数：${count || 0}`)

  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true })
  console.log(`   🏷️  分类总数：${catCount || 0}`)

  const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true })
  console.log(`   💬 留言总数：${msgCount || 0}`)

  // 总结
  console.log('\n' + '='.repeat(50))
  if (allPassed) {
    console.log('✅ 所有测试通过！数据库配置正确。')
  } else {
    console.log('⚠️  部分测试未通过，请检查数据库配置。')
    console.log('\n💡 提示:')
    console.log('   1. 确保已执行 sql/01-database-init.sql 脚本')
    console.log('   2. 确保已创建 image bucket')
    console.log('   3. 确保已执行 sql/02-storage-setup.sql 脚本')
  }
  console.log('='.repeat(50))
}

// 运行测试
testConnection().catch(err => {
  console.error('❌ 测试失败:', err.message)
  process.exit(1)
})
