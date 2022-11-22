
import signalStruct from './signal-struct.js'
import { signal, computed, effect } from '@preact/signals-core'
// import { signal, computed, effect } from 'usignal/sync'
import assert from 'node:assert'

let s = signalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i: signal(3) },
  v: function(){return 1}
})

// functions are signals too
assert.equal(s.v(), 1)
// subscribes to only x and y without need for .value access
const zilog = []
effect(() => zilog.push(s.z.i))
let xy = computed(() => s.x + s.y)
assert.equal(xy.value, 1)
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

// updating internal objects/arrays turns them into signals too
s.z = { r: 5, i: 12}
assert.equal(len.value, 13)

// bulk-update is deep
let [signals, update] = s
update({ x: 1, y: 1, z: { r: 3, i: 4 } })
assert.equal(xy.value, 2)
assert.equal(len.value, 5, 'len after update')

// object cannot be extended
assert.throws(() => {
  s.w = 1
}, 'not extendible')

// cannot create from primitive
assert.throws(() => {
  signalStruct(2)
}, 'not supported')


// re-initializing returns itself
let s1 = signalStruct(s)
assert.equal(s, s1)