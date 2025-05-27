import fs from 'fs';
import path from 'path';

interface CacheData<T> {
  timestamp: number;
  data: T;
}

export class FileCache<T> {
  private readonly cacheFile: string;
  private readonly ttlMs: number;

  constructor(filename: string, ttlHours: number = 1) {
    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir);
    }

    this.cacheFile = path.join(cacheDir, filename);
    this.ttlMs = ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  public save(data: T): void {
    const cacheData: CacheData<T> = {
      timestamp: Date.now(),
      data
    };

    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(cacheData), 'utf8');
      console.log(`Cache saved to ${this.cacheFile}`);
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  public load(): T | null {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        return null;
      }

      const fileContent = fs.readFileSync(this.cacheFile, 'utf8');
      const cacheData: CacheData<T> = JSON.parse(fileContent);

      // Check if cache is expired
      if (Date.now() - cacheData.timestamp > this.ttlMs) {
        console.log('Cache expired, deleting file...');
        fs.unlinkSync(this.cacheFile);
        return null;
      }

      console.log(`Cache loaded from ${this.cacheFile}`);
      return cacheData.data;
    } catch (error) {
      console.error('Error loading cache:', error);
      return null;
    }
  }

  public clear(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
        console.log(`Cache cleared: ${this.cacheFile}`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
} 