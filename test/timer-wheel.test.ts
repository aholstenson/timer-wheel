import { TimerWheel } from '../src/timer-wheel';
import { Action } from '../src/action';

const NO_OP = () => {};

function counter(): { count: number, action: Action } {
	let count = 0;
	return {
		get count() {
			return count;
		},

		action() {
			count++;
		}
	};
}

describe('TimerWheel', function() {
	it('Schedule', function() {
		const wheel = new TimerWheel();
		wheel.schedule(NO_OP, 10);
	});

	describe('Expiration', function() {
		it('Expire in 200 ms @ 500 ms', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 200);

			wheel.advance(500);
			expect(helper.count).toEqual(0);
		});

		it('Expire in 200 ms @ 1.07 seconds', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 200);

			wheel.advance(1070);
			expect(helper.count).toEqual(1);
		});

		it('Expire in 2 seconds @ 1.07 seconds', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2000);

			wheel.advance(1024);
			expect(helper.count).toEqual(0);
		});

		it('Expire in 2 seconds @ 4 seconds', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2000);

			wheel.advance(4000);
			expect(helper.count).toEqual(1);
		});

		it('Expire in 2 minutes @ 1 minute', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2*60*1000);

			wheel.advance(60*1000);
			expect(helper.count).toEqual(0);
		});

		it('Expire in 2 minutes @ 3 minutes', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2*60*1000);

			wheel.advance(3*60*1000);
			expect(helper.count).toEqual(1);
		});

		it('Expire in 2 minutes @ 1 minute and, 3 minutes', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2*60*1000);

			wheel.advance(1*60*1000);
			expect(helper.count).toEqual(0);

			wheel.advance(3*60*1000);
			expect(helper.count).toEqual(1);
		});

		it('Expire in 2 minutes @ 1 minute, 1 minute-10seconds and 2 minutes', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 2*60*1000);

			wheel.advance(1*60*1000);
			expect(helper.count).toEqual(0);
			wheel.advance(2*60*1000-10000);
			expect(helper.count).toEqual(0);

			wheel.advance(2*60*1001);

			expect(helper.count).toEqual(1);
		});

		it('Expire in 92 minutes @ 1 minute, 80 minutes and 93 minutes', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			wheel.schedule(helper.action, 92*60*1000);

			wheel.advance(1*60*1000);
			expect(helper.count).toEqual(0);

			wheel.advance(1*80*1000);
			expect(helper.count).toEqual(0);

			wheel.advance(93*60*1000);
			expect(helper.count).toEqual(1);
		});
	});

	describe('Removal', function() {
		it('Can remove scheduled action', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			const handle = wheel.schedule(helper.action, 500);

			handle.remove();

			wheel.advance(2000);
			expect(helper.count).toEqual(0);
		});

		it('Can remove executed action', function() {
			const wheel = new TimerWheel();

			const helper = counter();
			const handle = wheel.schedule(helper.action, 500);

			wheel.advance(2000);
			expect(helper.count).toEqual(1);

			handle.remove();
		});
	});
});
