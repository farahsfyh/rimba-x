'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CircleCheck, CircleAlert, Trash2, Upload, FileSpreadsheet } from 'lucide-react'
import { FileUpload } from '@/components/ui/FileUpload'
import { cn } from '@/lib/utils'

interface ParsedFile {
    id: string
    name: string
    type: string
    size: number
    status: 'uploading' | 'done' | 'error'
    wordCount?: number
    error?: string
}

interface SavedDocument {
    id: string
    filename: string
    title: string | null
    subject: string | null
    file_type: string
    file_size: number
    processed: boolean
    created_at: string
}

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
    if (type.includes('pdf')) return FileText
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet
    return FileText
}

export default function UploadPage() {
    const [files, setFiles] = useState<ParsedFile[]>([])
    const [savedDocs, setSavedDocs] = useState<SavedDocument[]>([])
    const [loadingDocs, setLoadingDocs] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const loadDocs = useCallback(async () => {
        try {
            const res = await fetch('/api/documents', { credentials: 'include' })
            if (res.ok) {
                const data = await res.json()
                setSavedDocs(data.documents || [])
            }
        } catch { /* silent */ } finally {
            setLoadingDocs(false)
        }
    }, [])

    useEffect(() => { loadDocs() }, [loadDocs])

    const handleFiles = async (selected: File[]) => {
        for (const file of selected) {
            const id = crypto.randomUUID()
            setFiles(prev => [...prev, { id, name: file.name, type: file.type, size: file.size, status: 'uploading' }])
            try {
                const formData = new FormData()
                formData.append('file', file)
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Upload failed')
                setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done', wordCount: data.wordCount } : f))
                loadDocs()
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to upload file'
                setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: msg } : f))
            }
        }
    }

    const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

    const handleDelete = async (docId: string) => {
        setDeletingId(docId)
        try {
            const res = await fetch('/api/documents', {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: docId }),
            })
            if (res.ok) setSavedDocs(prev => prev.filter(d => d.id !== docId))
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Upload size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-secondary">Upload Resources</h1>
                    <p className="text-sm text-muted">Add study materials for your AI tutor to learn from</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <FileUpload onFilesSelected={handleFiles} accept={['pdf', 'docx', 'txt']} multiple maxSizeMB={20} />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted"
            >
                <CircleAlert size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Files are saved to cloud storage and indexed for your AI tutor automatically.</span>
            </motion.div>

            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                        <h2 className="text-sm font-semibold text-secondary">Uploaded Files ({files.length})</h2>
                        {files.map(file => {
                            const Icon = getFileIcon(file.type)
                            return (
                                <motion.div key={file.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm"
                                >
                                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                        file.status === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-secondary truncate">{file.name}</p>
                                        <p className="text-xs text-muted">
                                            {formatSize(file.size)}
                                            {file.status === 'done' && file.wordCount && ` · ~${file.wordCount.toLocaleString()} words · saved`}
                                            {file.status === 'uploading' && ' · uploading…'}
                                            {file.status === 'error' && ` · ${file.error}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {file.status === 'uploading' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                        {file.status === 'done' && <CircleCheck size={18} className="text-success" />}
                                        {file.status === 'error' && <CircleAlert size={18} className="text-error" />}
                                        <button onClick={() => removeFile(file.id)} className="text-muted hover:text-error transition-colors p-1 rounded-lg hover:bg-error/5">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persisted documents list */}
            <div className="space-y-3">
                <h2 className="text-sm font-semibold text-secondary">Your Materials</h2>
                {loadingDocs ? (
                    <div className="space-y-2">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                ) : savedDocs.length === 0 ? (
                    <p className="text-sm text-muted py-4 text-center">No files uploaded yet.</p>
                ) : (
                    savedDocs.map(doc => {
                        const Icon = getFileIcon(doc.file_type)
                        return (
                            <div key={doc.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-secondary truncate">{doc.title || doc.filename}</p>
                                    <p className="text-xs text-muted">
                                        {formatSize(doc.file_size)}
                                        {doc.subject && ` · ${doc.subject}`}
                                        {' · '}{new Date(doc.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={cn('text-xs font-medium shrink-0', doc.processed ? 'text-success' : 'text-warning')}>
                                    {doc.processed ? 'AI Ready' : 'Processing…'}
                                </span>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    disabled={deletingId === doc.id}
                                    className="text-muted hover:text-error transition-colors p-1 rounded-lg hover:bg-error/5 disabled:opacity-40"
                                >
                                    {deletingId === doc.id
                                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        : <Trash2 size={15} />}
                                </button>
                            </div>
                        )
                    })
                )}
            </div>

        </div>
    )
}
