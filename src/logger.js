// @flow

type LogLevel = 0 | 1;
const logLevels: { [key: string]: LogLevel } = {
    normal: 0,
    verbose: 1
};

export default class Logger {
    file: string;
    level: LogLevel;

    constructor(file: string) {
        this.file = file;
        this.setLogLevel();
    }

    setLogLevel() {
        const LOG_LEVEL = process.env.LOG_LEVEL || 'normal';
        if (Object.keys(logLevels).indexOf(LOG_LEVEL) > -1) {
            this.level = logLevels[LOG_LEVEL];
        } else {
            const allowed = Object.keys(logLevels).join(', ');
            throw new Error(`Invalid value for process.env.LOG_LEVEL. Value must be one of ${allowed}`);
        }
    }

    log = (message: string, logLevel: $Keys<typeof logLevels> = 'normal') => {
        const level = logLevels[logLevel];
        if (level <= this.level) {
            console.log(`**${this.file}: ${message}**`);
        }
    };
}
