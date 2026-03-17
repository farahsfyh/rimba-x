'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Loader2, Download, Plus } from 'lucide-react'
import { ResumePreview } from '@/components/career/ResumePreview'
import { ATSScoreGauge } from '@/components/career/ATSScoreGauge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { ResumeVersion } from '@/types'
import toast from 'react-hot-toast'

const TONES = ['professional', 'friendly', 'technical', 'creative'] as const
type Tone = typeof TONES[number]

export default function CareerResumePage() {
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [active, setActive] = useState<ResumeVersion | null>(null)
  const [generating, setGenerating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Form state
  const [targetRole, setTargetRole] = useState('')
  const [versionName, setVersionName] = useState('')
  const [tone, setTone] = useState<Tone>('professional')

  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/career/resume')
      .then(r => r.ok ? r.json() : {})
      .then((json: { resumes?: ResumeVersion[] } | ResumeVersion[]) => {
        const data: ResumeVersion[] = Array.isArray(json) ? json : (json.resumes ?? [])
        setVersions(data)
        if (data.length > 0) setActive(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function generate() {
    if (!targetRole.trim()) { toast.error('Enter a target role first.'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/career/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: targetRole,
          tone,
          version_name: versionName || `${targetRole} (${new Date().toLocaleDateString('en-MY')})`,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? 'Generation failed.')
        return
      }
      const json = await res.json()
      const newVersion: ResumeVersion = json.resume ?? json.data
      setVersions(prev => [newVersion, ...prev])
      setActive(newVersion)
      toast.success('Resume generated! +100 XP')
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  async function exportPDF() {
    const el = document.getElementById('resume-preview')
    if (!el) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      const canvas = await html2canvas(el, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`${active?.version_name ?? 'resume'}.pdf`)
      toast.success('PDF exported!')
    } catch {
      toast.error('Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6" suppressHydrationWarning>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={20} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
        </div>
        <p className="text-sm text-gray-500">Generate an ATS-optimised resume with AI in seconds</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left panel — controls */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-700">Generate New Resume</h3>
            <Input label="Target Role" value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="e.g. Data Analyst" />
            <Input label="Version Name (optional)" value={versionName} onChange={e => setVersionName(e.target.value)} placeholder="e.g. FAANG Application" />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Tone</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TONES.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all
                      ${tone === t ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={generate} disabled={generating} className="w-full">
              {generating
                ? <><Loader2 size={14} className="animate-spin mr-2" /> Generating…</>
                : <><Plus size={14} className="mr-2" /> Generate Resume</>}
            </Button>
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">History</h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {versions.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setActive(v)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all
                      ${active?.id === v.id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/40'}`}
                  >
                    <p className="font-semibold text-gray-900 truncate">{v.version_name}</p>
                    <p className="text-gray-400">{v.target_role} · ATS {v.ats_score ?? '—'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Centre — preview */}
        <div className="lg:col-span-6" ref={previewRef}>
          {loading && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 h-96 animate-pulse" />
          )}
          {!loading && !active && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center h-64 gap-3">
              <FileText size={28} className="text-gray-200" />
              <p className="text-sm text-gray-400">No resume yet — generate one to get started</p>
            </div>
          )}
          {active && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} suppressHydrationWarning>
              <ResumePreview resume={active} />
            </motion.div>
          )}
        </div>

        {/* Right panel — ATS + actions */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {active && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3">
                <ATSScoreGauge score={active.ats_score ?? 0} />
                <Button variant="outline" onClick={exportPDF} disabled={exporting} className="w-full">
                  {exporting
                    ? <><Loader2 size={14} className="animate-spin mr-2" /> Exporting…</>
                    : <><Download size={14} className="mr-2" /> Export PDF</>}
                </Button>
              </div>

              {/* Tips */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Tips to Improve ATS Score</h3>
                <ul className="flex flex-col gap-1.5">
                  {[
                    'Use keywords from the job description',
                    'Quantify achievements with numbers',
                    'Keep formatting simple — no tables or graphics',
                    'List skills matching the target role',
                    'Use standard section headings',
                  ].map(tip => (
                    <li key={tip} className="text-xs text-gray-500 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
