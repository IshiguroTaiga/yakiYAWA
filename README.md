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
### Why 5 states instead of 8?
The original design used 8 states (q0–q6, qacc) to individually track every combination of uppercase, digit, and special. The minimized version observes that **digit and special can be grouped** — both serve the same role in satisfying the "non-uppercase" requirement. This collapses q2+q3 into one state and q5+q6 into another, reducing the automaton from 8 states to 5 without changing what it accepts.
Fewer states → fewer transitions → faster processing and a simpler, more elegant machine.
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
Lowercase letters are **neutral** — they do not advance the DFA toward acceptance on their own, but they don't cause rejection either. q0 self-loops on lowercase because seeing only lowercase letters means no meaningful requirement has been met yet. Only an uppercase, digit, or special character causes a state change from q0.
```
δ(q0, L) = q0   (self-loop — no progress without U, D, or S)
δ(q1, L) = q1   (self-loop — uppercase already seen, waiting for D/S)
δ(q2, L) = q3   (advances — digit/special seen, lowercase counts as U-path)
δ(q3, L) = q4   (any input completes it)
δ(q4, L) = q4   (sink accept — self-loop)
```
This keeps the DFA **complete** while ensuring the automaton itself rejects passwords like `abc123` — they end at q2, not q4, because no uppercase was ever seen.
---
## Features
- Live validation as you type
- Step-by-step trace of every DFA transition
- Configurable rules (toggle each requirement on/off)
- State diagram, state table, and transition table all included on the page
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
| 1 | p | lowercase | q0 | q0 ← self-loop |
| 2 | a | lowercase | q0 | q0 ← self-loop |
| 3 | s | lowercase | q0 | q0 ← self-loop |
| 4 | s | lowercase | q0 | q0 ← self-loop |
| 5 | 1 | digit | q0 | q2 |
| 6 | A | uppercase | q2 | q3 |
| 7 | ! | special | q3 | **q4** |
**Result: ACCEPTED**
---
**Password: `abc123`** (no uppercase, no special)
| Step | Char | Type | From | To |
|------|------|------|------|----|
| 1 | a | lowercase | q0 | q0 ← self-loop |
| 2 | b | lowercase | q0 | q0 ← self-loop |
| 3 | c | lowercase | q0 | q0 ← self-loop |
| 4 | 1 | digit | q0 | q2 |
| 5 | 2 | digit | q2 | q2 ← self-loop |
| 6 | 3 | digit | q2 | q2 ← self-loop |
**Result: REJECTED** — final state q2 is not an accepting state. No uppercase was ever seen so the DFA never left the digit/special path.
---
## Built with
Plain HTML, CSS, and JavaScript — no frameworks, no dependencies.
---
*IshiguroTaiga :3*
