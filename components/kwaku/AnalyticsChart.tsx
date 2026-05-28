// components/kwaku/AnalyticsChart.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface DayPoint    { date: string;    count: number }
interface CountryRow  { country: string; count: number }
interface CityRow     { city: string;    count: number }

interface AnalyticsData {
    totalVisits:    number
    uniqueEstimate: number
    growth:         number | null
    dailySeries:    DayPoint[]
    topCountries:   CountryRow[]
    topCities:      CityRow[]
    range: { from: string; to: string; days: number }
}

// ─────────────────────────────────────────────
// PRESET RANGES
// ─────────────────────────────────────────────

const PRESETS = [
    { label: '7 days',  days: 7  },
    { label: '30 days', days: 30 },
    { label: '90 days', days: 90 },
    { label: '1 year',  days: 365},
]

function getRange(days: number): { from: string; to: string } {
    const to   = new Date()
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return {
        from: from.toISOString().slice(0, 10),
        to:   to.toISOString().slice(0, 10),
    }
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AnalyticsChart() {
    const [data,         setData]         = useState<AnalyticsData | null>(null)
    const [loading,      setLoading]      = useState(true)
    const [preset,       setPreset]       = useState(30)
    const [customFrom,   setCustomFrom]   = useState('')
    const [customTo,     setCustomTo]     = useState('')
    const [useCustom,    setUseCustom]    = useState(false)
    const [errMsg,       setErrMsg]       = useState('')

    const fetchData = useCallback(async () => {
        setLoading(true)
        setErrMsg('')

        try {
            const range = useCustom && customFrom && customTo
                ? { from: customFrom, to: customTo }
                : getRange(preset)

            const res  = await fetch(
                `/api/kwaku/analytics?from=${range.from}&to=${range.to}`
            )
            const json = await res.json()

            if (!res.ok) { setErrMsg(json.error ?? 'Failed to load analytics.'); return }
            setData(json)

        } catch {
            setErrMsg('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [preset, customFrom, customTo, useCustom])

    useEffect(() => { fetchData() }, [fetchData])

    return (
        <div className="flex flex-col gap-6">

            {/* ── Filter bar ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4
                      flex flex-wrap gap-3 items-end">

                {/* Preset buttons */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Quick range
                    </p>
                    <div className="flex gap-2">
                        {PRESETS.map(p => (
                            <button
                                key={p.days}
                                onClick={() => { setPreset(p.days); setUseCustom(false) }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors
                            ${!useCustom && preset === p.days
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom range */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Custom range
                    </p>
                    <div className="flex gap-2 items-center">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={e => { setCustomFrom(e.target.value); setUseCustom(true) }}
                            className={dateInputClass}
                        />
                        <span className="text-gray-600 text-xs">to</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={e => { setCustomTo(e.target.value); setUseCustom(true) }}
                            className={dateInputClass}
                        />
                        {useCustom && customFrom && customTo && (
                            <button
                                onClick={fetchData}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs
                           font-bold px-3 py-1.5 rounded-xl transition-colors"
                            >
                                Apply
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Error ── */}
            {errMsg && (
                <div className="bg-red-950 border border-red-800 rounded-xl p-3">
                    <p className="text-sm text-red-400">{errMsg}</p>
                </div>
            )}

            {/* ── Loading skeleton ── */}
            {loading && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-gray-900 border border-gray-800
                                    rounded-2xl h-28 animate-pulse" />
                    ))}
                </div>
            )}

            {/* ── Data ── */}
            {!loading && data && (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard
                            label="Total Visits"
                            value={data.totalVisits.toLocaleString()}
                            sub={`Last ${data.range.days} days`}
                            growth={data.growth}
                        />
                        <SummaryCard
                            label="Est. Unique Visitors"
                            value={data.uniqueEstimate.toLocaleString()}
                            sub="based on location data"
                        />
                        <SummaryCard
                            label="Countries"
                            value={String(data.topCountries.length)}
                            sub="distinct countries"
                        />
                        <SummaryCard
                            label="Cities"
                            value={String(data.topCities.length)}
                            sub="distinct cities"
                        />
                    </div>

                    {/* Daily chart */}
                    {data.dailySeries.length > 0 && (
                        <DailyBarChart series={data.dailySeries} />
                    )}

                    {/* Geo breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <GeoTable
                            title="Top Countries"
                            rows={data.topCountries.map(r => ({ label: r.country, count: r.count }))}
                            total={data.totalVisits}
                        />
                        <GeoTable
                            title="Top Cities"
                            rows={data.topCities.map(r => ({ label: r.city, count: r.count }))}
                            total={data.totalVisits}
                        />
                    </div>
                </>
            )}

            {!loading && data && data.totalVisits === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 text-sm">
                        No visitor data for this period.
                    </p>
                </div>
            )}

        </div>
    )
}

// ─────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────

function SummaryCard({
                         label, value, sub, growth,
                     }: {
    label:   string
    value:   string
    sub:     string
    growth?: number | null
}) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5
                    flex flex-col gap-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                {label}
            </p>
            <p className="text-3xl font-extrabold text-white">{value}</p>
            <div className="flex items-center gap-2">
                <p className="text-xs text-gray-600">{sub}</p>
                {growth !== null && growth !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                            ${growth >= 0
                        ? 'bg-emerald-900 text-emerald-400'
                        : 'bg-red-950 text-red-400'
                    }`}>
            {growth >= 0 ? '+' : ''}{growth}%
          </span>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// DAILY BAR CHART (pure CSS — no dependencies)
// ─────────────────────────────────────────────

function DailyBarChart({ series }: { series: DayPoint[] }) {
    const maxCount = Math.max(...series.map(d => d.count), 1)

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-5">Daily Visits</h3>

            <div className="flex items-end gap-1 h-36 overflow-x-auto pb-2">
                {series.map(point => {
                    const pct  = Math.max(4, Math.round((point.count / maxCount) * 100))
                    const date = new Date(point.date).toLocaleDateString('en-GH', {
                        day: 'numeric', month: 'short',
                    })
                    return (
                        <div
                            key={point.date}
                            className="flex flex-col items-center gap-1 flex-shrink-0 group"
                            style={{ minWidth: series.length > 60 ? '8px' : '16px' }}
                        >
                            {/* Tooltip */}
                            <div className="hidden group-hover:flex flex-col items-center
                              absolute -translate-y-10 bg-gray-700 text-white
                              text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10
                              pointer-events-none shadow-lg">
                                <span className="font-bold">{point.count}</span>
                                <span className="text-gray-300">{date}</span>
                            </div>

                            {/* Bar */}
                            <div
                                className="w-full bg-indigo-600 rounded-t-sm hover:bg-indigo-400
                           transition-colors duration-150 relative"
                                style={{ height: `${pct}%` }}
                                title={`${date}: ${point.count} visits`}
                            />
                        </div>
                    )
                })}
            </div>

            {/* X-axis labels — show only first, middle, last */}
            {series.length > 0 && (
                <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>
            {new Date(series[0].date).toLocaleDateString('en-GH', {
                day: 'numeric', month: 'short',
            })}
          </span>
                    {series.length > 2 && (
                        <span>
              {new Date(series[Math.floor(series.length / 2)].date)
                  .toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
            </span>
                    )}
                    <span>
            {new Date(series[series.length - 1].date).toLocaleDateString('en-GH', {
                day: 'numeric', month: 'short',
            })}
          </span>
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────
// GEO TABLE
// ─────────────────────────────────────────────

function GeoTable({
                      title, rows, total,
                  }: {
    title: string
    rows:  { label: string; count: number }[]
    total: number
}) {
    if (rows.length === 0) return null

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-4">{title}</h3>
            <div className="flex flex-col gap-2.5">
                {rows.map(row => {
                    const pct = total > 0 ? Math.round((row.count / total) * 100) : 0
                    return (
                        <div key={row.label} className="flex flex-col gap-1">
                            <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-medium truncate pr-4">
                  {row.label}
                </span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-gray-500">{pct}%</span>
                                    <span className="text-white font-bold">
                    {row.count.toLocaleString()}
                  </span>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// SHARED STYLE
// ─────────────────────────────────────────────

const dateInputClass = `
  bg-gray-800 border border-gray-700 text-gray-200 text-xs
  rounded-xl px-3 py-1.5
  focus:outline-none focus:ring-2 focus:ring-indigo-500
  focus:border-indigo-500 transition-colors duration-150
`