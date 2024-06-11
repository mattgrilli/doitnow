'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ChipInput from '../../components/ChipInput'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'

interface Todo {
  id: number
  content: string
  description: string
  due_date: string | null
  follow_up_date: string | null
  status: string
  progress_notes: string
  assignees: string[]
}

interface Discussion {
  id: number
  todo_id: number
  content: string
  created_at: string
}

interface User {
  id: string
  email: string
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [assignees, setAssignees] = useState<string[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [discussionContent, setDiscussionContent] = useState<string>('')
  const [filterVisible, setFilterVisible] = useState<boolean>(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchTodos() {
      const response = await fetch('/api/todos')
      const data = await response.json()
      setTodos(data.todos.map((todo: Todo) => ({
        ...todo,
        assignees: todo.assignees || []
      })))
    }

    async function fetchUsers() {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users)
    }

    fetchTodos()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedTodo) {
      setAssignees(selectedTodo.assignees || [])
      fetchDiscussions(selectedTodo.id)
    }
  }, [selectedTodo])

  const fetchDiscussions = async (todoId: number) => {
    const response = await fetch(`/api/todos/${todoId}/discussions`)
    const data = await response.json()
    setDiscussions(data.discussions)
  }

  const handleTodoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const content = formData.get('content') as string
    const description = formData.get('description') as string
    const due_date = formData.get('due_date') as string
    const follow_up_date = formData.get('follow_up_date') as string
    const status = formData.get('status') as string
    const progress_notes = formData.get('progress_notes') as string

    const response = await fetch('/private/todo/add', {
      method: 'POST',
      body: JSON.stringify({ content, description, due_date, follow_up_date, assignees, status, progress_notes }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      router.push('/private/todo') // Navigate to the same page to reload
    } else {
      console.error('Error adding todo')
    }
  }

  const handleTodoUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTodo) return

    const formData = new FormData(event.currentTarget)
    const content = formData.get('content') as string
    const description = formData.get('description') as string
    const due_date = formData.get('due_date') as string
    const follow_up_date = formData.get('follow_up_date') as string
    const status = formData.get('status') as string
    const progress_notes = formData.get('progress_notes') as string

    const response = await fetch(`/private/todo/update/${selectedTodo.id}`, {
      method: 'POST',
      body: JSON.stringify({ content, description, due_date, follow_up_date, assignees, status, progress_notes }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      setSelectedTodo(null)
      router.push('/private/todo') // Navigate to the same page to reload
    } else {
      console.error('Error updating todo')
    }
  }

  const handleDiscussionSubmit = async (todo_id: number) => {
    const response = await fetch('/private/todo/discuss', {
      method: 'POST',
      body: JSON.stringify({ todo_id, content: discussionContent }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      setDiscussionContent('')
      fetchDiscussions(todo_id)
    } else {
      console.error('Error adding discussion')
    }
  }

  const filteredTodos = selectedAssignee
    ? todos.filter((todo: Todo) => todo.assignees && todo.assignees.includes(selectedAssignee))
    : todos

    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-blue-400">Todo List</h1>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setSelectedTodo(null)
                setShowCreateForm(true)
              }}
              className="ml-4 bg-blue-600 hover:bg-blue-700"
            >
              Create New Todo
            </Button>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Todo List */}
            <div>
              {/* Filter */}
              <div className="mb-6 bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-blue-400 mr-4">Filter</h2>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setFilterVisible(!filterVisible)}
                    className="ml-auto bg-blue-600 hover:bg-blue-700"
                  >
                    {filterVisible ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {filterVisible && (
                  <Autocomplete
                    options={users.map(user => user.email)}
                    value={selectedAssignee}
                    onChange={(event, newValue) => setSelectedAssignee(newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Assignee"
                        placeholder="Select an assignee"
                        fullWidth
                        margin="normal"
                        className="mt-4"
                        InputLabelProps={{
                          style: { color: 'white' },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          style: { color: 'white' },
                        }}
                      />
                    )}
                    className="text-white"
                  />
                )}
              </div>
  
              <ul className="space-y-4">
                {filteredTodos.map((todo: Todo) => (
                  <li
                    key={todo.id}
                    onClick={() => setSelectedTodo(todo)}
                    className="bg-gray-800 rounded-lg shadow-md p-6 hover:bg-gray-700 cursor-pointer transition-colors duration-300"
                  >
                    <h2 className="text-2xl font-bold mb-2 text-blue-400">{todo.content}</h2>
                    <p className="mb-2 text-gray-400">{todo.description}</p>
                    <div className="mb-2">
                      <span className="font-bold text-gray-400">Status:</span>{' '}
                      <span className={`${todo.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {todo.status}
                      </span>
                    </div>
                    <p className="mb-2 text-gray-400">Progress Notes: {todo.progress_notes}</p>
                    <p className="mb-2 text-gray-400">Due: {todo.due_date || 'N/A'}</p>
                    <p className="text-gray-400">Follow Up: {todo.follow_up_date || 'N/A'}</p>
                  </li>
                ))}
              </ul>
            </div>
  
            {/* Todo Form */}
            <div>
              {selectedTodo ? (
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4 text-blue-400">Edit Todo</h2>
                  <form onSubmit={handleTodoUpdate}>
                    {/* Updated form fields */}
                    <TextField
                      name="content"
                      label="Content"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      defaultValue={selectedTodo.content}
                      required
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="description"
                      label="Description"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      defaultValue={selectedTodo.description}
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="due_date"
                      label="Due Date"
                      type="date"
                      variant="outlined"
                      fullWidth                    margin="normal"
                      defaultValue={selectedTodo.due_date || ''}
                      InputLabelProps={{
                        shrink: true,
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="follow_up_date"
                      label="Follow-Up Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      defaultValue={selectedTodo.follow_up_date || ''}
                      InputLabelProps={{
                        shrink: true,
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="status"
                      label="Status"
                      select
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      value={selectedTodo.status}
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </TextField>
                    <TextField
    name="progress_notes"
    label="Progress Notes"
    variant="outlined"
    fullWidth
    margin="normal"
    defaultValue={selectedTodo.progress_notes}
    InputLabelProps={{
      style: { color: 'white' },
    }}
    InputProps={{
      style: { color: 'white' },
    }}
  />
  <div style={{ marginTop: '16px' }}>
    <ChipInput
      value={assignees}
      onChange={(chips) => setAssignees(chips)}
    />
  </div>
  <Button type="submit" variant="contained" color="primary" className="mt-4 bg-blue-600 hover:bg-blue-700">
    Update Todo
  </Button>
</form>
                  {/* Discussion Form */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4 text-blue-400">Discussions</h3>
                    <ul className="space-y-2 mb-4">
                      {discussions.map(discussion => (
                        <li key={discussion.id} className="bg-gray-700 rounded-lg p-2">
                          {discussion.content}
                        </li>
                      ))}
                    </ul>
                    <form onSubmit={(e) => { e.preventDefault(); handleDiscussionSubmit(selectedTodo.id) }}>
                      <TextField
                        value={discussionContent}
                        onChange={(e) => setDiscussionContent(e.target.value)}
                        label="Add Discussion"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{
                          style: { color: 'white' },
                        }}
                        InputProps={{
                          style: { color: 'white' },
                        }}
                      />
                      <Button type="submit" variant="contained" color="primary" className="mt-2 bg-blue-600 hover:bg-blue-700">
                        Add Discussion
                      </Button>
                    </form>
                  </div>
                </div>
              ) : showCreateForm ? (
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4 text-blue-400">Create New Todo</h2>
                  <form onSubmit={handleTodoSubmit}>
                    {/* Updated form fields */}
                    <TextField
                      name="content"
                      label="Content"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      required
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="description"
                      label="Description"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="due_date"
                      label="Due Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="follow_up_date"
                      label="Follow-Up Date"
                      type="date"
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    />
                    <TextField
                      name="status"
                      label="Status"
                      select
                      variant="outlined"
                      fullWidth
                      margin="normal"
                      InputLabelProps={{
                        style: { color: 'white' },
                      }}
                      InputProps={{
                        style: { color: 'white' },
                      }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="In Progress">In Progress</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </TextField>
                    <TextField
    name="progress_notes"
    label="Progress Notes"
    variant="outlined"
    fullWidth
    margin="normal"
    InputLabelProps={{
      style: { color: 'white' },
    }}
    InputProps={{
      style: { color: 'white' },
    }}
  />
  <div style={{ marginTop: '16px' }}>
    <ChipInput
      value={assignees}
      onChange={(chips) => setAssignees(chips)}
    />
  </div>
  <Button type="submit" variant="contained" color="primary" className="mt-4 bg-blue-600 hover:bg-blue-700">
    Add Todo
  </Button>
</form>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Todo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }