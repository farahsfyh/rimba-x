'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type AcceptedType = 'pdf' | 'txt' | 'docx'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: AcceptedType[]
  multiple?: boolean
  maxSizeMB?: number
  className?: string
  disabled?: boolean
}

const mimeMap: Record<AcceptedType, string> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

const labelMap: Record<AcceptedType, string> = {
  pdf: 'PDF',
  txt: 'TXT',
  docx: 'DOCX',
}

export function FileUpload({
  onFilesSelected,
  accept = ['pdf', 'txt', 'docx'],
  multiple = true,
  maxSizeMB = 20,
  className,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptedMimes = accept.map((t) => mimeMap[t]).join(',')
  const acceptedLabels = accept.map((t) => labelMap[t]).join(', ')

  const validate = (files: File[]): File[] => {
    setError(null)
    const valid: File[] = []
    for (const file of files) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`"${file.name}" exceeds the ${maxSizeMB}MB limit.`)
        continue
      }
      const accepted = accept.map((t) => mimeMap[t])
      if (!accepted.includes(file.type)) {
        setError(`"${file.name}" is not a supported file type.`)
        continue
      }
      valid.push(file)
    }
    return valid
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || disabled) return
    const valid = validate(Array.from(files))
    if (valid.length > 0) onFilesSelected(valid)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40',
          disabled && 'cursor-not-allowed opacity-50 hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            <span className="text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {acceptedLabels} up to {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptedMimes}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
    </div>
  )
}
