/**
 * Automata Engine — DFA and NFA simulation utilities
 */

/**
 * Compute the epsilon-closure of a set of states.
 * Returns all states reachable from the given states via ε-transitions.
 */
export function epsilonClosure(stateIds, transitions) {
  const closure = new Set(stateIds);
  const stack = [...stateIds];

  while (stack.length > 0) {
    const curr = stack.pop();
    transitions
      .filter(t => t.from === curr && t.label === 'ε')
      .forEach(t => {
        if (!closure.has(t.to)) {
          closure.add(t.to);
          stack.push(t.to);
        }
      });
  }

  return [...closure];
}

/**
 * Compute DFA simulation steps.
 * Returns { steps: Step[], accepted: boolean }
 *
 * Each Step: {
 *   stepIndex, activeStates, activeTransitions,
 *   consumed, remaining, symbol, description, dead
 * }
 */
export function computeDFASteps(inputString, startStateId, transitions, states) {
  const steps = [];
  let current = startStateId;

  steps.push({
    stepIndex: 0,
    activeStates: [current],
    activeTransitions: [],
    consumed: '',
    remaining: inputString,
    symbol: null,
    description: `Initial state: ${current}`,
    dead: false,
  });

  if (inputString === '') {
    const finalState = states.find(s => s.id === current);
    return {
      steps,
      accepted: finalState?.isAccept ?? false,
    };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const trans = transitions.find(t => t.from === current && t.label === symbol);

    if (!trans) {
      steps.push({
        stepIndex: i + 1,
        activeStates: [],
        activeTransitions: [],
        consumed: inputString.slice(0, i + 1),
        remaining: inputString.slice(i + 1),
        symbol,
        fromState: current,
        description: `No transition from ${current} on '${symbol}' → DEAD STATE`,
        dead: true,
      });
      return { steps, accepted: false };
    }

    steps.push({
      stepIndex: i + 1,
      activeStates: [trans.to],
      activeTransitions: [trans.id],
      consumed: inputString.slice(0, i + 1),
      remaining: inputString.slice(i + 1),
      symbol,
      fromState: current,
      description: `${current} →[${symbol}]→ ${trans.to}`,
      dead: false,
    });

    current = trans.to;
  }

  const finalState = states.find(s => s.id === current);
  const accepted = finalState?.isAccept ?? false;

  return { steps, accepted };
}

/**
 * Compute NFA simulation steps.
 * Returns { steps: Step[], accepted: boolean }
 */
export function computeNFASteps(inputString, startStateId, transitions, states) {
  const steps = [];
  let currentStates = epsilonClosure([startStateId], transitions);

  const ecStr = currentStates.length > 1
    ? ` (ε-closure: {${currentStates.join(', ')}})`
    : '';

  steps.push({
    stepIndex: 0,
    activeStates: currentStates,
    activeTransitions: [],
    consumed: '',
    remaining: inputString,
    symbol: null,
    description: `Initial: {${startStateId}}${ecStr}`,
    dead: false,
  });

  if (inputString === '') {
    const accepted = currentStates.some(id => states.find(s => s.id === id)?.isAccept);
    return { steps, accepted };
  }

  for (let i = 0; i < inputString.length; i++) {
    const symbol = inputString[i];
    const nextRaw = new Set();
    const usedTransitions = [];

    currentStates.forEach(stateId => {
      transitions
        .filter(t => t.from === stateId && t.label === symbol)
        .forEach(t => {
          nextRaw.add(t.to);
          usedTransitions.push(t.id);
        });
    });

    const nextStates = epsilonClosure([...nextRaw], transitions);
    const ecExtra = nextStates.length > nextRaw.size && nextRaw.size > 0
      ? ` +ε→ {${nextStates.join(', ')}}`
      : '';

    steps.push({
      stepIndex: i + 1,
      activeStates: nextStates,
      activeTransitions: usedTransitions,
      consumed: inputString.slice(0, i + 1),
      remaining: inputString.slice(i + 1),
      symbol,
      fromStates: currentStates,
      description:
        nextStates.length === 0
          ? `Read '${symbol}': {${currentStates.join(', ')}} → ∅ (DEAD)`
          : `Read '${symbol}': {${currentStates.join(', ')}} → {${[...nextRaw].join(', ')}}${ecExtra}`,
      dead: nextStates.length === 0,
    });

    currentStates = nextStates;
    if (currentStates.length === 0) break;
  }

  const accepted = currentStates.some(id => states.find(s => s.id === id)?.isAccept);
  return { steps, accepted };
}

/**
 * Validate automata configuration
 * @param {Array} states
 * @param {Array} transitions
 * @param {string} mode - 'DFA' | 'NFA'
 * @param {Array} definedAlphabet - user-defined alphabet symbols (DFA only)
 */
export function validateAutomata(states, transitions, mode, definedAlphabet = []) {
  const errors = [];
  const warnings = [];

  if (states.length === 0) {
    errors.push('No states defined.');
    return { errors, warnings };
  }

  const startStates = states.filter(s => s.isStart);
  if (startStates.length === 0) {
    errors.push('No start state defined. Hover a state and click "S" to set it.');
  } else if (startStates.length > 1 && mode === 'DFA') {
    errors.push('DFA must have exactly one start state.');
  }

  if (states.filter(s => s.isAccept).length === 0) {
    errors.push('No accepting states defined. Hover a state and click "A" to set one.');
  }

  if (mode === 'DFA') {
    const epsCount = transitions.filter(t => t.label === 'ε').length;
    if (epsCount > 0) {
      errors.push(`DFA has ${epsCount} ε-transition(s) — switch to NFA mode or remove them.`);
    }

    // Use defined alphabet if available, otherwise infer from transitions
    const alphabet = definedAlphabet.length > 0
      ? definedAlphabet
      : [...new Set(transitions.map(t => t.label).filter(l => l !== 'ε'))];

    // Check for non-determinism (multiple transitions from same state on same symbol)
    alphabet.forEach(symbol => {
      states.forEach(state => {
        const count = transitions.filter(t => t.from === state.id && t.label === symbol).length;
        if (count > 1) {
          errors.push(`DFA conflict: state "${state.id}" has ${count} transitions on '${symbol}'.`);
        }
      });
    });

    // n × m completeness check (only when alphabet is explicitly defined)
    if (definedAlphabet.length > 0 && states.length > 0) {
      const n = states.length;
      const m = definedAlphabet.length;
      const expected = n * m;
      const actual = transitions.filter(t => definedAlphabet.includes(t.label)).length;

      if (actual < expected) {
        // Find exactly which (state, symbol) pairs are missing
        const missing = [];
        states.forEach(state => {
          definedAlphabet.forEach(symbol => {
            const has = transitions.some(t => t.from === state.id && t.label === symbol);
            if (!has) missing.push(`${state.label ?? state.id} on '${symbol}'`);
          });
        });

        errors.push(
          `Incomplete DFA: expected ${expected} transitions (${n} states × ${m} symbols), ` +
          `found ${actual}. Missing: ${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '...' : ''}.`
        );
      }
    }
  }

  return { errors, warnings };
}

/**
 * Helper: arrange states neatly in a horizontal/grid layout
 */
function layoutStatesGrid(count, startX = 120, startY = 180, spacingX = 180, spacingY = 150) {
  const cols = Math.max(2, Math.ceil(Math.sqrt(count)));
  return Array.from({ length: count }, (_, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    return {
      x: startX + col * spacingX,
      y: startY + row * spacingY,
    };
  });
}

/**
 * Convert an NFA (with or without ε-transitions) to an equivalent complete DFA
 * using Subset Construction (Powerset Construction).
 */
export function convertNFAtoDFA(states, transitions) {
  const startState = states.find(s => s.isStart);
  if (!startState) {
    return { error: 'Cannot convert: no start state defined.' };
  }

  const alphabet = [...new Set(transitions.map(t => t.label).filter(l => l && l !== 'ε'))].sort();
  if (alphabet.length === 0) {
    return { error: 'Cannot convert: NFA has no non-ε transitions.' };
  }

  const acceptSet = new Set(states.filter(s => s.isAccept).map(s => s.id));
  const labelMap = new Map(states.map(s => [s.id, s.label || s.id]));

  const keyOf = (arr) => [...new Set(arr)].sort().join(',');

  const startClosure = epsilonClosure([startState.id], transitions).sort();
  const startKey = keyOf(startClosure);

  const subsetMap = new Map(); // key -> { id, subset, isStart, isAccept }
  const queue = [];
  let counter = 0;

  const getOrCreateDfaState = (subset, isStart = false) => {
    const sorted = [...new Set(subset)].sort();
    const key = keyOf(sorted);
    if (subsetMap.has(key)) return subsetMap.get(key);

    const id = `q${counter++}`;
    const prettyLabel = sorted.length === 0
      ? '∅'
      : sorted.length === 1
        ? (labelMap.get(sorted[0]) ?? sorted[0])
        : `{${sorted.map(s => labelMap.get(s) ?? s).join(',')}}`;

    const entry = {
      id,
      key,
      subset: sorted,
      label: prettyLabel.length > 8 ? id : prettyLabel,
      isStart,
      isAccept: sorted.some(s => acceptSet.has(s)),
    };
    subsetMap.set(key, entry);
    queue.push(entry);
    return entry;
  };

  getOrCreateDfaState(startClosure, true);
  const dfaTransitions = [];
  let tIdx = 0;

  while (queue.length > 0) {
    const curr = queue.shift();
    for (const sym of alphabet) {
      const moveSet = new Set();
      for (const nfaId of curr.subset) {
        transitions
          .filter(t => t.from === nfaId && t.label === sym)
          .forEach(t => moveSet.add(t.to));
      }
      const nextClosure = epsilonClosure([...moveSet], transitions);
      const target = getOrCreateDfaState(nextClosure, false);
      dfaTransitions.push({
        id: `t_${curr.id}_${target.id}_${sym}_${tIdx++}`,
        from: curr.id,
        to: target.id,
        label: sym,
      });
    }
  }

  const entries = [...subsetMap.values()];
  const positions = layoutStatesGrid(entries.length);
  const dfaStates = entries.map((e, i) => ({
    id: e.id,
    label: e.label,
    isStart: e.isStart,
    isAccept: e.isAccept,
    position: positions[i],
  }));

  return {
    states: dfaStates,
    transitions: dfaTransitions,
    alphabet,
    beforeCount: states.length,
    afterCount: dfaStates.length,
  };
}

/**
 * Minimize a DFA using unreachable-state pruning + partition refinement.
 */
export function minimizeDFA(states, transitions, definedAlphabet = []) {
  const { errors } = validateAutomata(states, transitions, 'DFA', definedAlphabet);
  if (errors.length > 0) {
    return { error: errors[0] };
  }

  const alphabet = definedAlphabet.length > 0
    ? [...definedAlphabet]
    : [...new Set(transitions.map(t => t.label).filter(l => l !== 'ε'))];

  if (alphabet.length === 0) {
    return { error: 'Cannot minimize: no alphabet symbols defined.' };
  }

  const startState = states.find(s => s.isStart);

  // 1. Find reachable states via BFS
  const reachable = new Set([startState.id]);
  const bfs = [startState.id];
  while (bfs.length > 0) {
    const curr = bfs.shift();
    for (const sym of alphabet) {
      const t = transitions.find(tr => tr.from === curr && tr.label === sym);
      if (t && !reachable.has(t.to)) {
        reachable.add(t.to);
        bfs.push(t.to);
      }
    }
  }

  const reachStates = states.filter(s => reachable.has(s.id));
  const stateIds = reachStates.map(s => s.id);
  const acceptSet = new Set(reachStates.filter(s => s.isAccept).map(s => s.id));

  // Transition lookup
  const transFn = (sId, sym) => {
    const t = transitions.find(tr => tr.from === sId && tr.label === sym);
    return t ? t.to : null;
  };

  // 2. Initial partition: [accepting, non-accepting]
  const accGroup = stateIds.filter(id => acceptSet.has(id));
  const nonAccGroup = stateIds.filter(id => !acceptSet.has(id));
  let partitions = [accGroup, nonAccGroup].filter(g => g.length > 0);

  const findGroupIndex = (parts, sId) => {
    if (sId === null) return -1;
    return parts.findIndex(g => g.includes(sId));
  };

  // 3. Refine partitions until convergence
  let changed = true;
  while (changed) {
    changed = false;
    const nextPartitions = [];

    for (const group of partitions) {
      if (group.length <= 1) {
        nextPartitions.push(group);
        continue;
      }

      const subGroups = new Map();
      for (const sId of group) {
        const sig = alphabet.map(sym => findGroupIndex(partitions, transFn(sId, sym))).join('|');
        if (!subGroups.has(sig)) subGroups.set(sig, []);
        subGroups.get(sig).push(sId);
      }

      if (subGroups.size > 1) changed = true;
      for (const sg of subGroups.values()) {
        nextPartitions.push(sg);
      }
    }

    partitions = nextPartitions;
  }

  // Ensure start state's group is first (q0)
  const startGroupIdx = partitions.findIndex(g => g.includes(startState.id));
  if (startGroupIdx > 0) {
    const [sg] = partitions.splice(startGroupIdx, 1);
    partitions.unshift(sg);
  }

  // 4. Build minimized DFA
  const oldToNewId = new Map();
  partitions.forEach((group, idx) => {
    const newId = `q${idx}`;
    group.forEach(oldId => oldToNewId.set(oldId, newId));
  });

  const positions = layoutStatesGrid(partitions.length);
  const minStates = partitions.map((group, idx) => ({
    id: `q${idx}`,
    label: `q${idx}`,
    isStart: group.includes(startState.id),
    isAccept: group.some(id => acceptSet.has(id)),
    position: positions[idx],
  }));

  const minTransitions = [];
  let tIdx = 0;
  partitions.forEach((group, idx) => {
    const rep = group[0];
    const fromId = `q${idx}`;
    for (const sym of alphabet) {
      const targetOld = transFn(rep, sym);
      if (targetOld !== null) {
        const toId = oldToNewId.get(targetOld);
        minTransitions.push({
          id: `t_${fromId}_${toId}_${sym}_${tIdx++}`,
          from: fromId,
          to: toId,
          label: sym,
        });
      }
    }
  });

  return {
    states: minStates,
    transitions: minTransitions,
    alphabet,
    beforeCount: states.length,
    afterCount: minStates.length,
  };
}

/**
 * Convert a Regular Expression to an NFA using Thompson's Construction.
 * Supports: literals, union (|), concatenation, Kleene star (*), plus (+), optional (?), parentheses ().
 */
export function regexToNFA(rawRegex) {
  const regex = (rawRegex || '').replace(/\s+/g, '');
  if (!regex) {
    return { error: 'Please enter a regular expression.' };
  }

  const isOp = (c) => ['|', '*', '+', '?', '(', ')', '.'].includes(c);
  const isUnary = (c) => ['*', '+', '?'].includes(c);

  // Validate balanced parentheses
  let depth = 0;
  for (const c of regex) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth < 0) return { error: 'Unbalanced parentheses in regex.' };
  }
  if (depth !== 0) return { error: 'Unbalanced parentheses in regex.' };

  // Insert explicit concatenation operator '.'
  let explicit = '';
  for (let i = 0; i < regex.length; i++) {
    const c1 = regex[i];
    explicit += c1;
    if (i + 1 < regex.length) {
      const c2 = regex[i + 1];
      const c1EndsExpr = !isOp(c1) || c1 === ')' || isUnary(c1);
      const c2StartsExpr = !isOp(c2) || c2 === '(';
      if (c1EndsExpr && c2StartsExpr) {
        explicit += '.';
      }
    }
  }

  // Shunting-yard to postfix
  const prec = { '|': 1, '.': 2, '*': 3, '+': 3, '?': 3 };
  const output = [];
  const ops = [];

  for (const token of explicit) {
    if (!isOp(token)) {
      output.push(token);
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length > 0 && ops[ops.length - 1] !== '(') {
        output.push(ops.pop());
      }
      ops.pop();
    } else {
      while (
        ops.length > 0 &&
        ops[ops.length - 1] !== '(' &&
        (prec[ops[ops.length - 1]] ?? 0) >= (prec[token] ?? 0)
      ) {
        output.push(ops.pop());
      }
      ops.push(token);
    }
  }
  while (ops.length > 0) {
    output.push(ops.pop());
  }

  // Thompson's Construction
  let stateSeq = 0;
  let transSeq = 0;
  const newState = () => `s${stateSeq++}`;
  const transitions = [];
  const addTrans = (from, to, label) => {
    transitions.push({ id: `rt_${transSeq++}`, from, to, label });
  };

  const stack = [];
  const alphabetSet = new Set();

  for (const tok of output) {
    if (!isOp(tok)) {
      const s = newState();
      const e = newState();
      const sym = tok === 'ε' ? 'ε' : tok;
      if (sym !== 'ε') alphabetSet.add(sym);
      addTrans(s, e, sym);
      stack.push({ start: s, end: e });
    } else if (tok === '.') {
      const b = stack.pop();
      const a = stack.pop();
      if (!a || !b) return { error: 'Invalid concatenation in regex.' };
      addTrans(a.end, b.start, 'ε');
      stack.push({ start: a.start, end: b.end });
    } else if (tok === '|') {
      const b = stack.pop();
      const a = stack.pop();
      if (!a || !b) return { error: 'Invalid union (|) in regex.' };
      const s = newState();
      const e = newState();
      addTrans(s, a.start, 'ε');
      addTrans(s, b.start, 'ε');
      addTrans(a.end, e, 'ε');
      addTrans(b.end, e, 'ε');
      stack.push({ start: s, end: e });
    } else if (tok === '*') {
      const a = stack.pop();
      if (!a) return { error: 'Invalid Kleene star (*) in regex.' };
      const s = newState();
      const e = newState();
      addTrans(s, a.start, 'ε');
      addTrans(s, e, 'ε');
      addTrans(a.end, a.start, 'ε');
      addTrans(a.end, e, 'ε');
      stack.push({ start: s, end: e });
    } else if (tok === '+') {
      const a = stack.pop();
      if (!a) return { error: 'Invalid plus (+) in regex.' };
      const s = newState();
      const e = newState();
      addTrans(s, a.start, 'ε');
      addTrans(a.end, a.start, 'ε');
      addTrans(a.end, e, 'ε');
      stack.push({ start: s, end: e });
    } else if (tok === '?') {
      const a = stack.pop();
      if (!a) return { error: 'Invalid optional (?) in regex.' };
      const s = newState();
      const e = newState();
      addTrans(s, a.start, 'ε');
      addTrans(s, e, 'ε');
      addTrans(a.end, e, 'ε');
      stack.push({ start: s, end: e });
    }
  }

  if (stack.length !== 1) {
    return { error: 'Invalid regular expression syntax.' };
  }

  const frag = stack[0];

  // BFS from start to assign clean q0, q1... IDs and layered (x, y) positions
  const order = [];
  const depthMap = new Map([[frag.start, 0]]);
  const q = [frag.start];
  while (q.length > 0) {
    const curr = q.shift();
    order.push(curr);
    const d = depthMap.get(curr);
    transitions
      .filter(t => t.from === curr)
      .forEach(t => {
        if (!depthMap.has(t.to)) {
          depthMap.set(t.to, d + 1);
          q.push(t.to);
        }
      });
  }

  const idRename = new Map();
  order.forEach((oldId, i) => idRename.set(oldId, `q${i}`));

  // Group by layer depth for clean horizontal layout
  const layers = new Map();
  order.forEach(oldId => {
    const d = depthMap.get(oldId);
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d).push(oldId);
  });

  const nfaStates = order.map(oldId => {
    const newId = idRename.get(oldId);
    const d = depthMap.get(oldId);
    const colList = layers.get(d);
    const rowIdx = colList.indexOf(oldId);
    const totalRows = colList.length;
    const yOffset = (rowIdx - (totalRows - 1) / 2) * 115;

    return {
      id: newId,
      label: newId,
      isStart: oldId === frag.start,
      isAccept: oldId === frag.end,
      position: { x: 80 + d * 145, y: 220 + yOffset },
    };
  });

  const nfaTransitions = transitions.map((t, i) => ({
    id: `t_rx_${i}`,
    from: idRename.get(t.from),
    to: idRename.get(t.to),
    label: t.label,
  }));

  return {
    states: nfaStates,
    transitions: nfaTransitions,
    alphabet: [...alphabetSet].sort(),
  };
}

/**
 * Run batch simulation on a list of input strings.
 */
export function batchTestAutomata(inputs, states, transitions, mode, alphabet = []) {
  const { errors } = validateAutomata(states, transitions, mode, alphabet);
  if (errors.length > 0) {
    return { error: errors[0] };
  }

  const startState = states.find(s => s.isStart);
  const results = inputs.map(raw => {
    const str = raw === 'ε' ? '' : raw;
    const res = mode === 'DFA'
      ? computeDFASteps(str, startState.id, transitions, states)
      : computeNFASteps(str, startState.id, transitions, states);
    return {
      input: raw === '' ? 'ε' : raw,
      accepted: res.accepted,
      stepCount: res.steps.length - 1,
    };
  });

  return { results };
}
