import { signal, batch } from '@preact/signals-core'

const isSignal = v => v && v.peek

export default function signalStruct (values, root) {
  // 1. convert values to signals
  const toSignal = (val) => {
    if (!val || typeof val === 'string' || typeof val === 'number') return signal(val)
    if (isSignal(val)) return val
    if (Array.isArray(val)) return val.map(toSignal)
    if (Object(val) === val) {
      return Object.fromEntries(Object.entries(val).map(([key, val]) => [key, toSignal(val)]))
    }
    return signal(val)
  }
  const signals = toSignal(values);

  // 2. build recursive accessor for signals
  const toAccessor = (signals) => {
    let out
    if (Array.isArray(signals)) {
      out = []
      for (let i = 0; i < signals.length; i++) defineAccessor(signals[i], i, out)
    }
    else if (Object(signals) === signals) {
      out = {}
      for (let key in signals) defineAccessor(signals[key], key, out)
    }
    return out
  }
  const defineAccessor = (signal, key, out) => {
    if (isSignal(signal)) Object.defineProperty(out, key, {
      get(){ return signal.value }, set(v){ signal.value = v },
      enumerable: true, configurable: false
    })
    else out[key] = toAccessor(signal)
  }

  let state = toAccessor(signals)

  // expose batch-update & signals via destructure
  Object.defineProperty(state, Symbol.iterator, {
    value: function*(){ yield signals; yield (diff) => batch(() => deepAssign(state, diff)); },
    enumerable: false,
    configurable: false
  });


  return state
}

function deepAssign(target, source) {
  for (let k in source) {
    let vs = source[k], vt = target[k]
    if (Object(vs) === vs && Object(vt) === vt) {
      target[k] = deepAssign(vt, vs)
    }
    else target[k] = source[k]
  }
  return target
}