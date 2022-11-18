
import signalStruct from './signal-struct.js'
// import { signal, computed, effect } from '@preact/signals'
import { signal, computed, effect } from 'usignal/sync'
import assert from 'node:assert'

signalStruct.signal = signal

let s = signalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i: signal(3) }
})

// subscribes to only x and y without need for .value access
const zilog = []
effect(() => zilog.push(s.z.i))
let xy = computed(() => s.x + s.y)
assert.equal(xy, 1)
s.x = 2
s.y = 3
assert.equal(xy.value, 5)
s.y = 4
assert.equal(xy.value, 6)
assert.deepEqual(zilog, [3])

// subscribes to deep values too: only z.r and z.i update result
let len = computed(() => (s.z.r**2 + s.z.i**2)**0.5)
s.z.r = 3
s.z.i = 4
assert.equal(len.value, 5)
s.z.r = 4
s.z.i = 3
assert.equal(len.value, 5)