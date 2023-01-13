
import signalStruct from './signal-struct.js'
import { signal, computed, effect, batch } from '@preact/signals-core'
// import { signal, computed, effect, batch } from 'usignal/sync'
import assert from 'node:assert'

let i = signal(3)
let s = signalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i },
  v: function(){return 1},
  w: [1,2],
  get xy () { return this.x + this.y },
  set xy ([x,y]) { return this.x = x, this.y = y }
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

// getters are computed
assert.equal(s.xy, 6)
s.xy = [4,2]
assert.equal(s.x, 4)
assert.equal(s.y, 2)
assert.equal(s.xy, 6)

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
// i.value = 20
// assert.equal(len.value, 13)

// updating array is fine
let mult = computed(() => s.w[0] * s.w[1])
assert.equal(mult.value, 2)
s.w = [3,4]
assert.equal(mult.value,12)

// nullifying is fine
s.w = null

// bulk-update is deep
// let [signals, update] = s
// update({ x: 1, y: 1, z: { r: 3, i: 4 } })
batch(() => Object.assign(s, { x: 1, y: 1, z: { r: 3, i: 4 } }))
assert.equal(xy.value, 2)
assert.equal(len.value, 5, 'len after update')

// signals retain same type as init data
assert.equal(s.constructor, Object)

// object cannot be extended
// assert.throws(() => {
//   s.r = 1
// }, 'not extendible')

// cannot create from primitive
// assert.throws(() => {
//   signalStruct(2)
// }, 'not supported')

// re-initializing returns itself
let s1 = signalStruct(s)
assert.equal(s, s1)


// it is not enumerable
let s2 = signalStruct([])
let log = []
for (let i of s2) log.push(i)
assert.deepEqual(log, [], 'doesn\'t iterate')


// descendants are detected as instances
let s3 = Object.create(s1), s3s = signalStruct(s3)
assert.equal(s3, s3s)


// can subscribe to reactive sources too
let s4 = signalStruct({
  p: new Promise(ok => setTimeout(() => ok(123)))
})
assert.equal(s4.p, undefined)
setTimeout(() => {
  assert.equal(s4.p, 123)
})

let s43 = signalStruct(s4,s3)
setTimeout(() => {
  assert.equal(s43.p,123)
  assert.equal(s43.y,1)
})


// arrays get each item converted to signal struct
let s5 = signalStruct({list: [{x:1}, {x:2}]})
let sum = computed(()=> s5.list.reduce((sum, item)=>item.x + sum, 0))
assert.equal(sum.value, 3)
s5.list[0].x = 2
assert.equal(sum.value, 4)
console.log('set array value')
s5.list = [{x:3}, {x:3}]
assert.equal(sum.value, 6)
s5.list = [{x:3}, {x:3}, {x:4}]
assert.equal(sum.value, 10)

// arrays retain reference
let list = [1,2,3]
let s6 = signalStruct({list})
s6.list[1] = 4
assert.deepEqual(list,[1,4,3])