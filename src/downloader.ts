import { type ICache, memoryCache } from "./cache";
import { Semaphore } from "./helpers";
import { scraperLogger } from "./logger";

const logger = scraperLogger.child({
	downloader: "Downloader",
});

export abstract class Downloader {
	protected cache: ICache = memoryCache;

	abstract download(url: string): Promise<Buffer>;
}

export class FetchDownloader extends Downloader {
	private readonly semaphore: Semaphore;

	constructor({
		maxConcurrentDownloads = 10,
	}: { maxConcurrentDownloads?: number } = {}) {
		super();
		this.semaphore = new Semaphore(maxConcurrentDownloads);
	}

	public async download(url: string): Promise<Buffer> {
		const cached = await this.cache.get(url);
		if (cached) {
			return cached;
		}

		return await this.semaphore.with(async () => {
			logger.info({ url }, "Downloading URL");

			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			await this.cache.set(url, buffer);

			return buffer;
		});
	}
}

export const fetchDownloader: Downloader = new FetchDownloader();
