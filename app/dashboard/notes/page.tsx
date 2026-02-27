'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, FileText, FileSpreadsheet, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

function getFileIcon(type: string) {
    if (type.includes('pdf')) return FileText
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet
    return FileText
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function NotesExercisesPage() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchDocs = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase
                .from('documents')
                .select('id, filename, title, subject, file_type, file_size, processed, created_at')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            if (data) setDocuments(data)
            setLoading(false)
        }
        fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Notes & Materials</h1>
                        <p className="text-sm text-muted">Your uploaded study resources</p>
                    </div>
                </div>
                <Link href="/dashboard/upload"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
                >
                    <Plus size={16} />
                    Upload
                </Link>
            </motion.div>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
            ) : documents.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center"
                >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                        <BookOpen size={28} className="text-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-secondary mb-2">No materials yet</h2>
                    <p className="text-sm text-muted max-w-xs mb-6">
                        Upload your PDFs, notes, or documents and the AI tutor will use them to answer your questions.
                    </p>
                    <Link href="/dashboard/upload"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-hover transition-colors"
                    >
                        <Plus size={18} />
                        Upload Your First File
                    </Link>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc, i) => {
                        const Icon = getFileIcon(doc.file_type)
                        return (
                            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 hover:shadow-soft-md transition-all"
                            >
                                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Icon size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-semibold text-secondary truncate">{doc.title || doc.filename}</p>
                                        <span className="text-xs text-muted shrink-0">{formatDate(doc.created_at)}</span>
                                    </div>
                                    <p className="text-xs text-muted mt-1.5">
                                        {formatSize(doc.file_size)}
                                        {doc.subject && ` · ${doc.subject}`}
                                        {' · '}
                                        <span className={doc.processed ? 'text-success' : 'text-warning'}>
                                            {doc.processed ? 'AI Ready' : 'Processing…'}
                                        </span>
                                    </p>
                                </div>
                                <button className="shrink-0 text-muted hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary/5">
                                    <ExternalLink size={15} />
                                </button>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
