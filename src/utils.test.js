import { describe, it, expect, beforeEach } from 'vitest'
import { mulberry32, seededShuffle, getDayIndex, getQuoteForDate, scaleDialogueText } from './utils.js'

describe('mulberry32', () => {
    it('produces the same sequence for the same seed', () => {
        const rng1 = mulberry32(123)
        const rng2 = mulberry32(123)
        expect(rng1()).toBe(rng2())
        expect(rng1()).toBe(rng2())
        expect(rng1()).toBe(rng2())
    })

    it('produces different sequences for different seeds', () => {
        const rng1 = mulberry32(1)
        const rng2 = mulberry32(2)
        expect(rng1()).not.toBe(rng2())
    })

    it('produces values in [0, 1)', () => {
        const rng = mulberry32(42)
        for (let i = 0; i < 100; i++) {
            const val = rng()
            expect(val).toBeGreaterThanOrEqual(0)
            expect(val).toBeLessThan(1)
        }
    })
})

describe('seededShuffle', () => {
    const arr = [1, 2, 3, 4, 5]

    it('returns the same order for the same seed', () => {
        expect(seededShuffle(arr, 42)).toEqual(seededShuffle(arr, 42))
    })

    it('returns a different order for a different seed', () => {
        expect(seededShuffle(arr, 1)).not.toEqual(seededShuffle(arr, 99999))
    })

    it('contains all original elements', () => {
        const result = seededShuffle(arr, 42)
        expect(result).toHaveLength(arr.length)
        expect([...result].sort((a, b) => a - b)).toEqual(arr)
    })

    it('does not mutate the original array', () => {
        const original = [1, 2, 3]
        seededShuffle(original, 42)
        expect(original).toEqual([1, 2, 3])
    })

    it('handles an empty array', () => {
        expect(seededShuffle([], 42)).toEqual([])
    })

    it('handles a single element', () => {
        expect(seededShuffle([99], 42)).toEqual([99])
    })
})

describe('getDayIndex', () => {
    it('returns an integer', () => {
        expect(Number.isInteger(getDayIndex('2024-01-01'))).toBe(true)
    })

    it('increments by 1 for consecutive days', () => {
        const d1 = getDayIndex('2024-01-01')
        const d2 = getDayIndex('2024-01-02')
        expect(d2 - d1).toBe(1)
    })

    it('is consistent for the same date string', () => {
        expect(getDayIndex('2025-06-15')).toBe(getDayIndex('2025-06-15'))
    })
})

describe('getQuoteForDate', () => {
    const quotes = Array.from({ length: 10 }, (_, i) => ({ id: i, line: `Quote ${i}` }))

    it('returns the same quote for the same date', () => {
        expect(getQuoteForDate(quotes, '2024-01-01')).toEqual(getQuoteForDate(quotes, '2024-01-01'))
    })

    it('returns different quotes on consecutive days', () => {
        const q1 = getQuoteForDate(quotes, '2024-01-01')
        const q2 = getQuoteForDate(quotes, '2024-01-02')
        expect(q1).not.toEqual(q2)
    })

    it('cycles through all quotes before repeating', () => {
        const n = quotes.length
        const seen = new Set()
        for (let i = 0; i < n; i++) {
            const date = new Date(Date.UTC(2024, 0, 1 + i)).toISOString().split('T')[0]
            seen.add(getQuoteForDate(quotes, date).id)
        }
        expect(seen.size).toBe(n)
    })

    it('repeats the cycle after all quotes are shown', () => {
        const n = quotes.length
        const firstCycle = Array.from({ length: n }, (_, i) => {
            const date = new Date(Date.UTC(2024, 0, 1 + i)).toISOString().split('T')[0]
            return getQuoteForDate(quotes, date).id
        })
        const secondCycle = Array.from({ length: n }, (_, i) => {
            const date = new Date(Date.UTC(2024, 0, 1 + n + i)).toISOString().split('T')[0]
            return getQuoteForDate(quotes, date).id
        })
        expect(firstCycle).toEqual(secondCycle)
    })
})

describe('scaleDialogueText', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true, configurable: true })
    })

    it('sets a font size on the element', () => {
        const el = document.createElement('div')
        el.textContent = 'Hello world'
        scaleDialogueText(el)
        expect(el.style.fontSize).toBeTruthy()
    })

    it('gives shorter text a larger font size than longer text', () => {
        const short = document.createElement('div')
        short.textContent = 'Hi'

        const long = document.createElement('div')
        long.textContent = 'A'.repeat(300)

        scaleDialogueText(short)
        scaleDialogueText(long)

        expect(parseFloat(short.style.fontSize)).toBeGreaterThan(parseFloat(long.style.fontSize))
    })

    it('never goes below the minimum font size of 18px', () => {
        const el = document.createElement('div')
        el.textContent = 'A'.repeat(10000)
        scaleDialogueText(el)
        expect(parseFloat(el.style.fontSize)).toBeGreaterThanOrEqual(18)
    })
})
