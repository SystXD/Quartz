import { createLogger, ILogger } from '@quartz/lib/logger/logger'
import consola from 'consola'

 class DefaultLogger implements ILogger {
    log(message: string, meta?: Record<string, unknown>): void {
        consola.log(message, meta);
    }
    error(message: string, meta?: Record<string, unknown>): void {
        consola.error(message, meta);
    }
    warn(message: string, meta?: Record<string, unknown>): void {
        consola.warn(message, meta);
    }
    info(message: string, meta?: Record<string, unknown>): void {
        consola.info(message, meta);
    }
}


export const logger = createLogger({ provider: new DefaultLogger() });
