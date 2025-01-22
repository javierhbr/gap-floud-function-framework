type LogLevel = 'info' | 'error' | 'warn' | 'debug';

interface LogOptions {
  structuredData?: boolean;
  [key: string]: boolean | string | number | object | undefined;
}

class Logger {
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      ...options,
    };

    switch (level) {
      case 'error':
        console.error(logData);
        break;
      case 'warn':
        console.warn(logData);
        break;
      case 'debug':
        console.debug(logData);
        break;
      default:
        console.log(logData);
    }
  }

  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  error(message: string, options?: LogOptions): void {
    this.log('error', message, options);
  }

  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }
}

export const logger = new Logger();
