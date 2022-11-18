# signal-struct

> Structure for storing/handling multiple signals

```js
import signalStruct from 'signal-struct'
import { signal, computed } from '@preact/singals'

// define signal lib to use
signalStruct.signal = signal

let s = signalStruct({
  x: 0,
  y: signal(1),
  z: { r: 2, i: signal(3) }
});

// subscribes to only x and y without need for .value access
let xy = computed(() => s.x + s.y)
s.x = 2
s.y = 3
xy.value // 5

// subscribes to deep values too: only z.r and z.i update result
let len = computed(() => (s.z.r**2 + s.z.i**2)**0.5)
s.z.r = 3
s.z.i = 4
len.value // 5
```

Supported signals: [@preact/signals](https://github.com/preactjs/signals), [usignal](https://www.npmjs.com/package/usignal), [value-ref](https://github.com/dy/value-ref).

<p align="center"><a href="https://github.com/krsnzd/license/">🕉</a></p>