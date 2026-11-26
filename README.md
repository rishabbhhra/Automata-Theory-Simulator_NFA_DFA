# ⚡ DFA / NFA Automata Simulator

<p align="center">
  🎯 <b>Design, visualize, and simulate finite automata in real time</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React_Flow-@xyflow/react-FF0072" alt="React Flow" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## 🧠 Overview

An interactive, web-based visual simulator for **Deterministic Finite Automata (DFA)** and **Non-Deterministic Finite Automata (NFA)**. Designed to transform theoretical computer science and automata theory concepts into a tangible, intuitive, and interactive experience.

Easily create states, draw directional transitions, configure alphabets, and step through input string processing in real time with comprehensive visual feedback.

---

## 🚀 Features

✨ **Interactive Graph Canvas**  
- Click-to-add states with custom naming.
- Directional transition arrows rendered right on the path, curving naturally to distinguish outgoing vs. incoming transitions.
- Self-loop transitions with clean top-anchored loops.
- Draggable nodes with smooth real-time edge recalculation.

🔀 **DFA & NFA Simulation Engines & Theory Tools**  
- **DFA Mode**: Strict deterministic transitions with instant alphabet definition and completeness validation.
- **NFA Mode**: Full support for non-determinism, branching paths, and **ε-transitions (epsilon transitions)** with epsilon-closure calculation.
- **NFA → DFA Converter**: Automatic Subset Construction (powerset construction) with ε-closure handling.
- **DFA Minimization**: Unreachable state pruning and partition refinement to minimize states.
- **Regex → NFA Generator**: Thompson's Construction supporting `|`, `*`, `+`, `?`, concatenation, and parentheses.
- **Transition Table & Batch Tester**: Formal $\delta(q, \sigma)$ matrix view and multi-string batch evaluation.
- **Presets & JSON Export/Import**: Built-in textbook automata presets plus save/load JSON support.

▶️ **Execution & Debugging Modes**  
- **Continuous Mode**: Auto-run simulation with configurable speed slider (`0.5×` to `3×`).
- **Discrete Mode**: Step-by-step forward and backward debugging to inspect state transitions token by token.
- **Pause, Stop & Reset**: Pause, resume, stop, or reset the simulation at any point.

🎯 **Visual Feedback & State Highlights**  
- Live glowing indicators on active states and traversed edges.
- Animated dot pulses along active transitions.
- Instant acceptance (green glow) or rejection (red glow) status upon string evaluation.

📜 **Step-by-Step Simulation Log**  
- Detailed execution history showing current states, consumed tokens, remaining input, and next valid transitions.

🎨 **Modern Dark Aesthetic**  
- Built with a sleek dark theme, glowing neon accents, blur backdrops, and fluid Framer Motion animations.

---

## 🛠️ Tech Stack

- ⚛️ **React 18** – UI library
- ⚡ **Vite** – Next-generation frontend build tooling
- 🔗 **React Flow (`@xyflow/react`)** – Graph and canvas orchestration
- 🎨 **Tailwind CSS** – Styling and responsive layout
- 🎞️ **Framer Motion** – Animations and micro-interactions
- 🔣 **Lucide React** – Clean icon set

---

## 📦 Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rishabbhhra/Automata-Theory-Simulator_NFA_DFA.git
   cd Automata-Theory-Simulator_NFA_DFA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🎮 How to Use

1. **Add States**: Click the **Add State** mode or click anywhere on the canvas to place a new state.
2. **Configure States**: Hover over a state to set it as **Start State** (S), toggle **Accept State** (A), or delete it (×). Double-click to rename.
3. **Add Transitions**: Click the **Add Transition** tool, click the source state, click the target state, and enter the transition symbol(s) (e.g. `a`, `b`, or `ε`).
4. **Define Alphabet**: In DFA mode, set your formal alphabet symbols (e.g., `0, 1` or `a, b`).
5. **Run Simulation**: Enter an input string in the simulation panel, select **Continuous** or **Step-by-Step**, and click **Simulate**.

---

## 📄 License

This project is licensed under the MIT License.
