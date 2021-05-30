import { ReschedulingTimerWheel } from '../src/ReschedulingTimerWheel';

describe('ReschedulingTimerWheel', function() {
	describe('Rescheduling', function() {
		it('Can reschedule', function() {
			const wheel = new ReschedulingTimerWheel<string>();
			wheel.schedule('test', 1000);
			wheel.schedule('test', 5000);

			const expired1 = wheel.advance(1070);
			expect(expired1).toEqual([]);

			const expired2 = wheel.advance(10000);
			expect(expired2).toEqual([ 'test' ]);
		});
	});

	describe('Removal', function() {
		it('Can remove', function() {
			const wheel = new ReschedulingTimerWheel<string>();
			wheel.schedule('test', 1000);

			wheel.unschedule('test');

			const expired = wheel.advance(10000);
			expect(expired).toEqual([]);
		});

		it('Can remove rescheduled', function() {
			const wheel = new ReschedulingTimerWheel<string>();
			wheel.schedule('test', 1000);

			const handle = wheel.schedule('test', 5000);
			handle.remove();

			const expired = wheel.advance(10000);
			expect(expired).toEqual([]);
		});


		it('Removing replaced items does not remove rescheduled', function() {
			const wheel = new ReschedulingTimerWheel<string>();
			const handle = wheel.schedule('test', 1000);

			wheel.schedule('test', 5000);

			handle.remove();

			const expired = wheel.advance(10000);
			expect(expired).toEqual([ 'test' ]);
		});
	});
});
