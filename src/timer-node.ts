import { Action } from './action';

export class TimerNode {
	public action: Action;

	public next: this;
	public previous: this;

	public time: number;

	constructor(action: Action) {
		this.action = action;

		this.previous = this;
		this.next = this;

		this.time = Number.MAX_SAFE_INTEGER;
	}

	public remove() {
		this.previous.next = this.next;
		this.next.previous = this.previous;
		this.next = this.previous = this;
	}

	public appendToTail(head: this) {
		const tail = head.previous;
		head.previous = this;
		tail.next = this;
		this.next = head;
		this.previous = tail;
	}

	public moveToTail(head: this) {
		this.remove();
		this.appendToTail(head);
	}
}
