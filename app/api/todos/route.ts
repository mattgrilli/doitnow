import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')

  const { data: discussions, error: discussionsError } = await supabase
    .from('discussions')
    .select('*')

  if (error || discussionsError) {
    console.error('Error fetching data:', error || discussionsError)
    return NextResponse.json({ error: 'Error fetching data' }, { status: 500 })
  }

  return NextResponse.json({ todos, discussions })
}
