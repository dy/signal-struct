import { signal, computed } from '@preact/signals-core'
// import { signal } from 'usignal/sync'
import sube, { observable } from 'sube'

const isSignal = v => v && v.peek
const isStruct = (v) => v && v[_struct]
const _struct = Symbol('signal-struct')

export default function SignalStruct (values) {
  if (isStruct(values)) return values;

  // define signal accessors - creates signals for all object props
  // FIXME: alternately can be done as Proxy for extended support
  let state, signals

  if (isObject(values)) {
    state = {}, signals = {}
    let desc = Object.getOwnPropertyDescriptors(values)
    for (let key in desc) signals[key] = defineSignal(state, key, desc[key].get ? computed(desc[key].get.bind(state)) : desc[key].value)
    Object.defineProperty(state, _struct, {configurable:false,enumerable:false,value:true})
    Object.seal(state)
    return state
  }

  if (Array.isArray(values)) {
    return values.map(v => SignalStruct(v))
  }

  return values
}

// defines signal accessor on an object
export function defineSignal (state, key, value) {
  let isObservable, s = isSignal(value) ? value :
      isObject(value) || Array.isArray(value) ? signal(SignalStruct(value)) :
      signal((isObservable = observable(value)) ? undefined : value)

  if (isObservable) sube(value, v => s.value = v)

  Object.defineProperty(state, key, {
    get() { return s.value },
    set:
      // FIXME: we can turn new props into defined props
      !isSignal(value) && isObject(value) ? v => (v ? Object.assign(s.value, v) : s.value = SignalStruct(v)) :
      // FIXME: if array contains objects, they can get merged instead of recreating
      v => (s.value = SignalStruct(v))
    ,
    enumerable: true,
    configurable: false
  })

  return s
}

function isObject(v) {
  return v && v.constructor === Object
}