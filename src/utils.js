export function mulberry32(seed) {
    return function () {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function seededShuffle(array, seed) {
    let result = [...array];
    let random = mulberry32(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

export function getDayIndex(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(0);
    d.setUTCFullYear(year, month - 1, day);
    return Math.floor(d.getTime() / (1000 * 60 * 60 * 24));
}

export function getQuoteForDate(dialogueData, dateStr) {
    const dayIndex = getDayIndex(dateStr);
    const ordered = seededShuffle(dialogueData, 42);
    const index = ((dayIndex % ordered.length) + ordered.length) % ordered.length;
    return ordered[index];
}

export function scaleDialogueText(el) {
    const len = el.textContent.length;
    const vw = window.innerWidth;
    const maxSize = Math.min(vw * 0.06, 72);
    const minSize = 18;
    const size = Math.max(minSize, maxSize * Math.sqrt(60 / Math.max(len, 60)));
    el.style.fontSize = size + 'px';
}
