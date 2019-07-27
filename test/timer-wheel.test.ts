import { TimerWheel } from '../src/timer-wheel';

describe('TimerWheel', function() {
	it('Schedule', function() {
		const wheel = new TimerWheel<string>();
		wheel.schedule('test', 10);
	});

	describe('Expiration', function() {
		it('Expire in 0 ms @ 1.07 seconds', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 0);

			const expired = wheel.advance(1070);
			expect(expired).toEqual([ '0' ]);
		});

		it('Expire in 200 ms @ 500 ms', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 200);

			const expired = wheel.advance(500);
			expect(expired).toEqual([]);
		});

		it('Expire in 200 ms @ 1.07 seconds', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 200);

			const expired = wheel.advance(1070);
			expect(expired).toEqual([ '0' ]);
		});

		it('Expire in 2 seconds @ 1.07 seconds', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2000);

			const expired = wheel.advance(1024);
			expect(expired).toEqual([]);
		});

		it('Expire in 2 seconds @ 4 seconds', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2000);

			const expired = wheel.advance(4000);
			expect(expired).toEqual([ '0' ]);
		});

		it('Expire in 2 minutes @ 1 minute', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2*60*1000);

			const expired = wheel.advance(60*1000);
			expect(expired).toEqual([]);
		});

		it('Expire in 2 minutes @ 3 minutes', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2*60*1000);

			const expired = wheel.advance(3*60*1000);
			expect(expired).toEqual([ '0' ]);
		});

		it('Expire in 2 minutes @ 1 minute and, 3 minutes', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2*60*1000);

			const expired1 = wheel.advance(1*60*1000);
			expect(expired1).toEqual([]);

			const expired2 = wheel.advance(3*60*1000);
			expect(expired2).toEqual([ '0' ]);
		});

		it('Expire in 2 minutes @ 1 minute, 1 minute-10seconds and 2 minutes', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 2*60*1000);

			const expired1 = wheel.advance(1*60*1000);
			expect(expired1).toEqual([]);
			const expired2 = wheel.advance(2*60*1000-10000);
			expect(expired2).toEqual([]);

			const expired3 = wheel.advance(2*60*1001);
			expect(expired3).toEqual([ '0' ]);
		});

		it('Expire in 92 minutes @ 1 minute, 80 minutes and 93 minutes', function() {
			const wheel = new TimerWheel<string>();

			wheel.schedule('0', 92*60*1000);

			const expired1 = wheel.advance(1*60*1000);
			expect(expired1).toEqual([]);

			const expired2 = wheel.advance(1*80*1000);
			expect(expired1).toEqual([]);

			const expired3 = wheel.advance(93*60*1000);
			expect(expired3).toEqual([ '0' ]);
		});
	});

	describe('Removal', function() {
		it('Can remove scheduled action', function() {
			const wheel = new TimerWheel<string>();

			const handle = wheel.schedule('0', 500);

			handle.remove();

			const expired = wheel.advance(2000);
			expect(expired).toEqual([]);
		});

		it('Can remove executed action', function() {
			const wheel = new TimerWheel<string>();

			const handle = wheel.schedule('0', 500);

			const expired = wheel.advance(2000);
			expect(expired).toEqual([ '0' ]);

			handle.remove();
		});
	});
});
