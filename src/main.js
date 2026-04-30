import { getQuoteForDate, getDayIndex, scaleDialogueText } from './utils.js';

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
    initDatePicker();
});

function getLocalDateStr(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayQuote(dateStr) {
    const item = getQuoteForDate(dialogueData, dateStr);
    const dayIndex = getDayIndex(dateStr);

    const taglineIndex = ((dayIndex % taglines.length) + taglines.length) % taglines.length;
    const tagline = taglines[taglineIndex].replace(/\[character\]/gi, item.character);

    const imageElement = document.getElementById('characterImage');
    const dialogueText = document.getElementById('dialogueText');

    imageElement.src = '/' + item.image;
    imageElement.alt = item.character;
    dialogueText.innerHTML = `"${item.line}"`;
    document.getElementById('citation').innerHTML = `— <strong>${item.character}</strong>, ${item.episode_code}: "${item.episode}"`;
    document.getElementById('tagline').innerHTML = tagline;

    const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('siteTitle').textContent = `QUOTE OF THE DAY: ${displayDate}`;

    scaleDialogueText(dialogueText);

    document.getElementById('shareButton').classList.add('visible');
    document.getElementById('datePicker').classList.add('visible');
}

function showRandomLine() {
    displayQuote(getLocalDateStr());
}

function initDatePicker() {
    const picker = document.getElementById('datePicker');
    const today = getLocalDateStr();
    picker.max = today;
    picker.value = today;

    picker.addEventListener('input', () => {
        let selected = picker.value;
        if (!selected) return;
        if (selected > today) {
            picker.value = today;
            selected = today;
        }
        displayQuote(selected);
        document.getElementById('backToToday').style.display = selected === today ? 'none' : 'inline-block';
    });
}

window.goToToday = function () {
    const today = getLocalDateStr();
    const picker = document.getElementById('datePicker');
    picker.value = today;
    displayQuote(today);
    document.getElementById('backToToday').style.display = 'none';
};

window.shareQuote = async function () {
    const dialogue = document.getElementById('dialogueText').textContent;
    const citation = document.getElementById('citation').textContent;
    const dateStr = document.getElementById('datePicker').value;
    const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const shareText = `${dialogue}\n${citation}\n\n${displayDate} — Regular Show Quote of the Day (https://regular-show-qotd.vercel.app/)`;
    const btn = document.getElementById('shareButton');

    if (navigator.share) {
        const imgSrc = document.getElementById('characterImage').src;
        try {
            const blob = await fetch(imgSrc).then(r => r.blob());
            const file = new File([blob], 'character.png', { type: blob.type });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], text: shareText });
                return;
            }
        } catch (_) {}
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
