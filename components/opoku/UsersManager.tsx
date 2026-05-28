// components/opoku/UsersManager.tsx

'use client'

import { useState, useEffect, FormEvent } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type UserRole = 'agent_validator' | 'comptable'

interface ManagedUser {
    id:             string
    role:           UserRole
    full_name:      string
    email:          string
    phone_call:     string | null
    phone_whatsapp: string | null
    status:         string
    created_at:     string
    last_login_at:  string | null
}

type PanelMode = 'list' | 'create' | 'edit'

const ROLE_LABELS: Record<UserRole, string> = {
    agent_validator: 'Agent Validator',
    comptable:       'Accountant',
}

const ROLE_COLORS: Record<UserRole, string> = {
    agent_validator: 'bg-indigo-900 text-indigo-300',
    comptable:       'bg-purple-900 text-purple-300',
}

const STATUS_STYLES: Record<string, string> = {
    active:  'bg-emerald-900 text-emerald-400',
    blocked: 'bg-red-950 text-red-400',
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function UsersManager() {
    const [users,      setUsers]      = useState<ManagedUser[]>([])
    const [loading,    setLoading]    = useState(true)
    const [mode,       setMode]       = useState<PanelMode>('list')
    const [editTarget, setEditTarget] = useState<ManagedUser | null>(null)
    const [actionId,   setActionId]   = useState<string | null>(null)
    const [errMsg,     setErrMsg]     = useState<string | null>(null)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all')

    // ── Create form ──
    const emptyForm = {
        full_name: '', email: '', password: '', confirmPassword: '',
        role: 'agent_validator' as UserRole,
        phone_call: '', phone_whatsapp: '',
    }
    const [form,      setForm]      = useState(emptyForm)
    const [formErr,   setFormErr]   = useState('')
    const [formLoading, setFormLoading] = useState(false)

    useEffect(() => { fetchUsers() }, [])

    async function fetchUsers() {
        setLoading(true)
        try {
            const res  = await fetch('/api/opoku/users')
            const json = await res.json()
            if (res.ok) setUsers(json.users ?? [])
            else setErrMsg(json.error)
        } catch {
            setErrMsg('Failed to load users.')
        } finally {
            setLoading(false)
        }
    }

    // ── Create ──
    async function handleCreate(e: FormEvent) {
        e.preventDefault()
        if (formLoading) return

        if (form.password !== form.confirmPassword) {
            setFormErr('Passwords do not match.')
            return
        }

        setFormLoading(true)
        setFormErr('')

        try {
            const res  = await fetch('/api/opoku/users', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    full_name:      form.full_name.trim(),
                    email:          form.email.trim(),
                    password:       form.password,
                    role:           form.role,
                    phone_call:     form.phone_call.trim()     || null,
                    phone_whatsapp: form.phone_whatsapp.trim() || null,
                }),
            })
            const json = await res.json()

            if (!res.ok) { setFormErr(json.error ?? 'Failed to create.'); return }

            setUsers(prev => [json.user, ...prev])
            setForm(emptyForm)
            setMode('list')
            showSuccess('User created successfully.')

        } catch {
            setFormErr('Network error.')
        } finally {
            setFormLoading(false)
        }
    }

    // ── Edit / Save ──
    async function handleEdit(e: FormEvent) {
        e.preventDefault()
        if (!editTarget || formLoading) return

        if (form.password && form.password !== form.confirmPassword) {
            setFormErr('Passwords do not match.')
            return
        }

        setFormLoading(true)
        setFormErr('')

        try {
            const payload: Record<string, unknown> = {
                id:             editTarget.id,
                full_name:      form.full_name.trim(),
                email:          form.email.trim(),
                phone_call:     form.phone_call.trim()     || null,
                phone_whatsapp: form.phone_whatsapp.trim() || null,
            }
            if (form.password) payload.password = form.password

            const res  = await fetch('/api/opoku/users', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload),
            })
            const json = await res.json()

            if (!res.ok) { setFormErr(json.error ?? 'Failed to update.'); return }

            setUsers(prev => prev.map(u =>
                u.id !== editTarget.id ? u : {
                    ...u,
                    full_name:      form.full_name.trim(),
                    email:          form.email.trim(),
                    phone_call:     form.phone_call.trim()     || null,
                    phone_whatsapp: form.phone_whatsapp.trim() || null,
                }
            ))
            setMode('list')
            setEditTarget(null)
            showSuccess('User updated successfully.')

        } catch {
            setFormErr('Network error.')
        } finally {
            setFormLoading(false)
        }
    }

    function startEdit(user: ManagedUser) {
        setEditTarget(user)
        setForm({
            full_name:      user.full_name,
            email:          user.email,
            password:       '',
            confirmPassword:'',
            role:           user.role,
            phone_call:     user.phone_call      ?? '',
            phone_whatsapp: user.phone_whatsapp  ?? '',
        })
        setFormErr('')
        setMode('edit')
    }

    // ── Toggle status ──
    async function handleToggleStatus(user: ManagedUser) {
        const newStatus = user.status === 'active' ? 'blocked' : 'active'
        const label     = newStatus === 'blocked' ? 'block' : 'unblock'
        if (!confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} "${user.full_name}"?`)) return

        setActionId(user.id)
        try {
            const res = await fetch('/api/opoku/users', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: user.id, status: newStatus }),
            })
            if (res.ok) {
                setUsers(prev => prev.map(u =>
                    u.id !== user.id ? u : { ...u, status: newStatus }
                ))
                showSuccess(`User ${label}ed.`)
            }
        } catch { /* silent */ }
        finally { setActionId(null) }
    }

    // ── Delete ──
    async function handleDelete(user: ManagedUser) {
        if (!confirm(`Permanently delete "${user.full_name}"? This cannot be undone.`)) return
        setActionId(user.id)
        try {
            const res = await fetch('/api/opoku/users', {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: user.id }),
            })
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== user.id))
                showSuccess('User deleted.')
            }
        } catch { /* silent */ }
        finally { setActionId(null) }
    }

    function showSuccess(msg: string) {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(null), 3000)
    }

    const filtered = filterRole === 'all'
        ? users
        : users.filter(u => u.role === filterRole)

    // ─────────────────────────────────────────────
    // CREATE / EDIT FORM
    // ─────────────────────────────────────────────

    if (mode === 'create' || mode === 'edit') {
        const isEdit = mode === 'edit'
        return (
            <div className="bg-gray-900 border border-yellow-900/40 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-bold text-base">
                        {isEdit ? `Edit — ${editTarget?.full_name}` : 'Create New User'}
                    </h2>
                    <button
                        onClick={() => { setMode('list'); setEditTarget(null); setFormErr('') }}
                        className="text-xs font-bold text-gray-500 hover:text-gray-300
                       transition-colors"
                    >
                        ← Back
                    </button>
                </div>

                <form
                    onSubmit={isEdit ? handleEdit : handleCreate}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>Full name <Req /></label>
                        <input type="text" required value={form.full_name}
                               onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                               placeholder="Jane Akosua" className={inp} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>Email <Req /></label>
                        <input type="email" required value={form.email}
                               onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                               placeholder="jane@yedidia-estate.com" className={inp} />
                    </div>

                    {!isEdit && (
                        <div className="flex flex-col gap-1.5">
                            <label className={lbl}>Role <Req /></label>
                            <select value={form.role}
                                    onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                                    className={inp}>
                                <option value="agent_validator">Agent Validator</option>
                                <option value="comptable">Accountant</option>
                            </select>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>
                            {isEdit ? 'New password' : 'Password'} {!isEdit && <Req />}
                        </label>
                        <input type="password" required={!isEdit}
                               minLength={8} value={form.password}
                               onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                               placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
                               className={inp} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>
                            Confirm password {!isEdit && <Req />}
                        </label>
                        <input type="password" required={!isEdit}
                               value={form.confirmPassword}
                               onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                               placeholder="Repeat password" className={inp} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>Call number</label>
                        <input type="tel" value={form.phone_call}
                               onChange={e => setForm(p => ({ ...p, phone_call: e.target.value }))}
                               placeholder="+233 XX XXX XXXX" className={inp} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className={lbl}>WhatsApp number</label>
                        <input type="tel" value={form.phone_whatsapp}
                               onChange={e => setForm(p => ({ ...p, phone_whatsapp: e.target.value }))}
                               placeholder="+233XXXXXXXXX" className={inp} />
                    </div>

                    {formErr && (
                        <div className="sm:col-span-2 bg-red-950 border border-red-800
                            rounded-xl p-3">
                            <p className="text-sm text-red-400 font-medium">{formErr}</p>
                        </div>
                    )}

                    <div className="sm:col-span-2 flex gap-3">
                        <button
                            type="submit"
                            disabled={formLoading}
                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500
                         disabled:bg-yellow-900 text-black font-extrabold text-sm
                         px-5 py-2.5 rounded-xl transition-colors"
                        >
                            {formLoading
                                ? 'Saving…'
                                : isEdit ? 'Save Changes' : 'Create User'
                            }
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('list'); setEditTarget(null); setFormErr('') }}
                            className="text-gray-400 hover:text-gray-200 text-sm font-semibold
                         px-4 py-2.5 rounded-xl hover:bg-gray-800
                         transition-colors duration-150"
                        >
                            Cancel
                        </button>
                    </div>

                </form>
            </div>
        )
    }

    // ─────────────────────────────────────────────
    // LIST
    // ─────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex gap-2">
                    {(['all', 'agent_validator', 'comptable'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setFilterRole(r)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors
                          ${filterRole === r
                                ? 'bg-yellow-600 text-black'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                            }`}
                        >
                            {r === 'all'
                                ? `All (${users.length})`
                                : `${ROLE_LABELS[r]} (${users.filter(u => u.role === r).length})`
                            }
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => { setForm(emptyForm); setFormErr(''); setMode('create') }}
                    className="flex items-center gap-1.5 bg-yellow-600 hover:bg-yellow-500
                     text-black font-extrabold text-xs px-4 py-2 rounded-xl
                     transition-colors duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M12 4.5v15m7.5-7.5h-15"/>
                    </svg>
                    New User
                </button>
            </div>

            {/* Feedback */}
            {errMsg     && <FB type="error"   msg={errMsg}     />}
            {successMsg && <FB type="success" msg={successMsg} />}

            {/* Loading */}
            {loading && (
                <div className="flex flex-col gap-3">
                    {[1,2,3].map(i => (
                        <div key={i}
                             className="bg-gray-900 border border-gray-800 rounded-2xl
                            h-24 animate-pulse" />
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl
                        p-12 text-center">
                    <p className="text-gray-500 text-sm">
                        {users.length === 0
                            ? 'No users created yet. Create your first one.'
                            : 'No users match this filter.'
                        }
                    </p>
                </div>
            )}

            {/* User cards */}
            {!loading && filtered.length > 0 && (
                <div className="flex flex-col gap-3">
                    {filtered.map(user => (
                        <div key={user.id}
                             className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                            <div className="flex flex-col sm:flex-row gap-4">

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="w-8 h-8 rounded-full bg-yellow-900/40
                                    flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-500 font-bold text-xs">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white text-sm truncate">
                                                {user.full_name}
                                            </p>
                                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                      ${ROLE_COLORS[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                      capitalize
                                      ${STATUS_STYLES[user.status] ?? 'bg-gray-800 text-gray-400'}`}>
                      {user.status}
                    </span>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                        {user.phone_call     && <span>📞 {user.phone_call}</span>}
                                        {user.phone_whatsapp && <span>💬 {user.phone_whatsapp}</span>}
                                        <span>
                      Created {new Date(user.created_at).toLocaleDateString('en-GH', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                    </span>
                                        {user.last_login_at && (
                                            <span>
                        Last login {new Date(user.last_login_at).toLocaleDateString('en-GH', {
                                                day: 'numeric', month: 'short',
                                            })}
                      </span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap sm:flex-col gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => startEdit(user)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl
                               bg-gray-800 hover:bg-gray-700 text-gray-300
                               transition-colors disabled:opacity-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={actionId === user.id}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-xl
                                transition-colors disabled:opacity-50
                                ${user.status === 'active'
                                            ? 'bg-red-950 hover:bg-red-900 text-red-400'
                                            : 'bg-emerald-900 hover:bg-emerald-800 text-emerald-300'
                                        }`}
                                    >
                                        {actionId === user.id ? '…'
                                            : user.status === 'active' ? 'Block' : 'Unblock'
                                        }
                                    </button>

                                    <button
                                        onClick={() => handleDelete(user)}
                                        disabled={actionId === user.id}
                                        className="text-xs font-bold px-3 py-1.5 rounded-xl
                               bg-gray-900 hover:bg-red-950 text-gray-600
                               hover:text-red-400 border border-gray-800
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