/**
 * DFA Password Validator
 * ======================
 * Implements a Deterministic Finite Automaton (DFA) for password validation.
 *
 * STATES:
 *   q0   - start state (no requirements met)
 *   q1   - has uppercase
 *   q2   - has digit
 *   q3   - has special character
 *   q4   - has uppercase + digit
 *   q5   - has uppercase + special
 *   q6   - has digit + special
 *   qacc - all three met (accepting state, pending length check)
 *   qt   - trap/dead state (invalid char read, no escape)
 *
 * ALPHABET (input classes):
 *   U = uppercase letter (A-Z)
 *   D = digit (0-9)
 *   S = special character (!@#$%^&*...)
 *   L = lowercase letter (a-z) → leads to trap state
 */

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Classify a single character into an input type
function classify(char) {
  if (char >= 'A' && char <= 'Z') return 'U'; // uppercase
  if (char >= '0' && char <= '9') return 'D'; // digit
  if (SPECIAL_CHARS.includes(char)) return 'S'; // special
  return 'L'; // lowercase (or anything else → trap)
}

// The DFA transition function: δ(state, inputType) → nextState
const DELTA = {
  q0:   { U: 'q1',   D: 'q2',   S: 'q3',   L: 'q0'   }, // ← stay, don't trap
  q1:   { U: 'q1',   D: 'q4',   S: 'q5',   L: 'q1'   },
  q2:   { U: 'q4',   D: 'q2',   S: 'q6',   L: 'q2'   },
  q3:   { U: 'q5',   D: 'q6',   S: 'q3',   L: 'q3'   },
  q4:   { U: 'q4',   D: 'q4',   S: 'qacc', L: 'q4'   },
  q5:   { U: 'q5',   D: 'qacc', S: 'q5',   L: 'q5'   },
  q6:   { U: 'qacc', D: 'q6',   S: 'q6',   L: 'q6'   },
  qacc: { U: 'qacc', D: 'qacc', S: 'qacc', L: 'qacc' },
  qt:   { U: 'qt',   D: 'qt',   S: 'qt',   L: 'qt'   },
};

/**
 * Run the DFA on a password string.
 * Returns { finalState, trace, accepted, hasUpper, hasDigit, hasSpecial }
 */
function runDFA(password, minLen) {
  let state = 'q0';
  const trace = [];

  for (const char of password) {
    const type = classify(char);
    const prev = state;
    state = DELTA[state][type];
    trace.push({ char, type, from: prev, to: state });
  }

  const lengthOk = password.length >= minLen;
  const accepted = state === 'qacc' && lengthOk;

  return {
    finalState: state,
    trace,
    accepted,
    inTrap: state === 'qt',
    hasUpper:   ['q1','q4','q5','qacc'].includes(state) || trace.some(t => t.type === 'U' && t.to !== 'qt'),
    hasDigit:   ['q2','q4','q6','qacc'].includes(state) || trace.some(t => t.type === 'D' && t.to !== 'qt'),
    hasSpecial: ['q3','q5','q6','qacc'].includes(state) || trace.some(t => t.type === 'S' && t.to !== 'qt'),
  };
}

// ─── DOM references ────────────────────────────────────────────────
const pwInput     = document.getElementById('pw-input');
const showBtn     = document.getElementById('show-btn');
const rUpper      = document.getElementById('r-upper');
const rDigit      = document.getElementById('r-digit');
const rSpecial    = document.getElementById('r-special');
const rLen        = document.getElementById('r-len');
const minLenSlider= document.getElementById('min-len');
const lenVal      = document.getElementById('len-val');
const lenRow      = document.getElementById('len-row');
const stateChips  = document.getElementById('state-chips');
const resultBanner= document.getElementById('result-banner');
const checksEl    = document.getElementById('checks');
const traceOutput = document.getElementById('trace-output');

// ─── Show/hide password ────────────────────────────────────────────
showBtn.addEventListener('click', () => {
  const hidden = pwInput.type === 'password';
  pwInput.type = hidden ? 'text' : 'password';
  showBtn.textContent = hidden ? 'hide' : 'show';
});

// ─── Slider ────────────────────────────────────────────────────────
minLenSlider.addEventListener('input', () => {
  lenVal.textContent = minLenSlider.value;
  update();
});
rLen.addEventListener('change', () => {
  lenRow.style.opacity = rLen.checked ? '1' : '0.4';
  update();
});
rUpper.addEventListener('change', update);
rDigit.addEventListener('change', update);
rSpecial.addEventListener('change', update);
pwInput.addEventListener('input', update);

// ─── Main update function ──────────────────────────────────────────
function update() {
  const pw      = pwInput.value;
  const useU    = rUpper.checked;
  const useD    = rDigit.checked;
  const useS    = rSpecial.checked;
  const useLen  = rLen.checked;
  const minLen  = useLen ? parseInt(minLenSlider.value) : 0;

  if (pw.length === 0) {
    renderIdle();
    return;
  }

  const result = runDFA(pw, minLen);
  renderStateChips(result, useU, useD, useS);
  renderBanner(result, pw, minLen, useU, useD, useS, useLen);
  renderChecks(result, pw, minLen, useU, useD, useS, useLen);
  renderTrace(result.trace);
}

function renderIdle() {
  stateChips.innerHTML = '<span class="chip active">q0 — start</span>';
  resultBanner.className = 'banner banner-idle';
  resultBanner.textContent = 'waiting for input';
  checksEl.innerHTML = '';
  traceOutput.innerHTML = '<span class="trace-idle">No input yet. Type a password to see the trace.</span>';
}

function renderStateChips(result, useU, useD, useS) {
  stateChips.innerHTML = '';
  const s = result.finalState;
  const labels = [];

  if (s === 'qt') {
    labels.push({ text: 'qt — trap', cls: 'trap-chip' });
  } else if (s === 'qacc') {
    if (useU) labels.push({ text: 'U met', cls: 'active' });
    if (useD) labels.push({ text: 'D met', cls: 'active' });
    if (useS) labels.push({ text: 'S met', cls: 'active' });
    labels.push({ text: 'qacc', cls: 'accept' });
  } else {
    const bits = {
      q0: [], q1: ['U'], q2: ['D'], q3: ['S'],
      q4: ['U','D'], q5: ['U','S'], q6: ['D','S']
    };
    const met = bits[s] || [];
    if (met.length === 0) labels.push({ text: 'q0 — start', cls: 'active' });
    met.forEach(b => labels.push({ text: b + ' met', cls: 'active' }));
    const pending = ['U','D','S'].filter(b => !met.includes(b));
    pending.forEach(b => labels.push({ text: b + ' pending', cls: '' }));
  }

  labels.forEach(({ text, cls }) => {
    const el = document.createElement('span');
    el.className = 'chip ' + cls;
    el.textContent = text;
    stateChips.appendChild(el);
  });
}

function renderBanner(result, pw, minLen, useU, useD, useS, useLen) {
  const noRules = !useU && !useD && !useS && !useLen;
  const u = !useU || result.hasUpper;
  const d = !useD || result.hasDigit;
  const s = !useS || result.hasSpecial;
  const l = !useLen || pw.length >= minLen;
  const allMet = u && d && s && l;

  if (result.inTrap) {
    resultBanner.className = 'banner banner-trap';
    resultBanner.textContent = 'TRAPPED — invalid character sequence (dead state qt)';
  } else if (noRules || allMet) {
    resultBanner.className = 'banner banner-accept';
    resultBanner.textContent = 'ACCEPTED — password is valid';
  } else {
    resultBanner.className = 'banner banner-reject';
    resultBanner.textContent = 'REJECTED — requirements not yet met';
  }
}

function renderChecks(result, pw, minLen, useU, useD, useS, useLen) {
  const items = [
    { label: 'At least 1 uppercase letter', met: result.hasUpper, active: useU },
    { label: 'At least 1 digit (0–9)',       met: result.hasDigit,   active: useD },
    { label: 'At least 1 special character', met: result.hasSpecial, active: useS },
    { label: `Min length ${minLen} (currently ${pw.length})`, met: pw.length >= minLen, active: useLen },
  ];

  checksEl.innerHTML = '';
  items.forEach(({ label, met, active }) => {
    const row = document.createElement('div');
    row.className = 'check-row';
    const dot = document.createElement('div');
    dot.className = 'dot ' + (!active ? 'dot-off' : met ? 'dot-pass' : 'dot-fail');
    const txt = document.createElement('span');
    txt.style.color = !active ? '#555' : met ? 'var(--accent)' : 'var(--red)';
    txt.textContent = (!active ? '[off] ' : '') + label;
    row.appendChild(dot);
    row.appendChild(txt);
    checksEl.appendChild(row);
  });
}

function renderTrace(trace) {
  if (trace.length === 0) {
    traceOutput.innerHTML = '<span class="trace-idle">No input yet.</span>';
    return;
  }

  const typeNames = { U: 'uppercase', D: 'digit', S: 'special', L: 'lowercase→trap' };
  traceOutput.innerHTML = trace.map((step, i) => {
    const toClass = step.to === 'qt' ? 'is-trap' : step.to === 'qacc' ? 'is-accept' : '';
    const displayChar = step.char === ' ' ? '(space)' : step.char;
    return `<div class="trace-step">
      <span class="trace-char">${String(i+1).padStart(2,'0')}: '${displayChar}'</span>
      <span class="trace-arrow">→</span>
      <span class="trace-from">${step.from}</span>
      <span class="trace-arrow">→</span>
      <span class="trace-to ${toClass}">${step.to}</span>
      <span class="trace-type">[${typeNames[step.type]}]</span>
    </div>`;
  }).join('');

  traceOutput.scrollTop = traceOutput.scrollHeight;
}

// Initialize
renderIdle();
