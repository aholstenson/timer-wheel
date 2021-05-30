import { ActionTimerWheel } from '../src/ActionTimerWheel';

describe('ActionTimerWheel', function() {
	it('Executes action when expired', function() {
		const wheel = new ActionTimerWheel();

		let run = false;
		wheel.schedule(() => run = true, 200);

		wheel.advance(1070);

		expect(run).toBeTruthy();
	});
});
