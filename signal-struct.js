import { signal, computed } from '@preact/signals-core'
// import { signal, computed } from 'usignal/sync'
// import { signal, computed } from '@webreflection/signal'
import sube, { observable } from 'sube'

const isSignal = v => v && v.peek
const isStruct = (v) => v && v[_struct]
const _struct = Symbol('signal-struct')

signalStruct.isStruct = isStruct

export default function signalStruct (values, proto) {
  if (isStruct(values) && !proto) return values;

  // define signal accessors - creates signals for all object props

  if (isObject(values)) {
    const
      state = Object.create(proto || Object.getPrototypeOf(values)),
      signals = {},
      descs = Object.getOwnPropertyDescriptors(values)

    // define signal accessors for exported object
    for (let key in descs) {
      let desc = descs[key]

      // getter turns into computed
      if (desc.get) {
        let s = signals[key] = computed(desc.get.bind(state))
        Object.defineProperty(state, key, {
          get(){ return s.value },
          set: desc.set?.bind(state),
          configurable: false,
          enumerable: true
        })
      }
      // regular value creates signal accessor
      else {
        let value = desc.value
        let isObservable,
          s = isSignal(value) ? value :
          // FIXME: why do we wrap signal struct into signal here?
          isObject(value) || Array.isArray(value) ? signal(signalStruct(value)) :
          signal((isObservable = observable(value)) ? undefined : value)

        // observables handle
        if (isObservable) sube(value, v => s.value = v)

        // save signal to signals hash
        signals[key] = s

        // define property accessor on struct
        Object.defineProperty(state, key, {
          get() { return s.value },
          set(v) {
            if (isObject(v)) {
              // new object can have another schema than the new one, therefore we try
              if (isObject(s.value)) try {
                Object.assign(s.value, v);
                return
              } catch (e) {}
              s.value = signalStruct(v)
            }
            else s.value = v;
          },
          enumerable: true,
          configurable: false
        })
      }
    }

    Object.defineProperty(state, _struct, {configurable:false,enumerable:false,value:true})
    return state
  }

  if (Array.isArray(values)) {
    return values.map(v => signalStruct(v))
  }

  return values
}

function isObject(v) {
  return (v && v.constructor === Object)
}