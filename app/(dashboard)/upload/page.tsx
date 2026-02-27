'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileUpload } from '@/components/ui/FileUpload'

interface UploadedDocument {
  id: string
  filename: string
  title: string | null
  subject: string | null
  file_type: string
  file_size: number
  processed: boolean
  created_at: string
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface UploadState {
  status: UploadStatus
  message: string
  filename?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileTypeLabel(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('wordprocessingml')) return 'DOCX'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLSX'
  return 'TXT'
}

function fileTypeColor(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700'
  if (mimeType.includes('wordprocessingml')) return 'bg-blue-100 text-blue-700'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

export default function UploadPage() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [subject, setSubject] = useState('')
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setDocuments(data.documents || [])
      }
    } catch {
      // silently fail on load
    } finally {
      setLoadingDocs(false)
    }
  }, [])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  const handleFilesSelected = async (files: File[]) => {
    for (const file of files) {
      setUploadStates(prev => ({
        ...prev,
        [file.name]: { status: 'uploading', message: 'Uploading & generating AI embeddings…', filename: file.name },
      }))

      try {
        const formData = new FormData()
        formData.append('file', file)
        if (subject.trim()) formData.append('subject', subject.trim())

        const res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          setUploadStates(prev => ({
            ...prev,
            [file.name]: { status: 'error', message: data.error || 'Upload failed', filename: file.name },
          }))
        } else {
          setUploadStates(prev => ({
            ...prev,
            [file.name]: {
              status: 'done',
              message: `Uploaded — ${data.wordCount?.toLocaleString() ?? '?'} words, ${data.chunkCount} AI chunks`,
              filename: file.name,
            },
          }))
          loadDocuments()
        }
      } catch {
        setUploadStates(prev => ({
          ...prev,
          [file.name]: { status: 'error', message: 'Network error — please try again', filename: file.name },
        }))
      }
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

  const isUploading = Object.values(uploadStates).some(s => s.status === 'uploading')

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Resources</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload PDFs, Word docs, or text files. RimbaX will parse and index them so your AI tutor can answer questions from your materials.
        </p>
      </div>

      {/* Upload Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Topic <span className="text-gray-400 font-normal">(optional)</span></label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Biology, Calculus, History…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <FileUpload
          onFilesSelected={handleFilesSelected}
          accept={['pdf', 'txt', 'docx']}
          multiple
          maxSizeMB={20}
          disabled={isUploading}
        />

        {/* Per-file status */}
        {Object.values(uploadStates).length > 0 && (
          <div className="space-y-2">
            {Object.values(uploadStates).map(state => (
              <div
                key={state.filename}
                className={`flex items-start gap-3 rounded-lg px-4 py-3 text-sm ${
                  state.status === 'uploading' ? 'bg-blue-50 text-blue-800' :
                  state.status === 'done' ? 'bg-green-50 text-green-800' :
                  'bg-red-50 text-red-800'
                }`}
              >
                {state.status === 'uploading' && (
                  <svg className="mt-0.5 h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
                {state.status === 'done' && (
                  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {state.status === 'error' && (
                  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  <p className="font-medium truncate max-w-sm">{state.filename}</p>
                  <p className="text-xs opacity-80">{state.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents List */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Materials</h2>

        {loadingDocs ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <p className="text-sm text-gray-500">No files uploaded yet. Upload your first document above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                {/* File type badge */}
                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ${fileTypeColor(doc.file_type)}`}>
                  {fileTypeLabel(doc.file_type)}
                </span>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.title || doc.filename}</p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(doc.file_size)}
                    {doc.subject && <> · <span className="text-blue-600">{doc.subject}</span></>}
                    {' · '}
                    {new Date(doc.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Processed badge */}
                {doc.processed ? (
                  <span className="shrink-0 text-xs text-green-600 font-medium">AI Ready</span>
                ) : (
                  <span className="shrink-0 text-xs text-yellow-600 font-medium">Processing…</span>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  title="Delete document"
                >
                  {deletingId === doc.id ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
