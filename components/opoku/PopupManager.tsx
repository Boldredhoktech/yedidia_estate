// components/opoku/PopupManager.tsx

'use client'

import { useState, useEffect, FormEvent } from 'react'
import Image                              from 'next/image'

interface Popup {
    id:              string
    title:           string | null
    image_url:       string
    link_url:        string | null
    is_active:       boolean
    display_from:    string | null
    display_until:   string | null
    created_at:      string
    created_by_name: string
}

const emptyForm = {
    title: '', image_url: '', link_url: '',
    display_from: '', display_until: '', is_active: false,
}

export default function PopupManager() {
    const [popups,     setPopups]     = useState<Popup[]>([])
    const [loading,    setLoading]    = useState(true)
    const [showForm,   setShowForm]   = useState(false)
    const [form,       setForm]       = useState(emptyForm)
    const [formLoading,setFormLoading]= useState(false)
    const [formErr,    setFormErr]    = useState('')
    const [actionId,   setActionId]   = useState<string | null>(null)
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    useEffect(() => { fetchPopups() }, [])

    async function fetchPopups() {
        setLoading(true)
        try {
            const res  = await fetch('/api/opoku/popups')
            const json = await res.json()
            if (res.ok) setPopups(json.popups ?? [])
        } catch { setErrMsg('Failed to load popups.') }
        finally { setLoading(false) }
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault()
        if (formLoading) return
        setFormLoading(true)
        setFormErr('')

        try {
            const res  = await fetch('/api/opoku/popups', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    title:         form.title.trim()         || null,
                    image_url:     form.image_url.trim(),
                    link_url:      form.link_url.trim()      || null,
                    display_from:  form.display_from         || null,
                    display_until: form.display_until        || null,
                    is_active:     form.is_active,
                }),
            })
            const json = await res.json()

            if (!res.ok) { setFormErr(json.error ?? 'Failed to create.'); return }

            setPopups(prev => [{ ...json.popup, created_by_name: 'You' }, ...prev])
            setForm(emptyForm)
            setShowForm(false)
            showSuccess('Popup created successfully.')
        } catch { setFormErr('Network error.') }
        finally { setFormLoading(false) }
    }

    async function handleToggle(popup: Popup) {
        setActionId(popup.id)
        try {
            const res = await fetch('/api/opoku/popups', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: popup.id, is_active: !popup.is_active }),
            })
            if (res.ok) {
                // API deactivates all others when activating one
                setPopups(prev => prev.map(p => ({
                    ...p,
                    is_active: p.id === popup.id ? !popup.is_active : false,
                })))
                showSuccess(popup.is_active ? 'Popup deactivated.' : 'Popup activated — now live on site.')
            }
        } catch { setErrMsg('Network error.') }
        finally { setActionId(null) }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this popup permanently?')) return
        setActionId(id)
        try {
            const res = await fetch('/api/opoku/popups', {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id }),
            })
            if (res.ok) {
                setPopups(prev => prev.filter(p => p.id !== id))
                showSuccess('Popup deleted.')
            }
        } catch { setErrMsg('Network error.') }
        finally { setActionId(null) }
    }

    function showSuccess(msg: string) {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(null), 3000)
    }

    return (
        <div className="flex flex-col gap-5">

            {/* Toolbar */}
            <div className="flex justify-end">
                <button
                    onClick={() => { setShowForm(p => !p); setFormErr('') }}
                    className="flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-500
                     text-black font-extrabold text-xs px-4 py-2 rounded-xl
                     transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    New Popup
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="bg-gray-900 border border-yellow-900/40 rounded-2xl p-6">
                    <h3 className="text-white font-bold text-sm mb-4">New Popup / Flyer</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Title <span className="text-gray-600 font-normal">(optional)</span></label>
                            <input type="text" value={form.title}
                                   onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                   placeholder="Welcome to Yedidia Estate!" className={inp} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Image URL <Req /></label>
                            <input type="url" required value={form.image_url}
                                   onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                                   placeholder="https://... (from Supabase Storage)" className={inp} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Link URL <span className="text-gray-600 font-normal">(optional)</span></label>
                            <input type="url" value={form.link_url}
                                   onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))}
                                   placeholder="https://... (opens on click)" className={inp} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Display from</label>
                            <input type="date" value={form.display_from}
                                   onChange={e => setForm(p => ({ ...p, display_from: e.target.value }))}
                                   className={inp} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Display until</label>
                            <input type="date" value={form.display_until}
                                   onChange={e => setForm(p => ({ ...p, display_until: e.target.value }))}
                                   className={inp} />
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                            <input
                                type="checkbox" id="is_active"
                                checked={form.is_active}
                                onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                className="w-4 h-4 accent-yellow-500 rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-gray-300">
                                Activate immediately on save
                            </label>
                        </div>

                        {formErr && (
                            <div className="sm:col-span-2 bg-red-950 border border-red-800 rounded-xl p-3">
                                <p className="text-sm text-red-400">{formErr}</p>
                            </div>
                        )}

                        <div className="sm:col-span-2 flex gap-3">
                            <button
                                type="submit" disabled={formLoading}
                                className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-yellow-900
                           text-black font-extrabold text-sm px-5 py-2.5 rounded-xl
                           transition-colors"
                            >
                                {formLoading ? 'Saving…' : 'Save Popup'}
                            </button>
                            <button
                                type="button" onClick={() => setShowForm(false)}
                                className="text-gray-400 hover:text-gray-200 text-sm font-semibold
                           px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {/* Feedback */}
            {errMsg     && <FB type="error"   msg={errMsg}     />}
            {successMsg && <FB type="success" msg={successMsg} />}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col gap-3">
                    {[1,2].map(i => (
                        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl
                                    h-28 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && popups.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 text-sm">No popups created yet.</p>
                </div>
            )}

            {/* Popup list */}
            {!loading && popups.length > 0 && (
                <div className="flex flex-col gap-3">
                    {popups.map(popup => (
                        <div key={popup.id}
                             className={`bg-gray-900 border rounded-2xl p-5
                             ${popup.is_active
                                 ? 'border-yellow-600/40'
                                 : 'border-gray-800'
                             }`}>
                            <div className="flex gap-4">

                                {/* Thumbnail */}
                                <div className="relative w-24 h-16 flex-shrink-0 rounded-xl
                                overflow-hidden bg-gray-800">
                                    <Image
                                        src={popup.image_url}
                                        alt={popup.title ?? 'Popup'}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                        unoptimized
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {popup.is_active && (
                                            <span className="text-xs font-bold bg-yellow-600 text-black
                                       px-2.5 py-0.5 rounded-full">
                        LIVE
                      </span>
                                        )}
                                        <p className="font-bold text-white text-sm truncate">
                                            {popup.title ?? 'Untitled popup'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        {popup.display_from && (
                                            <span>From {new Date(popup.display_from).toLocaleDateString('en-GH', {
                                                day: 'numeric', month: 'short',
                                            })}</span>
                                        )}
                                        {popup.display_until && (
                                            <span>Until {new Date(popup.display_until).toLocaleDateString('en-GH', {
                                                day: 'numeric', month: 'short',
                                            })}</span>
                                        )}
                                        {popup.link_url && <span>🔗 Has link</span>}
                                        <span>By {popup.created_by_name}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(popup)}
                                        disabled={actionId === popup.id}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl
                                transition-colors disabled:opacity-50
                                ${popup.is_active
                                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                                            : 'bg-yellow-700 hover:bg-yellow-600 text-black'
                                        }`}
                                    >
                                        {actionId === popup.id ? '…'
                                            : popup.is_active ? 'Deactivate' : 'Activate'
                                        }
                                    </button>
                                    <button
                                        onClick={() => handleDelete(popup.id)}
                                        disabled={actionId === popup.id}
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

const lbl = 'text-sm font-bold text-gray-400'
const inp = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm
  rounded-xl px-4 py-2.5 placeholder-gray-600
  focus:outline-none focus:ring-2 focus:ring-yellow-600
  focus:border-yellow-600 hover:border-gray-600
  transition-colors duration-150
`
const Req = () => <span className="text-yellow-500 ml-0.5">*</span>

function FB({ type, msg }: { type: 'error' | 'success'; msg: string }) {
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