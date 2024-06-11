import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { todo_id, content } = await request.json()

  if (!content || !todo_id) {
    return NextResponse.redirect(new URL('/private/todo', request.url))
  }

  const { error: discussionError } = await supabase
    .from('discussions')
    .insert([{ todo_id, content }])

  if (discussionError) {
    console.error('Error adding discussion:', discussionError)
    return NextResponse.redirect(new URL('/private/todo', request.url))
  }

  return NextResponse.redirect(new URL('/private/todo', request.url))
}
