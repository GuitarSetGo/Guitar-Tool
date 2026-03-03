// ══════════════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════════════

const notes = ['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];

const scalePatterns = {
    ionian:            [2,2,1,2,2,2,1],
    dorian:            [2,1,2,2,2,1,2],
    phrygian:          [1,2,2,2,1,2,2],
    lydian:            [2,2,2,1,2,2,1],
    mixolydian:        [2,2,1,2,2,1,2],
    aeolian:           [2,1,2,2,1,2,2],
    locrian:           [1,2,2,1,2,2,2],
    pentatonic_major:  [2,2,3,2,3],
    pentatonic_minor:  [3,2,2,3,2],
    blues:              [3,2,1,1,3,2],
    hirajoshi:          [2,1,4,1,4],
    kumoi:              [2,1,4,2,3],
    japanese_insen:    [1,4,2,1,4],
    melodic_minor:      [2,1,2,2,2,2,1],
    harmonic_major:    [2,2,1,2,1,3,1],
    harmonic_minor:    [2,1,2,2,1,3,1],
    hungarian_major:   [3,1,2,1,2,1,2],
    hungarian_minor:   [2,1,3,1,1,3,1],
    neapolitan_minor:  [1,2,2,2,1,3,1],
    neapolitan_major:  [1,2,2,2,2,2,1],
    major_bebop:       [2,2,1,2,1,1,2,1],
    minor_bebop:       [2,1,2,2,1,2,1,1],
    bebop_dominant:    [2,2,1,2,2,1,1,1],
    bebop_locrian:     [2,1,2,1,2,2,1,1],
    bebop_dorian:      [2,1,2,2,2,1,1,1],
    enigmatic:          [1,3,2,2,2,1,1],
    enigmatic_minor:   [1,2,3,1,3,1,1],
    persian:            [1,3,1,1,2,3,1],
    whole_tone:        [2,2,2,2,2,2],
    ionian_flat5:      [2,2,1,1,3,2,1],
    locrian_7:          [1,2,2,1,2,3,1],
    pelog:              [1,2,4,1,4],
    dominant_sus:      [2,3,2,2,1,2],
    composite_ii:      [1,3,2,1,1,3,1],
    eight_tone_spanish:[1,2,1,1,1,2,2,2],
    augmented:          [3,1,3,1,3,1],
    diminished:         [2,1,2,1,2,1,2,1],
    hindu:              [2,2,1,2,1,2,2],
};

const scaleNames = {
    ionian: 'Ionian (Major)', dorian: 'Dorian', phrygian: 'Phrygian',
    lydian: 'Lydian', mixolydian: 'Mixolydian', aeolian: 'Aeolian (Natural Minor)',
    locrian: 'Locrian', pentatonic_major: 'Major Pentatonic', pentatonic_minor: 'Minor Pentatonic',
    blues: 'Blues', hirajoshi: 'Hirajoshi', kumoi: 'Kumoi', japanese_insen: 'Japanese Insen',
    melodic_minor: 'Melodic Minor', harmonic_major: 'Harmonic Major', harmonic_minor: 'Harmonic Minor',
    hungarian_major: 'Hungarian Major', hungarian_minor: 'Hungarian Minor',
    neapolitan_minor: 'Neapolitan Minor', neapolitan_major: 'Neapolitan Major',
    major_bebop: 'Major Bebop', minor_bebop: 'Minor Bebop', bebop_dominant: 'Bebop Dominant',
    bebop_locrian: 'Bebop Locrian ♮2', bebop_dorian: 'Bebop Dorian', enigmatic: 'Enigmatic',
    enigmatic_minor: 'Enigmatic Minor', persian: 'Persian', whole_tone: 'Whole Tone',
    ionian_flat5: 'Ionian ♭5', locrian_7: 'Locrian ♮7', pelog: 'Pelog',
    dominant_sus: 'Dominant Sus', composite_ii: 'Composite II',
    eight_tone_spanish: '8-Tone Spanish', augmented: 'Augmented', diminished: 'Diminished', hindu: 'Hindu',
};

// Guitar strings: low E (index 0) to high e (index 5)
const stringTuning = ['E','A','D','G','B','E'];
const FRET_COUNT = 22;
const inlayFrets = [3,5,7,9,12,15,17,19,21];
const doubleInlayFrets = [12];

function buildStrings() {
    return stringTuning.map(openNote => {
        const startIdx = notes.indexOf(openNote);
        return Array.from({length: FRET_COUNT + 1}, (_, f) => notes[(startIdx + f) % notes.length]);
    });
}

const guitarStrings = buildStrings();

// ══════════════════════════════════════════════════════════════════
// SCALE GENERATION
// ══════════════════════════════════════════════════════════════════

function generateScale() {
    const scaleKey = document.getElementById('scale').value;
    const keyNote  = document.getElementById('key').value;
    const pattern  = scalePatterns[scaleKey];
    if (!pattern) return;

    const startIdx = notes.indexOf(keyNote);
    let scaleNotes = [notes[startIdx]];
    let currentIndex = startIdx;

    pattern.forEach(interval => {
        currentIndex = (currentIndex + interval) % notes.length;
        scaleNotes.push(notes[currentIndex]);
    });

    if (scaleNotes[scaleNotes.length - 1] === scaleNotes[0]) scaleNotes.pop();

    let blueNote = null;
    if (scaleKey === 'blues') {
        let bi = startIdx;
        for (let i = 0; i < 3; i++) bi = (bi + pattern[i]) % notes.length;
        blueNote = notes[bi];
    }

    renderScaleInfoBar(scaleNotes, keyNote, blueNote);
    renderScaleNameDisplay(scaleKey, keyNote, pattern);
    renderFretboard(scaleNotes, keyNote, blueNote);
    renderLegend(scaleKey);

    showToast(`🎸 ${keyNote} ${scaleNames[scaleKey]} — ${scaleNotes.length} notes`);
}

function renderScaleInfoBar(scaleNotes, root, blueNote) {
    const bar = document.getElementById('scaleInfoBar');
    bar.innerHTML = scaleNotes.map(n => {
        let cls = 'scale-note-pill';
        if (n === root) cls += ' root';
        else if (n === blueNote) cls += ' blue-note';
        return `<span class="${cls}">${n}</span>`;
    }).join('');
}

function renderScaleNameDisplay(scaleKey, keyNote, pattern) {
    document.getElementById('scaleNameDisplay').style.display = 'block';
    document.getElementById('scaleFullName').textContent = `${keyNote} ${scaleNames[scaleKey] || scaleKey}`;
    document.getElementById('scaleIntervals').textContent = `Intervals: ${pattern.join(' – ')}  ·  ${pattern.length} steps`;
}

function renderLegend(scaleKey) {
    document.getElementById('legend').style.display = 'flex';
    const blueItem = document.getElementById('legendBlue');
    blueItem.style.display = scaleKey === 'blues' ? 'flex' : 'none';
}

// ══════════════════════════════════════════════════════════════════
// FRETBOARD RENDERING
// ══════════════════════════════════════════════════════════════════

function renderFretboard(scaleNotes, root, blueNote) {
    const container = document.getElementById('mastilContainer');
    container.innerHTML = '';

    const mastil = document.createElement('div');
    mastil.id = 'mastil';

    // Fret numbers row
    const numRow = document.createElement('div');
    numRow.className = 'fret-numbers';
    for (let f = 0; f <= FRET_COUNT; f++) {
        const cell = document.createElement('div');
        cell.className = 'fret-num-cell';
        if (f > 0) cell.textContent = f;
        numRow.appendChild(cell);
    }
    mastil.appendChild(numRow);

    // String rows
    for (let s = 5; s >= 0; s--) {
        const stringArr = guitarStrings[s];
        const row = document.createElement('div');
        row.className = 'string-row';

        for (let f = 0; f <= FRET_COUNT; f++) {
            const cell = document.createElement('div');
            cell.className = 'fret-cell';

            const fretNote = stringArr[f];
            const inScale  = scaleNotes.includes(fretNote);

            if (inScale) {
                const marker = document.createElement('div');
                marker.className = 'note-marker';
                if (fretNote === root) {
                    marker.classList.add('root-note');
                } else if (fretNote === blueNote) {
                    marker.classList.add('blue-note');
                } else {
                    marker.classList.add('regular');
                }
                marker.textContent = fretNote;
                cell.appendChild(marker);
            }

            row.appendChild(cell);
        }
        mastil.appendChild(row);
    }

    // Inlay row
    const inlayRow = document.createElement('div');
    inlayRow.className = 'inlay-row';
    for (let f = 0; f <= FRET_COUNT; f++) {
        const cell = document.createElement('div');
        cell.className = 'inlay-cell';
        if (inlayFrets.includes(f)) {
            if (doubleInlayFrets.includes(f)) {
                const d = document.createElement('div');
                d.className = 'inlay-double';
                d.innerHTML = '<div class="inlay-dot"></div><div class="inlay-dot"></div>';
                cell.appendChild(d);
            } else {
                const d = document.createElement('div');
                d.className = 'inlay-dot';
                d.innerHTML = '';
                const dot = document.createElement('div');
                dot.className = 'inlay-dot';
                cell.appendChild(dot);
            }
        }
        inlayRow.appendChild(cell);
    }
    mastil.appendChild(inlayRow);

    container.appendChild(mastil);
}

// ══════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════

window.onload = () => {
    generateScale();
};
