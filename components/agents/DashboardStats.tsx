// components/agents/DashboardStats.tsx

// ─────────────────────────────────────────────
// DASHBOARD STATS CARDS
// ─────────────────────────────────────────────

interface Stats {
    totalListings:   number
    activeListings:  number
    pendingListings: number
    totalViews:      number
    waClicks:        number
    callClicks:      number
}

export default function DashboardStats({ stats }: { stats: Stats }) {
    const cards = [
        {
            label:   'Active Listings',
            value:   stats.activeListings,
            sub:     `${stats.pendingListings} pending review`,
            color:   'bg-emerald-50 border-emerald-200',
            numColor:'text-emerald-700',
            icon: (
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5
                   9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504
                   -1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125
                   c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                </svg>
            ),
        },
        {
            label:   'Total Views',
            value:   stats.totalViews,
            sub:     'across all your listings',
            color:   'bg-blue-50 border-blue-200',
            numColor:'text-blue-700',
            icon: (
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638
                   0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5
                   12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            ),
        },
        {
            label:   'WhatsApp Clicks',
            value:   stats.waClicks,
            sub:     'clients who messaged you',
            color:   'bg-emerald-50 border-emerald-200',
            numColor:'text-emerald-700',
            icon: (
                <svg className="w-5 h-5 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148
                   -.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297
                   -.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297
                   -.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497
                   .099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579
                   -.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
                   -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149
                   .198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36
                   .195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173
                   -1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335
                   -1.508A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0
                   22c-1.846 0-3.574-.498-5.065-1.367l-.363-.215-3.762.895.952-3.668-.236
                   -.376A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477
                   10-10 10z"/>
                </svg>
            ),
        },
        {
            label:   'Call Clicks',
            value:   stats.callClicks,
            sub:     'clients who called you',
            color:   'bg-purple-50 border-purple-200',
            numColor:'text-purple-700',
            icon: (
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372
                   c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l
                   -.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143
                   c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173
                   L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                </svg>
            ),
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(card => (
                <div key={card.label}
                     className={`rounded-2xl border p-5 flex flex-col gap-3 ${card.color}`}>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {card.label}
                        </p>
                        {card.icon}
                    </div>
                    <p className={`text-3xl font-extrabold ${card.numColor}`}>
                        {card.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{card.sub}</p>
                </div>
            ))}
        </div>
    )
}