/**
 * Handle representing a scheduled action.
 */
export interface ActionHandle {
	/**
	 * Remove this scheduled action, meaning it will no longer be run.
	 */
	remove(): void;
}
