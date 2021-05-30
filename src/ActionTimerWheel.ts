import { Action } from './Action';
import { TimerWheel } from './TimerWheel';

/**
 * Variant of `TimerWheel` that runs actions.
 *
 * ```typescript
 * const wheel = new ActionTimerWheel();
 *
 * wheel.schedule(() => {
 *   // Code to run when expiring
 * }, 8000);
 *
 * // Advance the wheel to run expired actions
 * wheel.advance();
 * ```
 */
export class ActionTimerWheel extends TimerWheel<Action> {
	/**
	 * Advance the wheel, running all actions whose delay has passed.
	 */
	public advance(localTime?: number): Action[] {
		const expired = super.advance(localTime);

		for(const action of expired) {
			action();
		}

		return expired;
	}
}
