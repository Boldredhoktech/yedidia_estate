// components/kwaku/AgentManagementTable.tsx

'use client'

import { useState }          from 'react'
import type { ManagedAgent } from '@/app/kwaku/agents/page'

const STATUS_STYLES: Record<string, string> = {
    active:  'bg-emerald-900 text-emerald-400',
    pending: 'bg-amber-900   text-amber-400',
    blocked: 'bg-red-950     text-red-400',
}

export default function AgentManagementTable({
                                                 agents,
                                             }: {
    agents: ManagedAgent[]
}) {
    const [list,       setList]       = useState<ManagedAgent[]>(agents)
    const [loadingId,  setLoadingId]  = useState<string | null>(null)
    const [editingId,  setEditingId]  = useState<string | null>(null)
    const [editForm,   setEditForm]   = useState<Partial<ManagedAgent>>({})
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    // ── Status action ──
    async function handleStatusChange(
        agentId: string,
        action: 'activate' | 'block' | 'unblock'
    ) {
        setLoadingId(agentId)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/kwaku/agents', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ agentId, action }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Action failed.'); return }

            setList(prev => prev.map(a => {
                if (a.id !== agentId) return a
                const newStatus = action === 'activate' || action === 'unblock'
                    ? 'active' : 'blocked'
                return { ...a, status: newStatus }
            }))

            setSuccessMsg(`Agent ${action}d successfully.`)
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch {
            setErrMsg('Network error. Please try again.')
        } finally {
            setLoadingId(null)
        }
    }

    // ── Edit profile ──
    function startEdit(agent: ManagedAgent) {
        setEditingId(agent.id)
        setEditForm({
            full_name:      agent.full_name,
            phone_call:     agent.phone_call     ?? '',
            phone_whatsapp: agent.phone_whatsapp ?? '',
        })
    }

    async function saveEdit(agentId: string) {
        setLoadingId(agentId)
        setErrMsg(null)

        try {
            const res  = await fetch('/api/kwaku/agents', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    agentId,
                    action:         'edit_profile',
                    full_name:      editForm.full_name,
                    phone_call:     editForm.phone_call     || null,
                    phone_whatsapp: editForm.phone_whatsapp || null,
                }),
            })
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Edit failed.'); return }

            setList(prev => prev.map(a =>
                a.id !== agentId ? a : {
                    ...a,
                    full_name:      editForm.full_name      ?? a.full_name,
                    phone_call:     editForm.phone_call     ?? null,
                    phone_whatsapp: editForm.phone_whatsapp ?? null,
                }
            ))

            setEditingId(null)
            setSuccessMsg('Agent profile updated.')
            setTimeout(() => setSuccessMsg(null), 3000)

        } catch {
            setErrMsg('Network error.')
        } finally {
            setLoadingId(null)
        }
    }

    if (list.length === 0) {
        return (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12
                      text-center">
                <p className="text-gray-500 text-sm">No agents registered yet.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">

            {/* Feedback */}
            {errMsg && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-sm text-red-400 font-medium">{errMsg}</p>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-3">
                    <p className="text-sm text-emerald-400 font-medium">{successMsg}</p>
                </div>
            )}

            {/* Cards */}
            <div className="flex flex-col gap-3">
                {list.map(agent => (
                    <div key={agent.id}
                         className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

                        {/* Editing mode */}
                        {editingId === agent.id ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                    Editing — {agent.email}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={editForm.full_name ?? ''}
                                        onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                                        placeholder="Full name"
                                        className={inputClass}
                                    />
                                    <input
                                        type="tel"
                                        value={editForm.phone_call ?? ''}
                                        onChange={e => setEditForm(p => ({ ...p, phone_call: e.target.value }))}
                                        placeholder="Call number"
                                        className={inputClass}
                                    />
                                    <input
                                        type="tel"
                                        value={editForm.phone_whatsapp ?? ''}
                                        onChange={e => setEditForm(p => ({ ...p, phone_whatsapp: e.target.value }))}
                                        placeholder="WhatsApp number"
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => saveEdit(agent.id)}
                                        disabled={loadingId === agent.id}
                                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700
                               text-white text-xs font-bold px-4 py-2 rounded-xl
                               transition-colors duration-150 disabled:opacity-50"
                                    >
                                        {loadingId === agent.id ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-200
                               px-4 py-2 rounded-xl hover:bg-gray-800
                               transition-colors duration-150"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center
                                    justify-center flex-shrink-0">
                      <span className="text-indigo-300 font-bold text-xs">
                        {agent.full_name.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm truncate">
                                                {agent.full_name}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">{agent.email}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize
                                      ${STATUS_STYLES[agent.status] ?? 'bg-gray-800 text-gray-400'}`}>
                      {agent.status}
                    </span>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 pl-10">
                                        <span>📋 {agent.listing_count} listing{agent.listing_count !== 1 ? 's' : ''}</span>
                                        {agent.phone_call && <span>📞 {agent.phone_call}</span>}
                                        {agent.phone_whatsapp && <span>💬 {agent.phone_whatsapp}</span>}
                                        {agent.active_sub && (
                                            <span className="text-indigo-400 font-semibold">
                        🎫 {agent.active_sub.formula_key} · expires{' '}
                                                {new Date(agent.active_sub.expires_at).toLocaleDateString('en-GH', {
                                                    day: 'numeric', month: 'short',
                                                })}
                      </span>
                                        )}
                                        <span>
                      Joined {new Date(agent.created_at).toLocaleDateString('en-GH', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                    </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">

                                    {/* Validate pending */}
                                    {agent.status === 'pending' && (
                                        <ActionBtn
                                            label="Validate"
                                            color="emerald"
                                            loading={loadingId === agent.id}
                                            onClick={() => handleStatusChange(agent.id, 'activate')}
                                        />
                                    )}

                                    {/* Block active */}
                                    {agent.status === 'active' && (
                                        <ActionBtn
                                            label="Block"
                                            color="red"
                                            loading={loadingId === agent.id}
                                            onClick={() => handleStatusChange(agent.id, 'block')}
                                        />
                                    )}

                                    {/* Unblock */}
                                    {agent.status === 'blocked' && (
                                        <ActionBtn
                                            label="Unblock"
                                            color="amber"
                                            loading={loadingId === agent.id}
                                            onClick={() => handleStatusChange(agent.id, 'unblock')}
                                        />
                                    )}

                                    {/* Edit */}
                                    <button
                                        onClick={() => startEdit(agent)}
                                        className="text-xs font-bold text-gray-400 hover:text-white
                               border border-gray-700 hover:border-gray-500
                               px-3 py-1.5 rounded-xl transition-colors duration-150"
                                    >
                                        Edit
                                    </button>

                                </div>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-700 hover:bg-emerald-600 text-white',
    red:     'bg-red-800 hover:bg-red-700 text-white',
    amber:   'bg-amber-700 hover:bg-amber-600 text-white',
}

function ActionBtn({
                       label, color, loading, onClick,
                   }: {
    label:   string
    color:   string
    loading: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl
                  transition-colors duration-150 disabled:opacity-50
                  ${colorMap[color] ?? 'bg-gray-700 text-white'}`}
        >
            {loading ? '…' : label}
        </button>
    )
}

const inputClass = `
  w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm
  rounded-xl px-3 py-2 placeholder-gray-600
  focus:outline-none focus:ring-2 focus:ring-indigo-500
  focus:border-indigo-500 transition-colors duration-150
`