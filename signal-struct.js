import { signal, batch } from '@preact/signals-core'

const isSignal = v => v && v.peek
const memo = new WeakSet

export const isStruct = (v) => memo.has(v)

export default function SignalStruct (values) {
  if (isStruct(values)) return values;

  // define signal accessors
  // FIXME: alternately can be done as Proxy for extended support
  let state, signals
  if (Array.isArray(values)) {
    state = [], signals = []
    for (let i = 0; i < values.length; i++) signals.push(defineSignal(state, i, values[i]))
  }
  else if (isObject(values)) {
    state = {}, signals = {}
    for (let key in values) signals[key] = defineSignal(state, key, values[key])
  }
  else throw Error('Only array or object states are supported')

  // expose batch-update & signals via destructure
  Object.defineProperty(state, Symbol.iterator, {
    value: function*(){ yield signals; yield (diff) => batch(() => deepAssign(state, diff)); },
    enumerable: false,
    configurable: false
  });
  Object.seal(state)
  memo.add(state)

  return state
}


export function defineSignal (state, key, value) {
  let s
  if (!isSignal(value) && (Array.isArray(value) || isObject(value))) {
    s = signal(SignalStruct(value))
    Object.defineProperty(state, key, {
      get() { return s.value },
      set(newValue) {
        // if new value is array or object - convert it to signal struct
        s.value = SignalStruct(newValue)
      },
      enumerable: true,
      configurable: false
    })
  }
  else {
    s = isSignal(value) ? value : signal(value)
    Object.defineProperty(state, key, {
      get(){ return s.value },
      set(newValue){ s.value = newValue },
      enumerable: true,
      configurable: false
    })
  }
  return s
}

function deepAssign(target, source) {
  for (let k in source) {
    let vs = source[k], vt = target[k]
    if (isObject(vs) && isObject(vt)) {
      target[k] = deepAssign(vt, vs)
    }
    else target[k] = source[k]
  }
  return target
}

function isObject(v) {
  return typeof v === 'object' && v !== null
}