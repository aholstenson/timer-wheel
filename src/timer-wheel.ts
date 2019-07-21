import { TimerNode } from './timer-node';
import { Action } from './action';
import { ActionHandle } from './handle';

function toPowerOfN(n: number) {
	return Math.pow(2, Math.ceil(Math.log(n) / Math.LN2));
}

const LAYERS = [
	64,
	64,
	32,
	4,
	1
];
const SPANS = [
	toPowerOfN(1000),
	toPowerOfN(60000),
	toPowerOfN(3600000),
	toPowerOfN(86400000),
	LAYERS[3] * toPowerOfN(86400000),
	LAYERS[3] * toPowerOfN(86400000)
];

const SHIFTS = SPANS.slice(0, SPANS.length-1).map(span => 1 + Math.floor(Math.log(span - 1) * Math.LOG2E));

const NO_OP = () => {};

/**
 * A timer wheel for efficiently managing a large amount of time based actions.
 *
 * Actions can be scheduled using a certain delay in milliseconds:
 *
 * ```javascript
 * const wheel = new TimerWheel();
 * wheel.schedule(functionToRun, 200);
 * ```
 *
 * The wheel must then be advanced to invoke actions:
 *
 * ```javascript
 * wheel.advance();
 * ```
 *
 * This allows users of this class to control when actions are evaluated. This
 * design allows for implementations of such things as expiring cached items
 * just before a get instead of continuously evaluating.
 *
 * Stores items in layers that are circular buffers that represent a time span.
 * This allows for efficiently figuring out what actions need to invoked
 * whenever the wheel is advanced.
 *
 * This implementation takes some extra care to work with Number as they are
 * actually doubles and shifting turns them into 32-bit ints. To represent
 * time we need more than 32-bits so to fully support things this implementation
 * uses a base which is removed from all of the numbers to make them fit into
 * 32-bits.
 *
 * Based on the implementation in the caching library Transitory, which in turn
 * is based on an idea by Ben Manes implemented in Caffeine.
 */
export class TimerWheel {
	private time: number;
	private readonly base: number;
	private readonly layers: TimerNode[][];

	constructor() {
		this.base = Date.now();
		this.layers = LAYERS.map(b => {
			const result = new Array(b);
			for(let i=0; i<b; i++) {
				result[i] = new TimerNode(NO_OP);
			}
			return result;
		});

		this.time = 0;
	}

	/**
	 * Get the local time of this wheel.
	 */
	private get localTime() {
		return Date.now() - this.base;
	}

	private findBucket(node: TimerNode): TimerNode {
		const layers = this.layers;

		const d = node.time - this.time;
		if(d <= 0) return layers[0][0];

		for(let i=0, n=layers.length-1; i<n; i++) {
			if(d >= SPANS[i + 1]) continue;

			const ticks = node.time >>> SHIFTS[i];
			const index = ticks & (layers[i].length - 1);
			return layers[i][index];
		}
		return layers[layers.length - 1][0];
	}

	/**
	 * Advance the wheel, triggering any actions whose delay has passed.
	 *
	 * @param localTime
	 *   optional timestamp used for things such as testing. Represents the
	 *   number of milliseconds passed since this wheel was created.
	 */
	public advance(localTime?: number) {
		const previous = this.time;
		const time = localTime || this.localTime;
		this.time = time;

		const layers = this.layers;

		// Holder for expired keys
		let expired: Action[] | null = null;

		/*
		 * Go through all of the layers on the wheel, evict things and move
		 * other stuff around.
		 */
		for(let i=0, n=SHIFTS.length; i<n; i++) {
			const previousTicks = previous >>> SHIFTS[i];
			const timeTicks = time >>> SHIFTS[i];

			// At the same tick, no need to keep working down the layers
			if(timeTicks <= previousTicks) break;

			const wheel = layers[i];

			// Figure out the actual buckets to use
			let start;
			let end;
			if(time - previous >= SPANS[i + 1]) {
				start = 0;
				end = wheel.length - 1;
			} else {
				start = previousTicks & (SPANS[i] - 1);
				end = timeTicks & (SPANS[i] - 1);
			}

			// Go through all of the buckets and move stuff around
			for(let j=start; j<=end; j++) {
				const head = wheel[j & (wheel.length - 1)];

				let node = head.next;

				head.previous = head;
				head.next = head;

				while(node !== head) {
					const next = node.next;
					node.remove();

					if(node.time <= time) {
						// This node has expired, add it to the queue
						if(! expired) expired = [];
						expired.push(node.action);
					} else {
						// Find a new bucket to put this node in
						const b = this.findBucket(node);
						if(b) {
							node.appendToTail(b);
						}
					}
					node = next;
				}
			}
		}

		if(expired) {
			// Run the expired actions
			for(const action of expired) {
				action();
			}
		}
	}

	/**
	 * Schedule running the given action after the specified delay.
	 */
	public schedule(action: Action, delayInMs: number): ActionHandle {
		const node = new TimerNode(action);
		node.time = this.localTime + delayInMs;

		const parent = this.findBucket(node);

		node.appendToTail(parent);
		return {
			remove() {
				node.remove();
			}
		};
	}
}
