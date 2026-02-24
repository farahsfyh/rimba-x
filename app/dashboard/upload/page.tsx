'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, CheckCircle2, AlertCircle, Trash2, Upload, FileSpreadsheet, File } from 'lucide-react'
import { FileUpload } from '@/components/ui/FileUpload'
import { parsePDF, parseDOCX, parseTXT, parseXLSX } from '@/lib/parsers'
import { cn } from '@/lib/utils'

interface ParsedFile {
    id: string
    name: string
    type: string
    size: number
    status: 'parsing' | 'done' | 'error'
    wordCount?: number
    error?: string
}

function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
    if (type.includes('pdf')) return FileText
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet
    return File
}

export default function UploadPage() {
    const [files, setFiles] = useState<ParsedFile[]>([])

    const handleFiles = async (selected: File[]) => {
        for (const file of selected) {
            const id = crypto.randomUUID()
            setFiles(prev => [...prev, { id, name: file.name, type: file.type, size: file.size, status: 'parsing' }])
            try {
                let parsed
                if (file.type === 'application/pdf') parsed = await parsePDF(file)
                else if (file.type.includes('wordprocessingml')) parsed = await parseDOCX(file)
                else if (file.type.includes('sheet')) parsed = await parseXLSX(file)
                else parsed = await parseTXT(file)
                const wordCount = parsed.text.split(/\s+/).filter(Boolean).length
                setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'done', wordCount } : f))
            } catch {
                setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: 'Failed to parse file' } : f))
            }
        }
    }

    const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id))

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
                <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
                <span>Files are parsed locally in your browser. Cloud storage will be enabled once Supabase storage is fully configured.</span>
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
                                            {file.status === 'done' && file.wordCount && ` · ~${file.wordCount.toLocaleString()} words`}
                                            {file.status === 'error' && ` · ${file.error}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {file.status === 'parsing' && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                                        {file.status === 'done' && <CheckCircle2 size={18} className="text-success" />}
                                        {file.status === 'error' && <AlertCircle size={18} className="text-error" />}
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
        </div>
    )
}
