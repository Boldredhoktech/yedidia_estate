// components/public/KenteStrip.tsx

import { agencyConfig } from '@/config/agency'

interface KenteStripProps {
    position: 'top' | 'bottom'
    height?: 'thin' | 'normal'
}

/**
 * Decorative Kente-inspired colour strip.
 * Uses Ghana flag colours (green / gold / red) with
 * a repeating rhythmic pattern referencing Kente weaving.
 * Placed at the very top and bottom of every public page.
 */
export default function KenteStrip({
                                       position,
                                       height = 'normal',
                                   }: KenteStripProps) {
    const h = height === 'thin' ? 'h-1' : 'h-1.5'

    // Kente repeating colour sequence
    const sequence = [
        agencyConfig.ghana.kenteStripe[0], // red
        agencyConfig.ghana.kenteStripe[1], // gold
        agencyConfig.ghana.kenteStripe[2], // green
        agencyConfig.ghana.kenteStripe[1], // gold
        agencyConfig.ghana.kenteStripe[0], // red
        '#000000',                          // black accent
        agencyConfig.ghana.kenteStripe[2], // green
        agencyConfig.ghana.kenteStripe[1], // gold
        agencyConfig.ghana.kenteStripe[0], // red
        agencyConfig.ghana.kenteStripe[2], // green
        agencyConfig.ghana.kenteStripe[1], // gold
        '#000000',                          // black accent
    ]

    const roundedClass = position === 'top' ? '' : ''

    return (
        <div
            className={`w-full flex ${h} ${roundedClass} overflow-hidden flex-shrink-0`}
            role="presentation"
            aria-hidden="true"
        >
            {sequence.map((color, i) => (
                <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    )
}