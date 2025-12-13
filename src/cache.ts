export interface ICache {
	get(url: string): Promise<Buffer | null | undefined>;
	set(url: string, data: Buffer): Promise<void>;
}

export class MemoryCache implements ICache {
	private cache: Map<string, Buffer> = new Map();

	public async get(url: string): Promise<Buffer | null | undefined> {
		return this.cache.get(url) ?? null;
	}

	public async set(url: string, data: Buffer): Promise<void> {
		this.cache.set(url, data);
		return Promise.resolve();
	}
}

export const memoryCache: ICache = new MemoryCache();
