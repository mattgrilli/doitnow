import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = createClient()

  const { data: users, error } = await supabase
    .from('public_users')
    .select('id, email')

  if (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 })
  }

  return NextResponse.json({ users })
}
