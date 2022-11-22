# signal-struct

> Structure for storing/handling multiple signals

```js
import SignalStruct from 'signal-struct'
import { computed } from '@preact/signals-core'

let s = SignalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i: signal(3) }
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

// updating internal objects/arrays turns them into signals too
s.z = { r: 5, i: 12}
len.value // 13

// exposes internals for access to signals or bulk update
let [signals, update] = s
update({ x: 1, y: 1 })
xy.value // 2
```

Supported signals: [@preact/signals](https://github.com/preactjs/signals), [usignal](https://www.npmjs.com/package/usignal), [value-ref](https://github.com/dy/value-ref).

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>
