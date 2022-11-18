const isSignal = v => v && v.peek

export default function signalStruct (values) {
  const signal = signalStruct.signal;
  if (!signal) throw Error('Signal must be defined');

  // 1. convert values to signals
  const copyLevel = (val) => {
    if (!val || typeof val === 'string' || typeof val === 'number')
      return signal(val)
    if (isSignal(val))
      return val
    if (Array.isArray(val))
      return val.map(copyLevel)
    if (val.constructor === Object)
      return Object.fromEntries(Object.entries(val).map(([key, val]) => [key, copyLevel(val)]))

    return signal(val)
  }
  const signals = copyLevel(values);

  // 2. build recursive accessor for signals
  const toAccessor = (signals) => {
    let out
    if (Array.isArray(signals)) {
      out = []
      for (let i = 0; i < signals.length; i++) defineAccessor(signals, i, out)
    }
    else if (signals.constructor === Object) {
      out = {}
      for (let key in signals) defineAccessor(signals, key, out)
    }
    return out
  }
  const defineAccessor = (signals, key, out) => {
    let s = signals[key]
    if (isSignal(s)) Object.defineProperty(out, key, { get(){ return s.value }, set(v){ s.value = v } })
    else out[key] = toAccessor(s)
  }

  return toAccessor(signals)
}
