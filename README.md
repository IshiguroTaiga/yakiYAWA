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
| **Q** — states | { q0, q1, q2, q3, q4, q5, q6, qacc } |
| **Σ** — alphabet | Uppercase (U), Digit (D), Special (S), Lowercase (L) |
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

> \* qacc only fully accepts if the password also meets the minimum length requirement, checked after the DFA finishes reading.

### Transition table (δ function)

Italic entries are **self-loops** — the state does not change.

| State | uppercase (U) | digit (D) | special (S) | lowercase (L) |
|-------|--------------|-----------|-------------|---------------|
| q0 | q1 | q2 | q3 | *q0* |
| q1 | *q1* | q4 | q5 | *q1* |
| q2 | q4 | *q2* | q6 | *q2* |
| q3 | q5 | q6 | *q3* | *q3* |
| q4 | *q4* | *q4* | qacc | *q4* |
| q5 | *q5* | qacc | *q5* | *q5* |
| q6 | qacc | *q6* | *q6* | *q6* |
| qacc | *qacc* | *qacc* | *qacc* | *qacc* |

### How lowercase is handled

Lowercase letters are treated as **neutral characters** — they do not advance the DFA toward acceptance, but they do not cause rejection either. Every state loops back to itself on a lowercase input:

```
δ(q, L) = q   for all states q ∈ Q
```

This keeps the DFA **complete** (every state has a defined transition for every input symbol) while allowing real-world passwords like `Hello1!` or `Password9#` to work correctly.

---

## Features

- Live validation as you type
- Step-by-step trace of every DFA transition
- Configurable rules (toggle each requirement on/off)
- Adjustable minimum password length (1–20)
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
git clone https://github.com/ishigurotaiga/yakiYAWA.git
cd yakiYAWA
open index.html
```

Or drag `index.html` into your browser.

---

## How to host on GitHub Pages

1. Push this repo to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Under "Branch", select `main` and folder `/ (root)`
4. Click **Save**
5. Your site will be live at `https://ishigurotaiga.github.io/yakiYAWA/`

---

## Example walkthroughs

Password: `Hello1!`

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | H | uppercase | q0 | q1 |
| 2 | e | lowercase | q1 | q1 ← self-loop |
| 3 | l | lowercase | q1 | q1 ← self-loop |
| 4 | l | lowercase | q1 | q1 ← self-loop |
| 5 | o | lowercase | q1 | q1 ← self-loop |
| 6 | 1 | digit | q1 | q4 |
| 7 | ! | special | q4 | **qacc** |

**Result: ACCEPTED** (if min length ≤ 7)

---

Password: `H1!`

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | H | uppercase | q0 | q1 |
| 2 | 1 | digit | q1 | q4 |
| 3 | ! | special | q4 | **qacc** |

**Result: ACCEPTED** (if min length ≤ 3)

---

Password: `abc123` (no uppercase, no special)

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | a | lowercase | q0 | q0 |
| 2 | b | lowercase | q0 | q0 |
| 3 | c | lowercase | q0 | q0 |
| 4 | 1 | digit | q0 | q2 |
| 5 | 2 | digit | q2 | q2 |
| 6 | 3 | digit | q2 | q2 |

**Result: REJECTED** — final state q2 is not accepting (missing uppercase and special character)

---

## Concepts covered

- Deterministic Finite Automata (DFA)
- Formal definition: 5-tuple (Q, Σ, δ, q0, F)
- State transitions and transition function δ
- Self-loops and neutral input symbols
- Accepting vs non-accepting states
- Complete DFA (transition defined for every state-input pair)
- Real-world application of formal language theory

---

## Built with

Plain HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

*Automata Theory & Formal Languages — 2025*
