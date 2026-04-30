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

    it('returns a valid quote for dates before 1970', () => {
        const result = getQuoteForDate(quotes, '1955-11-05')
        expect(result).toBeDefined()
        expect(quotes).toContainEqual(result)
    })

    it('returns a valid quote for year 0001', () => {
        const result = getQuoteForDate(quotes, '0001-01-01')
        expect(result).toBeDefined()
        expect(quotes).toContainEqual(result)
    })

    const decadeDates = [
        '0005-03-12', '0017-07-04', '0028-11-22', '0034-02-14', '0045-09-01',
        '0056-06-30', '0067-01-19', '0078-12-03', '0089-08-27', '0095-04-16',
        '0104-10-08', '0115-05-21', '0126-03-07', '0137-09-14', '0148-01-31',
        '0159-07-25', '0163-11-11', '0175-04-02', '0186-08-19', '0197-02-28',
        '0205-06-13', '0216-10-26', '0227-03-05', '0238-07-18', '0249-12-09',
        '0254-05-22', '0265-01-14', '0276-09-03', '0287-04-27', '0298-08-10',
        '0303-02-16', '0314-06-29', '0325-11-07', '0336-03-24', '0347-07-11',
        '0358-01-05', '0369-09-18', '0374-04-30', '0385-08-13', '0396-12-26',
        '0407-05-08', '0418-02-21', '0429-10-14', '0434-06-27', '0445-01-10',
        '0456-09-23', '0467-04-05', '0478-08-18', '0489-02-01', '0494-11-14',
        '0508-03-27', '0519-07-10', '0524-01-23', '0535-05-06', '0546-09-19',
        '0557-02-02', '0568-06-15', '0579-10-28', '0584-04-11', '0595-08-24',
        '0606-12-07', '0617-03-20', '0628-07-03', '0639-11-16', '0644-04-29',
        '0655-08-12', '0666-01-25', '0677-05-08', '0688-09-21', '0699-02-04',
        '0703-06-17', '0714-10-30', '0725-03-13', '0736-07-26', '0747-12-09',
        '0758-04-22', '0769-08-05', '0774-01-18', '0785-05-31', '0796-09-13',
        '0804-02-26', '0815-06-10', '0826-10-23', '0837-03-06', '0848-07-19',
        '0859-12-01', '0864-04-14', '0875-08-27', '0886-01-09', '0897-05-22',
        '0908-09-04', '0919-02-17', '0924-06-30', '0935-11-12', '0946-03-25',
        '0957-07-08', '0968-11-21', '0979-04-03', '0984-08-16', '0995-12-29',
        '1003-05-11', '1014-09-24', '1025-02-06', '1036-06-19', '1047-10-02',
        '1058-03-15', '1069-07-28', '1074-12-10', '1085-04-23', '1096-08-06',
        '1108-01-19', '1119-05-01', '1124-09-14', '1135-02-27', '1146-06-10',
        '1157-10-23', '1168-03-05', '1179-07-18', '1184-11-30', '1195-04-13',
        '1206-08-26', '1217-01-08', '1228-05-21', '1239-09-03', '1244-02-16',
        '1255-06-29', '1266-11-11', '1277-03-24', '1288-07-07', '1299-12-20',
        '1304-04-02', '1315-08-15', '1326-12-28', '1337-05-10', '1348-09-22',
        '1359-02-05', '1364-06-18', '1375-10-31', '1386-03-13', '1397-07-26',
        '1408-12-08', '1419-04-21', '1424-08-03', '1435-01-16', '1446-05-29',
        '1457-09-11', '1468-02-24', '1479-06-07', '1484-10-20', '1495-03-04',
        '1506-07-17', '1517-11-29', '1528-04-11', '1539-08-24', '1544-01-06',
        '1555-05-19', '1566-09-01', '1577-02-14', '1588-06-27', '1599-11-09',
        '1604-03-22', '1615-07-05', '1626-11-17', '1637-04-30', '1648-08-12',
        '1659-12-25', '1664-05-07', '1675-09-20', '1686-02-02', '1697-06-15',
        '1708-10-28', '1719-03-10', '1724-07-23', '1735-12-05', '1746-04-18',
        '1757-08-31', '1768-01-13', '1779-05-26', '1784-10-08', '1795-02-21',
        '1806-06-06', '1817-10-19', '1828-03-01', '1839-07-14', '1844-11-26',
        '1855-04-09', '1866-08-22', '1877-01-04', '1888-05-17', '1899-09-29',
        '1904-02-11', '1915-06-24', '1926-11-06', '1937-03-19', '1948-07-01',
        '1959-11-13', '1964-04-26', '1975-08-08', '1986-12-21', '1997-05-03',
    ]

    describe.each(decadeDates)('decade coverage: %s', (dateStr) => {
        it(`returns a valid quote for ${dateStr}`, () => {
            const result = getQuoteForDate(quotes, dateStr)
            expect(result).toBeDefined()
            expect(quotes).toContainEqual(result)
        })
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
