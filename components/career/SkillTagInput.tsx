'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'

interface SkillTagInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  maxTags?: number
  label?: string
}

export function SkillTagInput({ value, onChange, placeholder = 'Add a skill…', maxTags = 100, label }: SkillTagInputProps) {
  const [input, setInput] = useState('')

  const addSkill = (raw: string) => {
    const skill = raw.trim()
    if (!skill || value.includes(skill) || value.length >= maxTags) return
    onChange([...value, skill])
    setInput('')
  }

  const removeSkill = (skill: string) => onChange(value.filter(s => s !== skill))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeSkill(value[value.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div className="min-h-11 flex flex-wrap gap-2 items-center border border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {value.map(skill => (
          <span key={skill} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors ml-0.5">
              <X size={10} />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1 flex-1 min-w-35">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { if (input.trim()) addSkill(input) }}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-gray-400 text-gray-700 min-w-0"
          />
          {input.trim() && (
            <button type="button" onClick={() => addSkill(input)} className="text-primary hover:text-primary-hover transition-colors shrink-0">
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
