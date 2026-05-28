// components/kwaku/LegalPartnersManager.tsx

'use client'

import { useState, useEffect, FormEvent } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type PartnerType = 'notaire' | 'avocat' | 'huissier'

interface LegalPartner {
    id:           string
    name:         string
    type:         PartnerType
    city:         string
    phone:        string | null
    email:        string | null
    address:      string | null
    notes:        string | null
    is_active:    boolean
    created_at:   string
    added_by_name:string
}

type FormState = 'idle' | 'loading' | 'error' | 'success'

const TYPE_LABELS: Record<PartnerType, string> = {
    notaire:  'Notaire',
    avocat:   'Avocat',
    huissier: 'Huissier',
}

const TYPE_COLORS: Record<PartnerType, string> = {
    notaire:  'bg-blue-900 text-blue-300',
    avocat:   'bg-purple-900 text-purple-300',
    huissier: 'bg-amber-900 text-amber-300',
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function LegalPartnersManager() {
    const [partners,   setPartners]   = useState<LegalPartner[]>([])
    const [loading,    setLoading]    = useState(true)
    const [showForm,   setShowForm]   = useState(false)
    const [actionId,   setActionId]   = useState<string | null>(null)
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<PartnerType | 'all'>('all')

    // ── Form state ──
    const [form, setForm] = useState({
        name: '', type: 'notaire' as PartnerType,
        city: '', phone: '', email: '',
        address: '', notes: '',
    })
    const [formState, setFormState] = useState<FormState>('idle')
    const [formErr,   setFormErr]   = useState('')

    // ── Fetch ──
    useEffect(() => { fetchPartners() }, [])

    async function fetchPartners() {
        setLoading(true)
        try {
            const res  = await fetch('/api/kwaku/legal-partners')
            const json = await res.json()
            if (res.ok) setPartners(json.partners ?? [])
        } catch {
            setErrMsg('Failed to load partners.')
        } finally {
            setLoading(false)
        }
    }

    // ── Add partner ──
    async function handleAdd(e: FormEvent) {
        e.preventDefault()
        if (formState === 'loading') return
        setFormState('loading')
        setFormErr('')

        try {
            const res  = await fetch('/api/kwaku/legal-partners', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    name:    form.name.trim(),
                    type:    form.type,
                    city:    form.city.trim(),
                    phone:   form.phone.trim()   || null,
                    email:   form.email.trim()   || null,
                    address: form.address.trim() || null,
                    notes:   form.notes.trim()   || null,
                }),
            })
            const json = await res.json()

            if (!res.ok) { setFormErr(json.error ?? 'Failed to add.'); setFormState('error'); return }

            setPartners(prev => [{ ...json.partner, added_by_name: 'You' }, ...prev])
            setForm({ name: '', type: 'notaire', city: '', phone: '', email: '', address: '', notes: '' })
            setShowForm(false)
            setFormState('idle')
            setSuccessMsg('Partner added successfully.')
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch {
            setFormErr('Network error.')
            setFormState('error')
        }
    }

    // ── Toggle active ──
    async function handleToggle(partner: LegalPartner) {
        setActionId(partner.id)
        try {
            const res = await fetch('/api/kwaku/legal-partners', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: partner.id, is_active: !partner.is_active }),
            })
            if (res.ok) {
                setPartners(prev => prev.map(p =>
                    p.id === partner.id ? { ...p, is_active: !p.is_active } : p
                ))
            }
        } catch { /* silent */ }
        finally { setActionId(null) }
    }

    // ── Delete ──
    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
        setActionId(id)
        try {
            const res = await fetch('/api/kwaku/legal-partners', {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id }),
            })
            if (res.ok) {
                setPartners(prev => prev.filter(p => p.id !== id))
                setSuccessMsg('Partner deleted.')
                setTimeout(() => setSuccessMsg(null), 3000)
            }
        } catch { /* silent */ }
        finally { setActionId(null) }
    }

    const filtered = filterType === 'all'
        ? partners
        : partners.filter(p => p.type === filterType)

    return (
        <div className="flex flex-col gap-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 justify-between">

                {/* Filter tabs */}
                <div className="flex gap-2">
                    {(['all', 'notaire', 'avocat', 'huissier'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors
                          ${filterType === t
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            {t === 'all' ? `All (${partners.length})` : TYPE_LABELS[t]}
                        </button>
                    ))}
                </div>

                {/* Add button */}
                <button
                    onClick={() => setShowForm(prev => !prev)}
                    className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600
                     text-white font-bold text-xs px-4 py-2 rounded-xl
                     transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    Add Partner
                </button>

            </div>

            {/* Add form */}
            {showForm && (
                <div className="bg-gray-900 border border-indigo-800 rounded-2xl p-5">
                    <h3 className="text-white font-bold text-sm mb-4">New Legal Partner</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Name <Req /></label>
                            <input type="text" required value={form.name}
                                   onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                   placeholder="Cabinet Mensah & Associés"
                                   className={inputClass} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Type <Req /></label>
                            <select value={form.type}
                                    onChange={e => setForm(p => ({ ...p, type: e.target.value as PartnerType }))}
                                    className={inputClass}>
                                <option value="notaire">Notaire</option>
                                <option value="avocat">Avocat</option>
                                <option value="huissier">Huissier</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>City <Req /></label>
                            <input type="text" required value={form.city}
                                   onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                   placeholder="Accra" className={inputClass} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Phone</label>
                            <input type="tel" value={form.phone}
                                   onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                   placeholder="+233 XX XXX XXXX" className={inputClass} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Email</label>
                            <input type="email" value={form.email}
                                   onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                   placeholder="contact@cabinet.com" className={inputClass} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={labelClass}>Address</label>
                            <input type="text" value={form.address}
                                   onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                                   placeholder="Street, District" className={inputClass} />
                        </div>

                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                            <label className={labelClass}>Notes</label>
                            <textarea rows={2} value={form.notes}
                                      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                                      placeholder="Specialisations, languages, additional info…"
                                      className={`${inputClass} resize-none`} />
                        </div>

                        {formErr && (
                            <div className="sm:col-span-2 bg-red-950 border border-red-800
                              rounded-xl p-3">
                                <p className="text-sm text-red-400">{formErr}</p>
                            </div>
                        )}

                        <div className="sm:col-span-2 flex gap-3">
                            <button
                                type="submit"
                                disabled={formState === 'loading'}
                                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600
                           disabled:bg-brand-800 text-white font-bold text-sm
                           px-5 py-2.5 rounded-xl transition-colors"
                            >
                                {formState === 'loading' ? 'Saving…' : 'Save Partner'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-200 text-sm font-semibold
                           px-4 py-2.5 rounded-xl hover:bg-gray-800
                           transition-colors duration-150"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Feedback */}
            {errMsg     && <FeedbackBox type="error"   msg={errMsg}     />}
            {successMsg && <FeedbackBox type="success" msg={successMsg} />}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-gray-900 border border-gray-800
                                    rounded-2xl h-24 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 text-sm">
                        {partners.length === 0
                            ? 'No legal partners yet. Add your first one.'
                            : 'No partners match this filter.'
                        }
                    </p>
                </div>
            )}

            {/* Partners list */}
            {!loading && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                    {filtered.map(partner => (
                        <div key={partner.id}
                             className={`bg-gray-900 border rounded-2xl p-5 transition-opacity
                             ${!partner.is_active ? 'opacity-50 border-gray-800' : 'border-gray-700'}`}>
                            <div className="flex flex-col sm:flex-row gap-4">

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                      ${TYPE_COLORS[partner.type]}`}>
                      {TYPE_LABELS[partner.type]}
                    </span>
                                        {!partner.is_active && (
                                            <span className="text-xs bg-gray-800 text-gray-500
                                       px-2.5 py-1 rounded-full font-bold">
                        Inactive
                      </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-white text-sm">{partner.name}</h3>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        <span>📍 {partner.city}</span>
                                        {partner.phone && <span>📞 {partner.phone}</span>}
                                        {partner.email && (
                                            <a href={`mailto:${partner.email}`}
                                               className="text-indigo-400 hover:text-indigo-200">
                                                ✉️ {partner.email}
                                            </a>
                                        )}
                                        {partner.address && <span>🏢 {partner.address}</span>}
                                    </div>

                                    {partner.notes && (
                                        <p className="text-xs text-gray-500 italic">{partner.notes}</p>
                                    )}

                                    <p className="text-xs text-gray-700">
                                        Added by {partner.added_by_name} ·{' '}
                                        {new Date(partner.created_at).toLocaleDateString('en-GH', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(partner)}
                                        disabled={actionId === partner.id}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl
                                transition-colors disabled:opacity-50
                                ${partner.is_active
                                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                            : 'bg-emerald-800 hover:bg-emerald-700 text-emerald-200'
                                        }`}
                                    >
                                        {actionId === partner.id ? '…'
                                            : partner.is_active ? 'Deactivate' : 'Activate'}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(partner.id, partner.name)}
                                        disabled={actionId === partner.id}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl
                               bg-red-950 hover:bg-red-900 text-red-400
                               transition-colors disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const labelClass = 'text-sm font-bold text-gray-300'
const inputClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm
  rounded-xl px-4 py-2.5 placeholder-gray-600
  focus:outline-none focus:ring-2 focus:ring-indigo-500
  focus:border-indigo-500 hover:border-gray-600
  transition-colors duration-150
`
const Req = () => <span className="text-brand-500 ml-0.5">*</span>

function FeedbackBox({ type, msg }: { type: 'error' | 'success'; msg: string }) {
    return (
        <div className={`rounded-xl p-3 border text-sm font-medium
                     ${type === 'error'
            ? 'bg-red-950 border-red-800 text-red-400'
            : 'bg-emerald-950 border-emerald-800 text-emerald-400'
        }`}>
            {msg}
        </div>
    )
}