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
| **Q** — states | { q0, q1, q2, q3, q4 } |
| **Σ** — alphabet | Uppercase (U), Digit (D), Special (S), Lowercase (L) |
| **δ** — transition function | See table below |
| **q0** — start state | q0 |
| **F** — accepting states | { q4 } |

### States

| State | Meaning | Has U | Has D/S | Accepts? |
|-------|---------|-------|---------|----------|
| q0 | Start — nothing satisfied | ✗ | ✗ | No |
| q1 | Has uppercase | ✓ | ✗ | No |
| q2 | Has digit or special | ✗ | ✓ | No |
| q3 | Has both — one step from accept | ✓ | ✓ | No |
| q4 | All requirements satisfied | ✓ | ✓ | Yes |

### Transition table (δ function)

Italic entries are **self-loops** — the state does not change.

| State | uppercase (U) | digit (D) | special (S) | lowercase (L) |
|-------|--------------|-----------|-------------|---------------|
| q0 | q1 | q2 | q2 | *q0* |
| q1 | *q1* | q3 | q3 | *q1* |
| q2 | q3 | *q2* | *q2* | q3 |
| q3 | q4 | q4 | q4 | q4 |
| q4 | *q4* | *q4* | *q4* | *q4* |

### How lowercase is handled

Lowercase letters are treated as **neutral characters** — they do not advance the DFA toward acceptance, but they do not cause rejection either. Most states loop back to themselves on a lowercase input:

```
δ(q, L) = q   for q ∈ { q0, q1, q2, q4 }
δ(q3, L) = q4   (q3 is the "both groups seen" state — any input completes it)
```

This keeps the DFA **complete** (every state has a defined transition for every input symbol) while allowing real-world passwords like `Hello1!` or `Password9#` to work correctly.

---

## Features

- Live validation as you type
- Step-by-step trace of every DFA transition
- Configurable rules (toggle each requirement on/off)
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

## Example walkthroughs

**Password: `Hello1!`**

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | H | uppercase | q0 | q1 |
| 2 | e | lowercase | q1 | q1 ← self-loop |
| 3 | l | lowercase | q1 | q1 ← self-loop |
| 4 | l | lowercase | q1 | q1 ← self-loop |
| 5 | o | lowercase | q1 | q1 ← self-loop |
| 6 | 1 | digit | q1 | q3 |
| 7 | ! | special | q3 | **q4** |

**Result: ACCEPTED**

---

**Password: `pass1A!`**

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | p | lowercase | q0 | q0 |
| 2 | a | lowercase | q0 | q0 |
| 3 | s | lowercase | q0 | q0 |
| 4 | s | lowercase | q0 | q0 |
| 5 | 1 | digit | q0 | q2 |
| 6 | A | uppercase | q2 | q3 |
| 7 | ! | special | q3 | **q4** |

**Result: ACCEPTED**

---

**Password: `abc123`** (no uppercase, no special)

| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | a | lowercase | q0 | q0 |
| 2 | b | lowercase | q0 | q0 |
| 3 | c | lowercase | q0 | q0 |
| 4 | 1 | digit | q0 | q2 |
| 5 | 2 | digit | q2 | q2 |
| 6 | 3 | digit | q2 | q2 |

**Result: REJECTED** — final state q2 is not accepting (missing uppercase)

---

## Built with

Plain HTML, CSS, and JavaScript — no frameworks, no dependencies.

---

*IshiguroTaiga :3*
