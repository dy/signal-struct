# signal-struct

> Structure for storing/handling multiple signals or reactive values

```js
import signalStruct from 'signal-struct'
import { signal, computed, batch } from '@preact/signals-core'

let s = signalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i: signal(3) },
  get v() { return this.x * this.y }, // computed
});

// subscribes to only x and y without need for .value access
let xy = computed(() => s.x + s.y)
s.x = 2
s.y = 3
xy.value // 5

// subscribes to deep values too: only z.r and z.i update the `len`
let len = computed(() => (s.z.r**2 + s.z.i**2)**0.5)
s.z.r = 3
s.z.i = 4
len.value // 5

// updating internal objects turns them into signals too
s.z = { r: 5, i: 12}
len.value // 13

// update multiple props
batch(() => Object.assign(s, { x: 1, y: 1 }))
xy.value // 2

// getter is computed
s.v // 1

// can subscribe to reactive sources
let s2 = signalStruct({
  p: new Promise(ok => setTimeout(() => ok(123)))
})
s2.p  // null
// ...
s2.p  // 123

// can inherit from proto, including other struct
let s3 = signalStruct({v:456}, s2)
s3.p // 123
s3.v // 456
```

Supported reactive sources: see [sube](https://github.com/dy/sube).
<!--
Supported signals: [@preact/signals](https://github.com/preactjs/signals), [usignal](https://www.npmjs.com/package/usignal), [value-ref](https://github.com/dy/value-ref). -->

## Alternatives

* [deepsignal](https://github.com/luisherranz/deepsignal)
* [@deepsignal/preact](https://github.com/EthanStandel/deepsignal/tree/main/packages/preact)
* [preact-observables](https://github.com/melnikov-s/preact-observables)

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
