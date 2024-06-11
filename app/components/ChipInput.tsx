'use client'

import { useEffect, useState } from 'react'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'

interface User {
  id: string
  email: string
}

interface ChipInputProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function ChipInput({ value, onChange }: ChipInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<User[]>([])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        if (data.error) {
          console.error('Error fetching users:', data.error)
        } else {
          setOptions(data.users)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [])

  return (
    <Autocomplete
      multiple
      options={options.map((user) => user.email)}
      value={value}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      onChange={(event, newValue) => {
        onChange(newValue)
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Assignees"
          placeholder="Enter assignee emails"
        />
      )}
    />
  )
}
