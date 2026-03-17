'use client'

import { Award, CheckCircle, ExternalLink } from 'lucide-react'

interface CertificateBadgeProps {
  cert_name: string
  provider?: string
  earned_at?: string | null
  cert_url?: string | null
  verified?: boolean
  compact?: boolean
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-MY', { month: 'short', year: 'numeric' })
}

export function CertificateBadge({ cert_name, provider, earned_at, cert_url, verified, compact }: CertificateBadgeProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
        <Award size={12} className="text-amber-500 shrink-0" />
        <span className="text-xs font-medium text-amber-700 truncate max-w-40">{cert_name}</span>
        {verified && <CheckCircle size={10} className="text-green-500 shrink-0" />}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all flex items-start gap-3">
      {/* Icon */}
      <div className="bg-amber-50 rounded-lg p-2 shrink-0">
        <Award size={20} className="text-amber-500" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{cert_name}</h4>
          {verified && (
            <span className="inline-flex items-center gap-0.5 text-[9px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0">
              <CheckCircle size={8} />
              Verified
            </span>
          )}
        </div>
        {provider && <p className="text-xs text-gray-400 truncate">{provider}</p>}
        {earned_at && (
          <p className="text-[10px] text-gray-400 mt-1">{formatDate(earned_at)}</p>
        )}
      </div>

      {cert_url && (
        <a
          href={cert_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-primary hover:text-primary-hover transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  )
}
