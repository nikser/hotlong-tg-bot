import fs from 'fs';
import path from 'path';

interface CacheData<T> {
  timestamp: number;
  data: T;
}

export class FileCache<T> {
  private filePath: string;
  private ttlHours: number;
  private cacheDir: string;

  constructor(fileName: string, ttlHours: number) {
    this.cacheDir = path.join(process.cwd(), 'cache');
    this.filePath = path.join(this.cacheDir, fileName);
    this.ttlHours = ttlHours;
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  load(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        return null;
      }

      const stats = fs.statSync(this.filePath);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

      if (ageHours > this.ttlHours) {
        this.clear();
        return null;
      }

      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading cache:', error);
      return null;
    }
  }

  save(data: T): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  clear(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export class TrassaCache {
  private cacheDir: string;
  private ttlHours: number;

  constructor(ttlHours: number = 24) {
    this.cacheDir = path.join(process.cwd(), 'cache', 'trassa');
    this.ttlHours = ttlHours;
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getFilePath(routeId: string): string {
    return path.join(this.cacheDir, `trassa_${routeId}.json`);
  }

  load(routeId: string, direction: number): any | null {
    const filePath = this.getFilePath(routeId);
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const ageHours = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);

      if (ageHours > this.ttlHours) {
        this.clear(routeId, direction);
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading trassa cache for route ${routeId}:`, error);
      return null;
    }
  }

  save(routeId: string, direction: number, data: any): void {
    const filePath = this.getFilePath(routeId);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error saving trassa cache for route ${routeId}:`, error);
    }
  }

  clear(routeId: string, direction: number): void {
    const filePath = this.getFilePath(routeId);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error clearing trassa cache for route ${routeId}:`, error);
    }
  }

  clearAll(): void {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.error('Error clearing all trassa caches:', error);
    }
  }
} 