export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number,
	maxDelay: number = delay,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let maxTimeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastArgs: Parameters<T> | undefined;
	let firstCallTime: number | undefined;

	return (...args: Parameters<T>) => {
		lastArgs = args;

		// Clear the regular delay timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Set first call time if this is the first call
		if (firstCallTime === undefined) {
			firstCallTime = Date.now();

			// Set max delay timeout - ensures function executes after maxDelay even if continuously called
			maxTimeoutId = setTimeout(() => {
				if (lastArgs) {
					fn(...lastArgs);
				}
				timeoutId = undefined;
				maxTimeoutId = undefined;
				firstCallTime = undefined;
				lastArgs = undefined;
			}, maxDelay);
		}

		// Set regular delay timeout - executes if no calls for 'delay' ms
		timeoutId = setTimeout(() => {
			// Clear max timeout since we're executing now
			if (maxTimeoutId) {
				clearTimeout(maxTimeoutId);
			}
			if (lastArgs) {
				fn(...lastArgs);
			}
			timeoutId = undefined;
			maxTimeoutId = undefined;
			firstCallTime = undefined;
			lastArgs = undefined;
		}, delay);
	};
}

export function lazy<T>(fn: () => T): () => T {
	let value: T | undefined;
	return () => {
		if (value === undefined) {
			value = fn();
		}
		return value;
	};
}

export class Mutex {
	private locked = false;

	public async acquire(): Promise<void> {
		while (this.locked) {
			await new Promise((resolve) => setImmediate(resolve));
		}
		this.locked = true;
	}

	public async release(): Promise<void> {
		this.locked = false;
	}

	public async with<T>(fn: () => Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await fn();
		} finally {
			this.release();
		}
	}
}

export class Semaphore {
	private current: number;
	private maxCount: number;

	constructor(maxCount: number, current = 0) {
		this.current = current;
		this.maxCount = maxCount;
	}

	public async acquire(): Promise<void> {
		while (this.current >= this.maxCount) {
			await new Promise((resolve) => setImmediate(resolve));
		}
		this.current++;
	}

	public async release(): Promise<void> {
		this.current--;
	}

	public async with<T>(fn: () => Promise<T>): Promise<T> {
		await this.acquire();
		try {
			return await fn();
		} finally {
			this.release();
		}
	}
}
