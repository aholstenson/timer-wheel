/**
 * Handle representing something scheduled in a wheel.
 */
export interface TimerHandle {
	/**
	 * Remove the scheduled thing, meaning it will no longer be run.
	 */
	remove(): void;
}
