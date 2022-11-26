import { signal, computed } from '@preact/signals-core'
import sube, { observable } from 'sube'

const isSignal = v => v && v.peek
const isStruct = (v) => v[_struct]
const _struct = Symbol('signal-struct')

export default function SignalStruct (values) {
  if (isStruct(values)) return values;

  // define signal accessors
  // FIXME: alternately can be done as Proxy for extended support
  let state, signals
  if (isObject(values)) {
    state = {}, signals = {}
    for (let key in values) signals[key] = defineSignal(state, key, values[key])
  }
  else throw Error('Only array or object states are supported')

  Object.defineProperty(state, _struct, {configurable:false,enumerable:false,value:true})

  Object.seal(state)

  return state
}

// defines signal accessor on an object
export function defineSignal (state, key, value) {
  let isObservable, s = isSignal(value) ? value :
      isObject(value) ? signal(SignalStruct(value)) :
      signal((isObservable = observable(value)) ? undefined : value)

  if (isObservable) sube(value, v => s.value = v)

  Object.defineProperty(state, key, {
    get() { return s.value },
    set:
      isSignal(value) ? v => s.value = v :
      isObject(value) ? v => (v ? Object.assign(s.value, v) : s.value = v) :
      v => s.value = v
    ,
    enumerable: true,
    configurable: false
  })

  return s
}

function isObject(v) {
  return v && v.constructor === Object
}