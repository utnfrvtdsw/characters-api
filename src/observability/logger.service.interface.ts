export type LogContext = Record<string, unknown>;

export interface LogMethod {
  (message: string): void;
  (context: LogContext, message?: string): void;
}

export interface LoggerService {
  trace: LogMethod;
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
  child(context: LogContext): LoggerService;
}
