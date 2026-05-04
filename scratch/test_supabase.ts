import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

async function test() {
  const { data, error } = await supabase
    .from('ai_interactions')
    .select('*, subjects(name,code), profiles(name,department,year)')
    .order('created_at', { ascending: false })
  
  console.log('Error:', error)
  console.log('Data length:', data?.length)
  console.log('Sample:', JSON.stringify(data?.[0], null, 2))
}

test()
