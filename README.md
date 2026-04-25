# DFA Password Validator

A password validator built using a **Deterministic Finite Automaton (DFA)** — a project for Automata Theory & Formal Languages.

Live demo → https://ishigurotaiga.github.io/yakiYAWA/

---

## What is this

This project demonstrates how a DFA can be applied to a real-world problem: validating passwords. Each character of the password is read one at a time, and the automaton transitions between states depending on the character type. At the end of the string, the final state determines whether the password is accepted or rejected.

---

## The automaton

### Formal definition

A DFA is defined as a 5-tuple: **M = (Q, Σ, δ, q0, F)**

| Component | Value |
|-----------|-------|
| **Q** — states | { q0, q1, q2, q3, q4, q5, q6, qacc, qt } |
| **Σ** — alphabet | Uppercase, Digit, Special char, Lowercase |
| **δ** — transition function | See table below |
| **q0** — start state | q0 |
| **F** — accepting states | { qacc } (+ length check) |

### States

| State | Meaning | U | D | S | Accepts? |
|-------|---------|---|---|---|----------|
| q0 | Start — nothing satisfied | ✗ | ✗ | ✗ | No |
| q1 | Has uppercase | ✓ | ✗ | ✗ | No |
| q2 | Has digit | ✗ | ✓ | ✗ | No |
| q3 | Has special char | ✗ | ✗ | ✓ | No |
| q4 | Has uppercase + digit | ✓ | ✓ | ✗ | No |
| q5 | Has uppercase + special | ✓ | ✗ | ✓ | No |
| q6 | Has digit + special | ✗ | ✓ | ✓ | No |
| qacc | All three satisfied | ✓ | ✓ | ✓ | Yes* |
| **qt** | **Trap/dead state** | — | — | — | **No (forever)** |

> \* qacc only fully accepts if the password also meets the minimum length requirement, checked after the DFA finishes reading.

### Transition table (δ function)

| State | uppercase | digit | special | lowercase |
|-------|-----------|-------|---------|-----------|
| q0 | q1 | q2 | q3 | **qt** |
| q1 | q1 | q4 | q5 | **qt** |
| q2 | q4 | q2 | q6 | **qt** |
| q3 | q5 | q6 | q3 | **qt** |
| q4 | q4 | q4 | qacc | **qt** |
| q5 | q5 | qacc | q5 | **qt** |
| q6 | qacc | q6 | q6 | **qt** |
| qacc | qacc | qacc | qacc | qacc |
| **qt** | **qt** | **qt** | **qt** | **qt** |

### The trap/dead state (qt)

qt is a **non-accepting sink state**. Once the DFA enters qt, no transition can escape it:

```
δ(qt, x) = qt   for all input x ∈ Σ
```

In this implementation, qt is triggered when a lowercase letter is read before all 3 requirements are satisfied. This makes the DFA **complete** — every state has a defined transition for every possible input symbol.

---

## Features

- Live validation as you type
- Step-by-step trace of every DFA transition
- Configurable rules (toggle each requirement on/off)
- Adjustable minimum password length (1–20)
- Trap state detection with clear visual feedback
- State diagram, state table, and transition table all included on the page

---

## Files

```
dfa-password-validator/
├── index.html   ← main page (validator + explanation + tables)
├── style.css    ← all styles
├── dfa.js       ← DFA logic and DOM interaction
└── README.md    ← this file
```

---

## How to run locally

No build tools or frameworks needed. Just open the file:

```bash
git clone https://github.com/your-username/dfa-password-validator.git
cd dfa-password-validator
open index.html
```

Or drag `index.html` into your browser.

---

## How to host on GitHub Pages

1. Push this repo to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Under "Branch", select `main` and folder `/ (root)`
4. Click **Save**
5. Your site will be live at `https://your-username.github.io/dfa-password-validator`

---

## Example walkthrough

Password: `Hello1!`

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | H | uppercase | q0 | q1 |
| 2 | e | lowercase | q1 | **qt** ← TRAPPED |
| 3–7 | ... | — | qt | qt |

**Result: REJECTED** — lowercase `e` was read before all requirements were met, triggering the trap state.

---

Password: `H1!`

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | H | uppercase | q0 | q1 |
| 2 | 1 | digit | q1 | q4 |
| 3 | ! | special | q4 | **qacc** |

**Result: ACCEPTED** (if min length ≤ 3)

---

## Concepts covered

- Deterministic Finite Automata (DFA)
- Formal definition: 5-tuple (Q, Σ, δ, q0, F)
- State transitions and transition function δ
- Accepting vs non-accepting states
- Trap/dead states and completeness of a DFA
- Real-world application of formal language theory

---

## Built with

Plain HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

*Automata Theory & Formal Languages — 2025*
