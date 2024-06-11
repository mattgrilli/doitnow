import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { content, description, due_date, follow_up_date, assignees, status, progress_notes } = await request.json()

  if (!content || !assignees || assignees.length === 0) {
    return NextResponse.redirect(new URL('/private/todo', request.url))
  }

  const { data: todo, error: todoError } = await supabase
    .from('todos')
    .insert([{ content, description, due_date, follow_up_date, status, progress_notes }])
    .select('*')
    .single()

  if (todoError) {
    console.error('Error adding todo:', todoError)
    return NextResponse.redirect(new URL('/private/todo', request.url))
  }

  // Fetch user IDs from emails
  const userResponses = await Promise.all(
    assignees.map(async (email: string) => {
      const { data, error } = await supabase
        .from('public_users')
        .select('id')
        .eq('email', email)
        .single()
      if (error) {
        console.error(`Error fetching user by email: ${email}`, error)
        return null
      }
      return data.id
    })
  )

  const userIds = userResponses.filter(id => id !== null) as string[]
  const assignments = userIds.map(user_id => ({ todo_id: todo.id, user_id }))

  const { error: assignmentError } = await supabase
    .from('assignments')
    .insert(assignments)

  if (assignmentError) {
    console.error('Error adding assignments:', assignmentError)
    return NextResponse.redirect(new URL('/private/todo', request.url))
  }

  return NextResponse.redirect(new URL('/private/todo', request.url))
}
