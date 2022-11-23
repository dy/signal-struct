import { signal } from '@preact/signals-core'

export const isSignal = v => v && v.peek
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

  Object.seal(state)
  memo.add(state)

  return state
}

// defines signal accessor on an object
export function defineSignal (state, key, value) {
  let s = isSignal(value) ? value : (Array.isArray(value) || isObject(value)) ? signal(SignalStruct(value)) : signal(value)

  Object.defineProperty(state, key, {
    get() { return s.value },
    set:
      isSignal(value) ? v => s.value = v :
      // FIXME: array can have same lenght/members
      // if new value is array or object - convert it to signal struct
      Array.isArray(value) ? v => (s.value = v ? SignalStruct(v) : v) :
      // FIXME: object can be extended
      isObject(value) ? v => (v ? Object.assign(s.value, v) : s.value = v) :
      v => s.value = v
    ,
    enumerable: true,
    configurable: false
  })

  return s
}

function isObject(v) {
  return typeof v === 'object' && v !== null
}