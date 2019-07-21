# Timer Wheel

[![npm version](https://badge.fury.io/js/timer-wheel.svg)](https://badge.fury.io/js/timer-wheel)
[![Build Status](https://travis-ci.org/aholstenson/timer-wheel.svg?branch=master)](https://travis-ci.org/aholstenson/timer-wheel)
[![Coverage Status](https://coveralls.io/repos/aholstenson/timer-wheel/badge.svg)](https://coveralls.io/github/aholstenson/timer-wheel)
[![Dependencies](https://david-dm.org/aholstenson/timer-wheel.svg)](https://david-dm.org/aholstenson/timer-wheel)

`timer-wheel` is a JavaScript library for efficiently managing a large amount
of timed actions. It allows you to schedule actions after a certain delay and
then control when to advance and run actions where the delay has passed.

This implementation is designed for larger delays and has a minimum delay of
1000 ms.

```javascript
import { TimerWheel } from 'timer-wheel';

const wheel = new TimerWheel();
wheel.schedule(() => {
  console.log('Action invoked');
}, 1500 /* ms */)

// Call `advance()` to advance the wheel and run actions
setInterval(() => {
  wheel.advance();
}, 1000);
```

This library is useful for things like expiring caches with lazy expiration,
instead of checking if every cache item should be expired use a wheel to queue
removal actions and call `advance` before every get/set. This is how
[Transitory](https://github.com/aholstenson/transitory) implements expiring
caches.
