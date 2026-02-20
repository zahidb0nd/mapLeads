import { useState } from 'react'
import { MapPin, Phone, Mail, ExternalLink, Copy, Check, Tag, FileText, Globe, Star } from 'lucide-react'
import Dialog from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { generateEmailTemplate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import useStore from '@/stores/useStore'

const STATUS_OPTIONS = [
  { value: 'new',           label: 'New Lead',       color: 'text-purple  bg-purple-subtle  border-purple/30' },
  { value: 'contacted',     label: 'Contacted',      color: 'text-warning bg-warning-subtle border-warning/30' },
  { value: 'interested',    label: 'Interested',     color: 'text-success bg-success-subtle border-success/30' },
  { value: 'closed',        label: 'Closed',         color: 'text-success bg-success-subtle border-success/30' },
  { value: 'not_interested',label: 'Not Interested', color: 'text-danger  bg-danger-subtle  border-danger/30' },
]

export default function BusinessDetails({ business, open, onClose }) {
  const [copiedField, setCopiedField] = useState(null)
  const [activeTab,   setActiveTab]   = useState('info')
  const [note,        setNote]        = useState('')
  const [noteSaved,   setNoteSaved]   = useState(false)
  const { success } = useToast()
  const { leadData, setLeadStatus, setLeadNote } = useStore()

  if (!business) return null

  const fsqId = business.fsq_id || business.id || business.name
  const currentLead  = leadData?.[fsqId] || {}
  const currentStatus = currentLead.status || 'new'
  const currentNote   = currentLead.note   || ''
  const emailTemplate = generateEmailTemplate(business)
  const mapsUrl = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}` : null

  const copy = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    success('Copied!', `${field} copied to clipboard.`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const tabs = [
    { id: 'info',   label: 'Info' },
    { id: 'status', label: 'Lead Status' },
    { id: 'notes',  label: 'Notes' },
    { id: 'email',  label: 'Email Template' },
  ]

  return (
    <Dialog open={open} onClose={onClose} title={business.name}>
      {/* Category badges */}
      <div className="flex flex-wrap gap-2 mb-4 -mt-2">
        {business.categories?.map(c => (
          <Badge key={c.id || c.name} variant="purple">{c.name}</Badge>
        ))}
        <Badge variant="green" className="flex items-center gap-1">
          <Globe className="h-3 w-3" />No website
        </Badge>
      </div>

      {/* Tab bar */}
      <div className="flex border-b mb-4 overflow-x-auto" style={{ borderColor: '#2E2A45' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-purple text-purple'
                : 'border-transparent text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* INFO */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          {(business.formatted_address || business.address) && (
            <InfoRow
              icon={MapPin} label="Address"
              value={business.formatted_address || business.address}
              onCopy={() => copy(business.formatted_address || business.address, 'Address')}
              copied={copiedField === 'Address'}
            />
          )}
          {business.tel && (
            <InfoRow
              icon={Phone} label="Phone" value={business.tel}
              href={`tel:${business.tel}`}
              onCopy={() => copy(business.tel, 'Phone')}
              copied={copiedField === 'Phone'}
            />
          )}
          {business.email && (
            <InfoRow
              icon={Mail} label="Email" value={business.email}
              href={`mailto:${business.email}`}
              onCopy={() => copy(business.email, 'Email')}
              copied={copiedField === 'Email'}
            />
          )}
          {business.rating && (
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="text-text-primary font-medium">{business.rating}</span>
              <span className="text-text-muted">({business.stats?.total_ratings || 0} reviews)</span>
            </div>
          )}

          <div className="rounded-xl border border-success/20 bg-success-subtle p-3">
            <p className="text-sm font-semibold text-success">🌐 No Website Detected</p>
            <p className="text-xs text-text-muted mt-0.5">This business has no website — a perfect lead for web or digital marketing services.</p>
          </div>

          {mapsUrl && (
            <Button fullWidth onClick={() => window.open(mapsUrl, '_blank')}>
              <ExternalLink className="h-4 w-4" />Open in Google Maps
            </Button>
          )}
        </div>
      )}

      {/* STATUS */}
      {activeTab === 'status' && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Track your outreach progress for this lead.</p>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { useStore.getState().setLeadStatus?.(fsqId, opt.value); success('Updated', `Marked as "${opt.label}".`) }}
              className={[
                'flex items-center justify-between w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                currentStatus === opt.value ? opt.color : 'border-border text-text-secondary hover:border-purple hover:text-text-primary',
              ].join(' ')}
            >
              {opt.label}
              {currentStatus === opt.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}

      {/* NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Add private notes about this lead.</p>
          <textarea
            className="input-base h-40 resize-none"
            placeholder="e.g. Spoke with owner John, interested in a quote..."
            defaultValue={currentNote}
            onChange={e => setNote(e.target.value)}
          />
          <Button fullWidth onClick={() => {
            useStore.getState().setLeadNote?.(fsqId, note || currentNote)
            setNoteSaved(true)
            success('Note saved', 'Your note has been saved.')
            setTimeout(() => setNoteSaved(false), 2000)
          }}>
            {noteSaved ? <><Check className="h-4 w-4" />Saved!</> : <><FileText className="h-4 w-4" />Save Note</>}
          </Button>
        </div>
      )}

      {/* EMAIL */}
      {activeTab === 'email' && (
        <div className="space-y-3">
          <p className="text-sm text-text-muted">Ready-to-use cold outreach email for this business.</p>
          <pre className="w-full rounded-xl border p-4 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto text-text-secondary"
            style={{ background: '#1C1828', borderColor: '#2E2A45' }}>
            {emailTemplate}
          </pre>
          <Button fullWidth onClick={() => { navigator.clipboard.writeText(emailTemplate); success('Copied!', 'Email template copied.') }}>
            <Copy className="h-4 w-4" />Copy Email Template
          </Button>
        </div>
      )}
    </Dialog>
  )
}

function InfoRow({ icon: Icon, label, value, href, onCopy, copied }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className="h-5 w-5 text-text-muted flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</p>
          {href ? (
            <a href={href} className="text-sm text-purple hover:text-purple-light truncate block">{value}</a>
          ) : (
            <p className="text-sm text-text-secondary truncate">{value}</p>
          )}
        </div>
      </div>
      <button
        onClick={onCopy}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors min-h-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated"
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}
