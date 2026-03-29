const loadingTime = 1500;

let dialogueData = [];
let taglines = [];

Promise.all([
    fetch('/dialogue_data.json').then(r => r.json()),
    fetch('/taglines.txt').then(r => r.text()),
]).then(([data, text]) => {
    dialogueData = data;
    taglines = text.split('\n').filter(line => line.trim() !== '');
    showRandomLine();
});

function showRandomLine() {
    if (dialogueData.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const seed = hashCode(today);

    const shuffled = seededShuffle(dialogueData, seed);
    const item = shuffled[0];

    const taglineIndex = seed % taglines.length;
    const taglineTemplate = taglines[taglineIndex];
    const tagline = taglineTemplate.replace(/\[character\]/gi, item.character);

    const imageElement = document.getElementById('characterImage');
    const dialogueText = document.getElementById('dialogueText');
    const taglineEl = document.getElementById('tagline');
    const citationEl = document.getElementById('citation');

    imageElement.src = '/' + item.image;
    imageElement.alt = item.character;
    dialogueText.innerHTML = `"${item.line}"`;
    citationEl.innerHTML = `— <strong>${item.character}</strong>, ${item.episode_code}: "${item.episode}"`;
    taglineEl.innerHTML = tagline;

    scaleDialogueText(dialogueText);
}

function scaleDialogueText(el) {
    const len = el.textContent.length;
    const vw = window.innerWidth;
    // Scale font size: shorter quotes get bigger text, longer quotes get smaller
    const maxSize = Math.min(vw * 0.06, 72);
    const minSize = 18;
    const size = Math.max(minSize, maxSize * Math.sqrt(60 / Math.max(len, 60)));
    el.style.fontSize = size + 'px';
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return Math.abs(hash);
}

function seededShuffle(array, seed) {
    let result = [...array];
    let random = mulberry32(seed);
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function mulberry32(seed) {
    return function () {
        var t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

window.shareQuote = function () {
    const dialogue = document.getElementById('dialogueText').textContent;
    const citation = document.getElementById('citation').textContent;
    const shareText = `${dialogue}\n${citation}\n\nRegular Show Quote of the Day (https://regular-show-qotd.vercel.app/)`;
    const btn = document.getElementById('shareButton');

    if (navigator.share) {
        navigator.share({ text: shareText });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            btn.textContent = '✓ Copied!';
            setTimeout(() => { btn.innerHTML = '&#128279; Share Quote'; }, 2000);
        });
    }
};

function initPage() {
    const fadeIns = document.querySelectorAll('.fade-in');
    fadeIns.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * loadingTime);
    });

    const siteTitle = document.getElementById('siteTitle');
    const today = new Date();
    const dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    siteTitle.textContent = `QUOTE OF THE DAY: ${dateStr}`;
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}

function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

    document.getElementById('countdown').innerHTML =
        `Created by <a href="https://github.com/jl-5" target="_blank" style="color: white; text-decoration: underline;">jl-5</a>. Next quote in ${hours}:${minutes}:${seconds}`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function scheduleMidnightRefresh() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    setTimeout(() => location.reload(), midnight - now);
}

scheduleMidnightRefresh();
