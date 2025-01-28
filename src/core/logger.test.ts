// src/core/logger.test.ts
import { logger } from './logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs info messages', () => {
    logger.info('Info message');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'Info message',
      })
    );
  });

  it('logs error messages', () => {
    logger.error('Error message');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        message: 'Error message',
      })
    );
  });

  it('logs warn messages', () => {
    logger.warn('Warn message');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'warn',
        message: 'Warn message',
      })
    );
  });

  it('logs debug messages', () => {
    logger.debug('Debug message');
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug',
        message: 'Debug message',
      })
    );
  });

  it('logs messages with additional options', () => {
    logger.info('Info message with options', { structuredData: true });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
        message: 'Info message with options',
        structuredData: true,
      })
    );
  });

  it('logs messages with timestamp', () => {
    const before = new Date().toISOString();
    logger.info('Info message');
    const after = new Date().toISOString();
    const logCall = consoleLogSpy.mock.calls[0][0];
    expect(logCall.timestamp >= before).toBe(true);
    expect(logCall.timestamp <= after).toBe(true);
  });
});
