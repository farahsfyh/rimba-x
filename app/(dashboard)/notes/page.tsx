'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Document {
  id: string
  filename: string
  title: string | null
  subject: string | null
  file_type: string
  file_size: number
  processed: boolean
  created_at: string
}

function fileTypeLabel(mimeType: string) {
  if (mimeType.includes('pdf')) return 'PDF'
  if (mimeType.includes('wordprocessingml')) return 'DOCX'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'XLSX'
  return 'TXT'
}

function fileTypeColor(mimeType: string) {
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-700'
  if (mimeType.includes('wordprocessingml')) return 'bg-blue-100 text-blue-700'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NotesPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('')

  useEffect(() => {
    fetch('/api/documents', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setDocuments(data.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const subjects = Array.from(new Set(documents.map(d => d.subject).filter(Boolean))) as string[]

  const filtered = documents.filter(doc => {
    const matchesSearch =
      !search ||
      (doc.title || doc.filename).toLowerCase().includes(search.toLowerCase()) ||
      (doc.subject || '').toLowerCase().includes(search.toLowerCase())
    const matchesSubject = !filterSubject || doc.subject === filterSubject
    return matchesSearch && matchesSubject
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes &amp; Materials</h1>
          <p className="mt-1 text-sm text-gray-500">All your uploaded study materials, indexed for your AI tutor.</p>
        </div>
        <Link
          href="/upload"
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Upload
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search materials…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {subjects.length > 0 && (
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {/* Stats */}
      {!loading && documents.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total files</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{documents.filter(d => d.processed).length}</p>
            <p className="text-xs text-gray-500 mt-0.5">AI indexed</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Subjects</p>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
          {documents.length === 0 ? (
            <>
              <p className="text-sm font-medium text-gray-700">No materials yet</p>
              <p className="mt-1 text-sm text-gray-500">Upload your first file to get started.</p>
              <Link href="/upload" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Upload a file
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-500">No materials match your search.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Type badge */}
              <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide ${fileTypeColor(doc.file_type)}`}>
                {fileTypeLabel(doc.file_type)}
              </span>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{doc.title || doc.filename}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatBytes(doc.file_size)}
                  {doc.subject && (
                    <> · <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 font-medium">{doc.subject}</span></>
                  )}
                  {' · '}
                  {new Date(doc.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              {/* Status */}
              <div className="shrink-0 text-right">
                {doc.processed ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    AI Ready
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 font-medium">Processing…</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

