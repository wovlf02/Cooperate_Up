const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'];

function formatLog(level, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return [prefix, ...args];
}

export const logger = {
  debug: (...args) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log(...formatLog('debug', ...args));
    }
  },
  
  info: (...args) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log(...formatLog('info', ...args));
    }
  },
  
  warn: (...args) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn(...formatLog('warn', ...args));
    }
  },
  
  error: (...args) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error(...formatLog('error', ...args));
    }
  }
};
