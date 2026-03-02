// 测试 Supabase 连接
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lseantwsebvsmavqcjat.supabase.co'
const supabaseKey = 'sb_publishable_FkAtim7rD1L2_5AWS9g-VQ_60b2Qbp9'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 测试 Supabase 连接...')
  
  // 测试 articles 表
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title')
    .limit(1)
  
  if (articlesError) {
    console.error('❌ Articles 表错误:', articlesError.message)
  } else {
    console.log('✅ Articles 表连接成功，文章数:', articles?.length || 0)
  }
  
  // 测试 categories 表
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .limit(1)
  
  if (categoriesError) {
    console.error('❌ Categories 表错误:', categoriesError.message)
  } else {
    console.log('✅ Categories 表连接成功')
  }
  
  // 测试 messages 表
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('id, content')
    .limit(1)
  
  if (messagesError) {
    console.error('❌ Messages 表错误:', messagesError.message)
  } else {
    console.log('✅ Messages 表连接成功')
  }
}

testConnection().catch(console.error)
