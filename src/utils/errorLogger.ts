/**
 * Global error logging utility
 * Provides centralized error tracking and logging for the entire app
 * Persists errors to localStorage to survive restarts
 */

export interface ErrorLog {
  timestamp: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  source: string;
  stack?: string;
  context?: Record<string, unknown>;
}

const STORAGE_KEY = 'eclipse_error_logs';
const MAX_STORED_LOGS = 500; // Store more in localStorage than in memory

class ErrorLogger {
  private logs: ErrorLog[] = [];
  private readonly MAX_LOGS = 100;
  private initialized = false;

  constructor() {
    this.loadFromStorage();
    this.initialized = true;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ErrorLog[];
        this.logs = parsed.slice(-this.MAX_LOGS);
      }
    } catch (e) {
      console.error('Failed to load error logs from localStorage:', e);
    }
  }

  private persistToStorage(): void {
    try {
      // Get existing logs from storage and merge with current logs
      const stored = localStorage.getItem(STORAGE_KEY);
      let allLogs: ErrorLog[] = [];
      
      if (stored) {
        try {
          allLogs = JSON.parse(stored) as ErrorLog[];
        } catch {
          allLogs = [];
        }
      }
      
      // Merge and deduplicate by timestamp
      const merged = [...allLogs, ...this.logs];
      const unique = Array.from(
        new Map(merged.map(log => [log.timestamp, log])).values()
      );
      
      // Keep only recent logs
      const recent = unique.slice(-MAX_STORED_LOGS);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch (e) {
      // If localStorage fails, log to console but don't throw
      console.error('Failed to persist error logs to localStorage:', e);
    }
  }

  log(
    message: string,
    type: 'error' | 'warning' | 'info' = 'error',
    source: string = 'Unknown',
    stack?: string,
    context?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      type,
      source,
      stack,
      context,
    };

    this.logs.push(errorLog);

    // Keep only recent logs to prevent memory leak
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }

    // Persist to localStorage
    if (this.initialized) {
      this.persistToStorage();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const style = `color: ${
        type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffd93d' : '#6bcf7f'
      }; font-weight: bold;`;
      console.log(`%c[${type.toUpperCase()}] ${source}`, style, message);
      if (stack) {
        console.log('%cStack Trace:', 'color: #888; font-style: italic;');
        console.log(stack);
      }
      if (context) {
        console.log('%cContext:', 'color: #888; font-style: italic;', context);
      }
    }
  }

  error(
    message: string,
    source: string = 'Unknown',
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log(message, 'error', source, error?.stack, context);
  }

  warning(message: string, source: string = 'Unknown', context?: Record<string, unknown>): void {
    this.log(message, 'warning', source, undefined, context);
  }

  info(message: string, source: string = 'Unknown', context?: Record<string, unknown>): void {
    this.log(message, 'info', source, undefined, context);
  }

  getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): ErrorLog[] {
    return this.logs.slice(-count);
  }

  clear(): void {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear error logs from localStorage:', e);
    }
  }

  getErrorReport(): string {
    return this.logs
      .map(
        log =>
          `[${log.timestamp}] ${log.type.toUpperCase()} - ${log.source}: ${log.message}${
            log.stack ? '\n' + log.stack : ''
          }`
      )
      .join('\n\n');
  }

  getAllStoredLogs(): ErrorLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as ErrorLog[];
      }
    } catch (e) {
      console.error('Failed to get all stored logs:', e);
    }
    return [];
  }

  getFullErrorReport(): string {
    const allLogs = this.getAllStoredLogs();
    return allLogs
      .map(
        log =>
          `[${log.timestamp}] ${log.type.toUpperCase()} - ${log.source}: ${log.message}${
            log.stack ? '\n' + log.stack : ''
          }${log.context ? '\nContext: ' + JSON.stringify(log.context, null, 2) : ''}`
      )
      .join('\n\n');
  }
}

export const errorLogger = new ErrorLogger();

// Make it globally accessible in development
if (process.env.NODE_ENV === 'development') {
  (window as any).__errorLogger = errorLogger;
}
