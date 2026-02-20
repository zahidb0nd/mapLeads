import { useState } from 'react'
import { MapPin, Phone, Mail, ExternalLink, Copy, Check, Tag, FileText, Mail as MailIcon, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistance, generateEmailTemplate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import useStore from '@/stores/useStore'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
  { value: 'interested', label: 'Interested', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  { value: 'closed', label: 'Closed', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-red-500/10 text-red-500 border-red-500/30' },
]

export default function BusinessDetails({ business, open, onClose }) {
  const [copiedField, setCopiedField] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)
  const { success } = useToast()
  const { leadData, setLeadStatus, setLeadNote } = useStore()

  if (!business) return null

  const fsqId = business.fsq_id || business.id || business.name
  const currentLead = leadData[fsqId] || {}
  const currentStatus = currentLead.status || 'new'
  const currentNote = currentLead.note || ''

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    success('Copied!', `${field} copied to clipboard.`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleStatusChange = (status) => {
    setLeadStatus(fsqId, status)
    const label = STATUS_OPTIONS.find(s => s.value === status)?.label
    success('Status updated', `Lead marked as "${label}".`)
  }

  const handleSaveNote = () => {
    setLeadNote(fsqId, note || currentNote)
    setNoteSaved(true)
    success('Note saved', 'Your note has been saved locally.')
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const emailTemplate = generateEmailTemplate(business)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailTemplate)
    success('Email copied!', 'Template copied to clipboard.')
  }

  const statusStyle = STATUS_OPTIONS.find(s => s.value === currentStatus)

  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'status', label: 'Lead Status' },
    { id: 'notes', label: 'Notes' },
    { id: 'email', label: 'Email Template' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full" onClose={onClose}>
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl pr-8">{business.name}</DialogTitle>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {business.categories?.map(c => (
              <Badge key={c.id} variant="secondary" className="text-xs">{c.name}</Badge>
            ))}
            <span className={cn('text-xs border rounded-full px-2 py-0.5', statusStyle?.color)}>
              {statusStyle?.label}
            </span>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {business.distance && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-4 w-4" /> {formatDistance(business.distance)} away
                </p>
              )}

              {(business.formatted_address || business.address) && (
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Address</p>
                      <p className="text-sm text-muted-foreground">{business.formatted_address || business.address}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.formatted_address || business.address, 'Address')}>
                    {copiedField === 'Address' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {business.tel && (
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 gap-3">
                    <Phone className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Phone</p>
                      <a href={`tel:${business.tel}`} className="text-sm text-primary-500 hover:underline">{business.tel}</a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.tel, 'Phone')}>
                    {copiedField === 'Phone' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              {business.email && (
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1 gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a href={`mailto:${business.email}`} className="text-sm text-primary-500 hover:underline">{business.email}</a>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(business.email, 'Email')}>
                    {copiedField === 'Email' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm font-medium text-green-500">🌐 No Website Detected</p>
                <p className="text-xs text-muted-foreground mt-0.5">Great lead for web design or digital marketing services.</p>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button className="flex-1" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`, '_blank')}>
                  Open in Google Maps
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
              </div>
            </div>
          )}

          {/* STATUS TAB */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Track your outreach progress for this lead.</p>
              <div className="grid grid-cols-1 gap-2">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-all',
                      currentStatus === opt.value
                        ? opt.color + ' border-current'
                        : 'border-border hover:border-muted-foreground text-foreground'
                    )}
                  >
                    <span>{opt.label}</span>
                    {currentStatus === opt.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Add private notes about this lead.</p>
              <textarea
                className="w-full h-40 rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Spoke with owner John, interested in a quote..."
                defaultValue={currentNote}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button onClick={handleSaveNote} className="w-full" size="sm">
                {noteSaved ? <><Check className="h-4 w-4 mr-2" /> Saved!</> : <><FileText className="h-4 w-4 mr-2" /> Save Note</>}
              </Button>
            </div>
          )}

          {/* EMAIL TEMPLATE TAB */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Ready-to-use cold outreach email for this business.</p>
              <pre className="w-full rounded-lg border border-border bg-muted p-3 text-xs whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                {emailTemplate}
              </pre>
              <Button onClick={handleCopyEmail} className="w-full" size="sm">
                <Copy className="h-4 w-4 mr-2" /> Copy Email Template
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
