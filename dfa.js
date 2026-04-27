/**
 * DFA Password Validator
 * ======================
 * Implements a Deterministic Finite Automaton (DFA) for password validation.
 *
 * STATES:
 *   q0   - start state (no requirements met)
 *   q1   - has seen at least one uppercase (U path)
 *   q2   - has seen at least one digit or special (D/S path)
 *   q3   - intermediate: both paths have been crossed (needs final confirmation)
 *   q4   - all requirements met (accepting state)
 *
 * ALPHABET (input classes):
 *   U = uppercase letter (A-Z)
 *   D = digit (0-9)
 *   S = special character (!@#$%^&*...)
 *   L = lowercase letter (a-z) → neutral, self-loop on most states
 *
 * TRANSITION SUMMARY:
 *   q0 + U/L → q1  |  q0 + D/S → q2
 *   q1 + U/L → q1  |  q1 + D/S → q3
 *   q2 + D/S → q2  |  q2 + U/L → q3
 *   q3 + any → q4
 *   q4 + any → q4  (sink accept)
 */

const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Classify a single character into an input type
function classify(char) {
  if (char >= 'A' && char <= 'Z') return 'U'; // uppercase
  if (char >= '0' && char <= '9') return 'D'; // digit
  if (SPECIAL_CHARS.includes(char)) return 'S'; // special
  return 'L'; // lowercase or anything else → neutral
}

// The DFA transition function: δ(state, inputType) → nextState
const DELTA = {
  q0: { U: 'q1', D: 'q2', S: 'q2', L: 'q0' },
  q1: { U: 'q1', D: 'q3', S: 'q3', L: 'q1' },
  q2: { U: 'q3', D: 'q2', S: 'q2', L: 'q3' },
  q3: { U: 'q4', D: 'q4', S: 'q4', L: 'q4' },
  q4: { U: 'q4', D: 'q4', S: 'q4', L: 'q4' },
};

/**
 * Run the DFA on a password string.
 * Returns { finalState, trace, accepted, hasUpper, hasDigitOrSpecial }
 */
function runDFA(password) {
  let state = 'q0';
  const trace = [];

  for (const char of password) {
    const type = classify(char);
    const prev = state;
    state = DELTA[state][type];
    trace.push({ char, type, from: prev, to: state });
  }

  const accepted = state === 'q4';

  // Derive which requirements are met from the final state
  const hasUpper          = ['q1', 'q3', 'q4'].includes(state) ||
                            trace.some(t => t.type === 'U');
  const hasDigitOrSpecial = ['q2', 'q3', 'q4'].includes(state) ||
                            trace.some(t => t.type === 'D' || t.type === 'S');

  return {
    finalState: state,
    trace,
    accepted,
    hasUpper,
    hasDigitOrSpecial,
    // Legacy compat for check rendering
    hasDigit:   trace.some(t => t.type === 'D'),
    hasSpecial: trace.some(t => t.type === 'S'),
  };
}

// ─── DOM references ────────────────────────────────────────────────
const pwInput      = document.getElementById('pw-input');
const showBtn      = document.getElementById('show-btn');
const rUpper       = document.getElementById('r-upper');
const rDigit       = document.getElementById('r-digit');
const rSpecial     = document.getElementById('r-special');

const stateChips   = document.getElementById('state-chips');
const resultBanner = document.getElementById('result-banner');
const checksEl     = document.getElementById('checks');
const traceOutput  = document.getElementById('trace-output');

// ─── Show/hide password ────────────────────────────────────────────
showBtn.addEventListener('click', () => {
  const hidden = pwInput.type === 'password';
  pwInput.type = hidden ? 'text' : 'password';
  showBtn.textContent = hidden ? 'hide' : 'show';
});

rUpper.addEventListener('change', update);
rDigit.addEventListener('change', update);
rSpecial.addEventListener('change', update);
pwInput.addEventListener('input', update);

// ─── Main update function ──────────────────────────────────────────
function update() {
  const pw     = pwInput.value;
  const useU   = rUpper.checked;
  const useD   = rDigit.checked;
  const useS   = rSpecial.checked;
  if (pw.length === 0) {
    renderIdle();
    return;
  }

  const result = runDFA(pw);
  renderStateChips(result);
  renderBanner(result, useU, useD, useS);
  renderChecks(result, useU, useD, useS);
  renderTrace(result.trace);
}

function renderIdle() {
  stateChips.innerHTML = '<span class="chip active">q0 — start</span>';
  resultBanner.className = 'banner banner-idle';
  resultBanner.textContent = 'awaiting input';
  checksEl.innerHTML = '';
  traceOutput.innerHTML = '<span class="trace-idle">No input yet. Type a password to see the trace.</span>';
}

function renderStateChips(result) {
  stateChips.innerHTML = '';
  const s = result.finalState;
  const labels = [];

  if (s === 'q4') {
    labels.push({ text: 'uppercase ✓', cls: 'active' });
    labels.push({ text: 'digit/special ✓', cls: 'active' });
    labels.push({ text: 'q4 — accept', cls: 'accept' });
  } else {
    const map = {
      q0: [],
      q1: ['uppercase'],
      q2: ['digit/special'],
      q3: ['uppercase', 'digit/special'],
    };
    const met = map[s] || [];
    if (met.length === 0) labels.push({ text: 'q0 — start', cls: 'active' });
    met.forEach(b => labels.push({ text: b + ' ✓', cls: 'active' }));

    const all = ['uppercase', 'digit/special'];
    all.filter(b => !met.includes(b)).forEach(b =>
      labels.push({ text: b + ' pending', cls: '' })
    );
    labels.push({ text: s, cls: 'active' });
  }

  labels.forEach(({ text, cls }) => {
    const el = document.createElement('span');
    el.className = 'chip ' + cls;
    el.textContent = text;
    stateChips.appendChild(el);
  });
}

function renderBanner(result, useU, useD, useS) {
  const noRules = !useU && !useD && !useS;
  const u = !useU || result.hasUpper;
  const d = !useD || result.hasDigit;
  const s = !useS || result.hasSpecial;
  const allMet = u && d && s;

  if (noRules || allMet) {
    resultBanner.className = 'banner banner-accept';
    resultBanner.textContent = 'ACCEPTED — password is valid';
  } else {
    resultBanner.className = 'banner banner-reject';
    resultBanner.textContent = 'REJECTED — requirements not yet met';
  }
}

function renderChecks(result, useU, useD, useS) {
  const items = [
    { label: 'At least 1 uppercase letter',   met: result.hasUpper,   active: useU },
    { label: 'At least 1 digit (0–9)',         met: result.hasDigit,   active: useD },
    { label: 'At least 1 special character',   met: result.hasSpecial, active: useS },
  ];

  checksEl.innerHTML = '';
  items.forEach(({ label, met, active }) => {
    const row = document.createElement('div');
    row.className = 'check-row';
    const dot = document.createElement('div');
    dot.className = 'dot ' + (!active ? 'dot-off' : met ? 'dot-pass' : 'dot-fail');
    const txt = document.createElement('span');
    txt.style.color = !active ? 'var(--dim)' : met ? 'var(--gold)' : 'var(--red)';
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

  const typeNames = { U: 'uppercase', D: 'digit', S: 'special', L: 'lowercase' };
  traceOutput.innerHTML = trace.map((step, i) => {
    const toClass = step.to === 'q4' ? 'is-accept' : '';
    const displayChar = step.char === ' ' ? '(space)' : step.char;
    return `<div class="trace-step">
      <span class="trace-char">${String(i + 1).padStart(2, '0')}: '${displayChar}'</span>
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
